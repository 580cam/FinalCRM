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
} from "@/components/quote/types";
import type { MoveDetailsState } from "@/components/quote/MoveDetailsStep";

type Props = {
  serviceType: ServiceTypeOption;
  moveDetails: MoveDetailsState;
  value: LocationDetailsState;
  onChange: (patch: Partial<LocationDetailsState>) => void;
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

export default function LocationDetailsStep({ serviceType, moveDetails, value, onChange }: Props) {
  const isJunk = serviceType === "Junk Removal";
  const isLabor = serviceType === "Moving Labor";
  const singleLabor = moveDetails.laborType === "Load-Only" || moveDetails.laborType === "Unload-Only" || moveDetails.laborType === "Restaging / In-Home";
  const isSingleAddress = isJunk || (isLabor && singleLabor);

  const updateFrom = (patch: Partial<LocationDetailsState["from"]>) => onChange({ from: { ...(value.from ?? {}), ...patch } });
  const updateTo = (patch: Partial<LocationDetailsState["to"]>) => onChange({ to: { ...(value.to ?? {}), ...patch } });

  type AddressBlockCfg = {
    scope: "Service" | "From" | "To";
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
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
