"use client";
import React from "react";
import type { AdditionalInfoState } from "@/components/quote/types";
import {
  type ConditionalFollowUpsState,
  PACKING_LEVEL_OPTIONS,
  type PackingLevelOption,
  PIANO_TYPE_OPTIONS,
  type PianoTypeOption,
  GUN_SAFE_WEIGHT_OPTIONS,
  type GunSafeWeightOption,
  type StorageDurationType,
} from "@/components/quote/types";

type Props = {
  additionalInfo: AdditionalInfoState;
  value: ConditionalFollowUpsState;
  onChange: (patch: Partial<ConditionalFollowUpsState>) => void;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h4 className="text-lg font-semibold">{title}</h4>
      {children}
    </div>
  );
}

function TileOption<T extends string>({
  label,
  selected,
  onSelect,
}: {
  label: T;
  selected: boolean;
  onSelect: (value: T) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(label)}
      className={[
        "rounded-xl border px-3 py-3 text-sm font-medium text-left transition",
        selected ? "border-black bg-black text-white shadow" : "border-gray-300 bg-white hover:border-gray-400",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export default function ConditionalFollowUpsStep({ additionalInfo, value, onChange }: Props) {
  const showPacking = Boolean(additionalInfo.packingOrCrating);
  const showPiano = Boolean(additionalInfo.piano);
  const showGunSafe = Boolean(additionalInfo.gunSafe);
  const showAntique = Boolean(additionalInfo.antiqueArtwork);
  const showStorage = Boolean(additionalInfo.storageNeeded);
  const showBulky = Boolean(additionalInfo.bulkyItem);

  const renderPacking = () => {
    if (!showPacking) return null;
    return (
      <Section title="Packing">
        <div className="grid grid-cols-3 gap-3 mt-2" role="group" aria-label="Packing Level">
          {PACKING_LEVEL_OPTIONS.map((opt) => (
            <TileOption<PackingLevelOption>
              key={opt}
              label={opt}
              selected={value.packingLevel === opt}
              onSelect={(v) => onChange({ packingLevel: v })}
            />
          ))}
        </div>
      </Section>
    );
  };

  const renderPiano = () => {
    if (!showPiano) return null;
    return (
      <Section title="Piano">
        <div className="grid grid-cols-3 gap-3 mt-2" role="group" aria-label="Piano Type">
          {PIANO_TYPE_OPTIONS.map((opt) => (
            <TileOption<PianoTypeOption>
              key={opt}
              label={opt}
              selected={value.pianoType === opt}
              onSelect={(v) => onChange({ pianoType: v })}
            />
          ))}
        </div>
      </Section>
    );
  };

  const renderGunSafe = () => {
    if (!showGunSafe) return null;
    return (
      <Section title="Gun Safe">
        <div className="grid grid-cols-3 gap-3 mt-2" role="group" aria-label="Gun Safe Weight">
          {GUN_SAFE_WEIGHT_OPTIONS.map((opt) => (
            <TileOption<GunSafeWeightOption>
              key={opt}
              label={opt}
              selected={value.gunSafeWeight === opt}
              onSelect={(v) => onChange({ gunSafeWeight: v })}
            />
          ))}
        </div>
      </Section>
    );
  };

  const renderAntique = () => {
    if (!showAntique) return null;
    return (
      <Section title="Antique / Artwork">
        <div className="mt-2 space-y-3" role="group" aria-label="Antique / Artwork Details">
          <label className="block text-sm text-gray-800">
            <span className="block mb-1">Details</span>
            <input
              type="text"
              value={value.antiqueDescription ?? ""}
              onChange={(e) => onChange({ antiqueDescription: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-800">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
              checked={Boolean(value.antiqueNeedCrate)}
              onChange={() => onChange({ antiqueNeedCrate: !value.antiqueNeedCrate })}
            />
            <span>Need custom crate?</span>
          </label>
        </div>
      </Section>
    );
  };

  const renderStorage = () => {
    if (!showStorage) return null;
    const duration = value.storageDurationType;
    return (
      <Section title="Storage">
        <div className="grid grid-cols-2 gap-3 mt-2" role="group" aria-label="Storage Duration">
          {(['Overnight', 'Long-term'] as StorageDurationType[]).map((opt) => (
            <TileOption<StorageDurationType>
              key={opt}
              label={opt}
              selected={duration === opt}
              onSelect={(v) => onChange({ storageDurationType: v })}
            />
          ))}
        </div>
        {duration === 'Overnight' && (
          <div className="mt-3" role="group" aria-label="Overnight Duration">
            <label className="block text-sm text-gray-800">
              <span className="block mb-1">Days?</span>
              <input
                type="number"
                min={0}
                value={value.storageOvernightDays ?? ''}
                onChange={(e) => {
                  const n = e.target.value === '' ? undefined : Number(e.target.value);
                  onChange({ storageOvernightDays: n });
                }}
                className="w-40 rounded-lg border border-gray-300 px-3 py-2"
              />
            </label>
          </div>
        )}
        {duration === 'Long-term' && (
          <div className="mt-3" role="group" aria-label="Long-term Duration">
            <label className="block text-sm text-gray-800">
              <span className="block mb-1">Weeks?</span>
              <input
                type="number"
                min={0}
                value={value.storageLongTermWeeks ?? ''}
                onChange={(e) => {
                  const n = e.target.value === '' ? undefined : Number(e.target.value);
                  onChange({ storageLongTermWeeks: n });
                }}
                className="w-40 rounded-lg border border-gray-300 px-3 py-2"
              />
            </label>
          </div>
        )}
      </Section>
    );
  };

  const renderBulky = () => {
    if (!showBulky) return null;
    return (
      <Section title="Bulky Item">
        <div className="mt-2" role="group" aria-label="Bulky Item Description">
          <label className="block text-sm text-gray-800">
            <span className="block mb-1">Describe item</span>
            <input
              type="text"
              value={value.bulkyDescription ?? ""}
              onChange={(e) => onChange({ bulkyDescription: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
        </div>
      </Section>
    );
  };

  return (
    <div>
      <h3 className="text-xl font-semibold">Step 5: Conditional Questions</h3>
      <p className="text-gray-700 mt-1">We have a few quick follow-ups based on your selections.</p>
      {renderPacking()}
      {renderPiano()}
      {renderGunSafe()}
      {renderAntique()}
      {renderStorage()}
      {renderBulky()}
    </div>
  );
}
