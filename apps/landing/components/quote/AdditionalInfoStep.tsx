"use client";
import React from "react";
import type { AdditionalInfoState, ServiceTypeOption } from "@/components/quote/types";

type Props = {
  serviceType?: ServiceTypeOption;
  value: AdditionalInfoState;
  onChange: (patch: Partial<AdditionalInfoState>) => void;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="text-xl font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function TileToggle({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={Boolean(selected)}
      onClick={onToggle}
      className={[
        "rounded-xl border px-3 py-3 text-sm font-medium text-left transition",
        selected ? "border-black bg-black text-white shadow" : "border-gray-300 bg-white hover:border-gray-400",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export default function AdditionalInfoStep({ serviceType, value, onChange }: Props) {
  const packingLabel = "Packing Needed?"; // Strictly per spec

  const items: { key: keyof AdditionalInfoState; label: string }[] = [
    { key: "piano", label: "Piano" },
    { key: "gunSafe", label: "Gun Safe" },
    { key: "bulkyItem", label: "Bulky Item (Hot Tub, Exercise Machine, Play Set, etc.)" },
    { key: "antiqueArtwork", label: "Antique / Artwork (>$2k)" },
    { key: "packingOrCrating", label: packingLabel },
    { key: "within24hrs", label: "Need Help Within 24 hrs?" },
    { key: "storageNeeded", label: "Storage Needed?" },
  ];

  return (
    <div>
      <h3 className="text-xl font-semibold">Step 4: Additional Info</h3>
      <p className="text-gray-700 mt-1">Select all that apply.</p>
      <Section title="Additional Info (Select all that apply)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2" role="group" aria-label="Additional Info (Select all that apply)">
          {items.map(({ key, label }) => (
            <TileToggle
              key={key}
              label={label}
              selected={Boolean(value[key])}
              onToggle={() => onChange({ [key]: !value[key] } as Partial<AdditionalInfoState>)}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}
