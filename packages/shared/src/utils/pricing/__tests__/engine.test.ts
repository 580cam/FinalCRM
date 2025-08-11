import { calculatePricing, computeHandicapPercent, applyCrewAdjustments, computeDistanceCosts } from '../engine';
import { BASE_HOURLY_RATES } from '../constants';

describe('pricing engine', () => {
  it('recommends crew and computes costs', () => {
    const out = calculatePricing({
      serviceType: 'Full Service',
      billingService: 'Moving',
      distanceMiles: 40,
      cubicFeet: 900,
      handicaps: { stairsFlights: 1, hasElevator: false, walkDistanceFt: 0 },
      emergencyWithin24h: true,
      specialtyTiers: [1, 3],
    });
    expect(out.recommendedCrew).toBeGreaterThanOrEqual(2);
    expect(out.baseRatePerHour).toBeGreaterThan(0);
    expect(out.mileageCost).toBeCloseTo(4.29 * 40, 2);
    expect(out.fuelCost).toBeCloseTo(2.0 * 40, 2);
    expect(out.specialtyItemCharges).toBe(150 + 350);
    expect(out.total).toBeGreaterThan(0);
  });

  it('adds extra movers based on handicap thresholds for cuft >= 400', () => {
    // handicap 0.36 should add 2 movers when cuft >= 600 (0.18 increments)
    const out = calculatePricing({
      serviceType: 'Full Service',
      billingService: 'Moving',
      distanceMiles: 10,
      cubicFeet: 800,
      handicaps: { stairsFlights: 2, hasElevator: true, walkDistanceFt: 0 }, // 0.36
    });
    expect(out.recommendedCrew).toBeGreaterThanOrEqual(4);
  });

  it('resolves base rate using additional mover rate when crew exceeds defined table', () => {
    const out = calculatePricing({
      serviceType: 'Full Service',
      billingService: 'White Glove',
      distanceMiles: 10,
      cubicFeet: 5000, // large job size
      movers: 9, // force crew beyond defined table to trigger add-mover rate
      handicaps: { stairsFlights: 0 },
    });
    // Ensure base rate > highest listed (7) using add-mover rate (75)
    const highest = BASE_HOURLY_RATES['White Glove']![7];
    expect(out.baseRatePerHour).toBeGreaterThanOrEqual(highest);
  });

  it('distance costs: <=30 miles is zero', () => {
    expect(computeDistanceCosts(0)).toEqual({ mileageCost: 0, fuelCost: 0 });
    expect(computeDistanceCosts(30)).toEqual({ mileageCost: 0, fuelCost: 0 });
  });

  it('distance costs: above 30 miles is positive', () => {
    const { mileageCost, fuelCost } = computeDistanceCosts(31);
    expect(mileageCost).toBeGreaterThan(0);
    expect(fuelCost).toBeGreaterThan(0);
  });

  it('applyCrewAdjustments threshold logic and caps', () => {
    // cuft < 400: no extras even with high handicap
    expect(applyCrewAdjustments(2, 350, 0.36)).toBe(2);

    // 400 <= cuft < 600 uses 0.27 threshold => 1 extra at 0.27
    expect(applyCrewAdjustments(2, 550, 0.27)).toBe(3);

    // cuft >= 600 uses 0.18 threshold, extras capped at 2
    expect(applyCrewAdjustments(4, 1800, 0.5)).toBe(6);
    expect(applyCrewAdjustments(4, 1800, 1.0)).toBe(6); // cap at +2
  });
});
