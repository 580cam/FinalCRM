export type BoxCounts = {
  small?: number;
  medium?: number;
  large?: number;
  wardrobe?: number;
  dishPack?: number;
  mattressBag?: number;
  tvBox?: number;
};

export type EstimationResult = {
  totalBoxes: number;
  packMinutes: number;
  unpackMinutes: number;
};

export function summarizeBoxes(counts: BoxCounts): EstimationResult {
  const safe = (n?: number) => Math.max(0, n ?? 0);
  const totalBoxes =
    safe(counts.small) +
    safe(counts.medium) +
    safe(counts.large) +
    safe(counts.wardrobe) +
    safe(counts.dishPack) +
    safe(counts.mattressBag) +
    safe(counts.tvBox);
  // Placeholder; detailed room-based model is implemented elsewhere.
  return {
    totalBoxes,
    packMinutes: 0,
    unpackMinutes: 0,
  };
}
