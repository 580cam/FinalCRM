"use client";
import React from "react";
import AddressAutocompleteInput from "@/components/quote/AddressAutocompleteInput";
import {
  type ServiceTypeOption,
  type LocationDetailsState,
  type StairsOption,
  type WalkDistanceOption,
  STAIRS_OPTIONS,
  WALK_DISTANCE_OPTIONS,
  type StopTypeOption,
  STOP_TYPE_OPTIONS,
} from "@/components/quote/types";
import type { MoveDetailsState } from "@/components/quote/MoveDetailsStep";

type Props = {
  serviceType: ServiceTypeOption;
  moveDetails: MoveDetailsState;
  value: LocationDetailsState;
  onChange: (patch: Partial<LocationDetailsState>) => void;
  slide?: 1 | 2; // for dual-address flows
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h4 className="text-lg font-semibold">{title}</h4>
      {children}
    </div>
  );
}

function TileGroup<T extends string>({
  label,
  options,
  selected,
  onSelect,
  ariaLabel,
  columns = 3,
}: {
  label: string;
  options: readonly T[];
  selected?: T;
  onSelect: (val: T) => void;
  ariaLabel: string;
  columns?: 2 | 3 | 4;
}) {
  const gridCols = columns === 4 ? "grid-cols-4" : columns === 2 ? "grid-cols-2" : "grid-cols-3";
  return (
    <Section title={label}>
      <div className={`grid ${gridCols} gap-3 mt-2`} role="group" aria-label={ariaLabel}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            aria-pressed={selected === opt}
            onClick={() => onSelect(opt)}
            className={[
              "rounded-xl border px-3 py-3 text-sm font-medium text-left transition",
              selected === opt ? "border-black bg-black text-white shadow" : "border-gray-300 bg-white hover:border-gray-400",
            ].join(" ")}
          >
            {opt}
          </button>
        ))}
      </div>
    </Section>
  );
}

export default function LocationDetailsStep({ serviceType, moveDetails, value, onChange, slide = 1 }: Props) {
  const isJunk = serviceType === "Junk Removal";
  const isLabor = serviceType === "Moving Labor";
  const singleLabor = moveDetails.laborType === "Load-Only" || moveDetails.laborType === "Unload-Only" || moveDetails.laborType === "Restaging / In-Home";
  const isSingleAddress = isJunk || (isLabor && singleLabor);

  const updateFrom = (patch: Partial<LocationDetailsState["from"]>) => onChange({ from: { ...(value.from ?? {}), ...patch } });
  const updateTo = (patch: Partial<LocationDetailsState["to"]>) => onChange({ to: { ...(value.to ?? {}), ...patch } });
  const updateStop = (patch: Partial<LocationDetailsState["additionalStop"]>) => onChange({ additionalStop: { ...(value.additionalStop ?? {}), ...patch } });

  type AddressBlockCfg = {
    scope: "Service" | "From" | "To" | "Additional Stop";
    addressVal?: string;
    unitVal?: string;
    stairs?: StairsOption;
    walkDistance?: WalkDistanceOption;
    onAddress: (v: string) => void;
    onUnit: (v: string) => void;
    onStairs: (v: StairsOption) => void;
    onWalk: (v: WalkDistanceOption) => void;
  };

  const renderAddressBlock = ({
    scope,
    addressVal,
    unitVal,
    stairs,
    walkDistance,
    onAddress,
    onUnit,
    onStairs,
    onWalk,
  }: AddressBlockCfg) => (
    <>
      <div className="mt-2" role="group" aria-label={`${scope} Address Section`}>
        <AddressAutocompleteInput
          value={addressVal}
          onChange={onAddress}
          placeholder="Start typing address"
          ariaLabel={`${scope} Address`}
        />
        <input
          type="text"
          value={unitVal ?? ""}
          onChange={(e) => onUnit(e.target.value)}
          placeholder="Apt/Suite/Unit (optional)"
          aria-label={`${scope} Unit`}
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <TileGroup
        label="Stairs"
        options={STAIRS_OPTIONS}
        selected={stairs}
        onSelect={onStairs}
        ariaLabel={`${scope} Stairs`}
        columns={3}
      />
      <TileGroup
        label="Walk Distance"
        options={WALK_DISTANCE_OPTIONS}
        selected={walkDistance}
        onSelect={onWalk}
        ariaLabel={`${scope} Walk Distance`}
        columns={3}
      />
    </>
  );

  return (
    <div>
      <h3 className="text-xl font-semibold">Step 3: Location Details</h3>
      <p className="text-gray-700 mt-1">Add address details. Use autocomplete and select stairs and walk distances.</p>

      {isSingleAddress ? (
        <>
          <Section title="Service Address">
            {renderAddressBlock({
              scope: "Service",
              addressVal: value.from?.address,
              unitVal: value.from?.unit,
              stairs: value.from?.stairs,
              walkDistance: value.from?.walkDistance,
              onAddress: (v) => updateFrom({ address: v }),
              onUnit: (v) => updateFrom({ unit: v }),
              onStairs: (v) => updateFrom({ stairs: v }),
              onWalk: (v) => updateFrom({ walkDistance: v }),
            })}
          </Section>
          {/* Multiple stops on last (only) slide */}
          <div className="mt-4" role="group" aria-label="Multiple Stops">
            <label className="inline-flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-gray-300"
                checked={Boolean(value.hasMultipleStops)}
                onChange={() => onChange({ hasMultipleStops: !value.hasMultipleStops })}
                aria-label="Multiple stops"
              />
              <span className="text-sm text-gray-800">
                <span className="font-medium">Multiple stops?</span>
                <span className="ml-2 text-gray-600">Add an extra pickup or dropoff location</span>
              </span>
            </label>
          </div>
          {value.hasMultipleStops && (
            <>
              <Section title="Additional Stop">
                {renderAddressBlock({
                  scope: "Additional Stop",
                  addressVal: value.additionalStop?.address,
                  unitVal: value.additionalStop?.unit,
                  stairs: value.additionalStop?.stairs,
                  walkDistance: value.additionalStop?.walkDistance,
                  onAddress: (v) => updateStop({ address: v }),
                  onUnit: (v) => updateStop({ unit: v }),
                  onStairs: (v) => updateStop({ stairs: v }),
                  onWalk: (v) => updateStop({ walkDistance: v }),
                })}
                <TileGroup<StopTypeOption>
                  label="Stop Type"
                  options={STOP_TYPE_OPTIONS}
                  selected={value.additionalStop?.stopType}
                  onSelect={(v) => updateStop({ stopType: v })}
                  ariaLabel="Additional Stop Type"
                  columns={2}
                />
              </Section>
            </>
          )}
        </>
      ) : (
        <>
          {slide === 1 && (
            <Section title="Moving FROM">
              {renderAddressBlock({
                scope: "From",
                addressVal: value.from?.address,
                unitVal: value.from?.unit,
                stairs: value.from?.stairs,
                walkDistance: value.from?.walkDistance,
                onAddress: (v) => updateFrom({ address: v }),
                onUnit: (v) => updateFrom({ unit: v }),
                onStairs: (v) => updateFrom({ stairs: v }),
                onWalk: (v) => updateFrom({ walkDistance: v }),
              })}
            </Section>
          )}

          {slide === 2 && (
            <>
              <Section title="Moving TO">
                {renderAddressBlock({
                  scope: "To",
                  addressVal: value.to?.address,
                  unitVal: value.to?.unit,
                  stairs: value.to?.stairs,
                  walkDistance: value.to?.walkDistance,
                  onAddress: (v) => updateTo({ address: v }),
                  onUnit: (v) => updateTo({ unit: v }),
                  onStairs: (v) => updateTo({ stairs: v }),
                  onWalk: (v) => updateTo({ walkDistance: v }),
                })}
              </Section>
              {/* Multiple stops on last slide */}
              <div className="mt-4" role="group" aria-label="Multiple Stops">
                <label className="inline-flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-gray-300"
                    checked={Boolean(value.hasMultipleStops)}
                    onChange={() => onChange({ hasMultipleStops: !value.hasMultipleStops })}
                    aria-label="Multiple stops"
                  />
                  <span className="text-sm text-gray-800">
                    <span className="font-medium">Multiple stops?</span>
                    <span className="ml-2 text-gray-600">Add an extra pickup or dropoff location</span>
                  </span>
                </label>
              </div>
              {value.hasMultipleStops && (
                <>
                  <Section title="Additional Stop">
                    {renderAddressBlock({
                      scope: "Additional Stop",
                      addressVal: value.additionalStop?.address,
                      unitVal: value.additionalStop?.unit,
                      stairs: value.additionalStop?.stairs,
                      walkDistance: value.additionalStop?.walkDistance,
                      onAddress: (v) => updateStop({ address: v }),
                      onUnit: (v) => updateStop({ unit: v }),
                      onStairs: (v) => updateStop({ stairs: v }),
                      onWalk: (v) => updateStop({ walkDistance: v }),
                    })}
                    <TileGroup<StopTypeOption>
                      label="Stop Type"
                      options={STOP_TYPE_OPTIONS}
                      selected={value.additionalStop?.stopType}
                      onSelect={(v) => updateStop({ stopType: v })}
                      ariaLabel="Additional Stop Type"
                      columns={2}
                    />
                  </Section>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
