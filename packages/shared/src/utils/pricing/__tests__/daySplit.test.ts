import { getDaySplitPlan } from '../daySplit';

describe('day split', () => {
  it('local single day under 9 hours', () => {
    const plan = getDaySplitPlan(10, 8.5);
    expect(plan.kind).toBe('local');
    expect(plan.singleDayPossible).toBe(true);
  });
  it('regional single day up to 14 hours', () => {
    const plan = getDaySplitPlan(100, 13.5);
    expect(plan.kind).toBe('regional');
    expect(plan.singleDayPossible).toBe(true);
  });
  it('unknown for distances above 120 miles', () => {
    const plan = getDaySplitPlan(150, 10);
    expect(plan.kind).toBe('unknown');
    expect(plan.singleDayPossible).toBe(false);
  });
});
