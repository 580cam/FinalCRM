import { DAY_SPLIT_THRESHOLDS } from './constants';

export type DaySplitPlan =
  | { kind: 'local'; thresholdHours: number; singleDayPossible: boolean }
  | { kind: 'regional'; thresholdHours: number; singleDayPossible: boolean }
  | { kind: 'unknown'; thresholdHours: null; singleDayPossible: boolean };

export function getDaySplitPlan(distanceMiles: number, totalHours: number): DaySplitPlan {
  const d = Math.max(0, distanceMiles);
  if (d <= DAY_SPLIT_THRESHOLDS.localMilesMax) {
    const single = totalHours <= DAY_SPLIT_THRESHOLDS.localHoursThreshold;
    return { kind: 'local', thresholdHours: DAY_SPLIT_THRESHOLDS.localHoursThreshold, singleDayPossible: single };
  }
  if (d >= DAY_SPLIT_THRESHOLDS.regionalMilesMin && d <= DAY_SPLIT_THRESHOLDS.regionalMilesMax) {
    const single = totalHours <= DAY_SPLIT_THRESHOLDS.regionalHoursThreshold;
    return {
      kind: 'regional',
      thresholdHours: DAY_SPLIT_THRESHOLDS.regionalHoursThreshold,
      singleDayPossible: single,
    };
  }
  return { kind: 'unknown', thresholdHours: null, singleDayPossible: false };
}
