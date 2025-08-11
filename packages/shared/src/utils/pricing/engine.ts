import {
  ADDITIONAL_MOVER_RATES,
  ADDITIONAL_RATES,
  BASE_HOURLY_RATES,
  CREW_SIZE_BY_CUBIC_FEET,
  SERVICE_SPEED_CUFT_PER_HOUR_PER_MOVER,
  SPECIALTY_ITEM_TIERS,
  type BillingService,
  type ServiceType,
} from './constants';
import { getDaySplitPlan, type DaySplitPlan } from './daySplit';

export type HandicapParams = {
  stairsFlights?: number; // +9% per flight
  walkDistanceFt?: number; // +9% per 100ft
  hasElevator?: boolean; // +18%
};

export type RatesConfig = {
  baseHourlyRate?: Partial<Record<BillingService, Record<number, number>>>;
  additionalMoverPerHour?: Partial<Record<BillingService, number>>;
  additionalTruckPerHour?: number;
  emergencyPerHour?: number; // per mover per hour
};

export type JobInputs = {
  serviceType: ServiceType;
  billingService: BillingService;
  distanceMiles: number;
  cubicFeet: number;
  movers?: number; // manual override
  trucks?: number; // manual override
  handicaps?: HandicapParams;
  emergencyWithin24h?: boolean;
  specialtyTiers?: (1 | 2 | 3)[];
};

export type PricingBreakdown = {
  serviceType: ServiceType;
  billingService: BillingService;
  recommendedCrew: number;
  recommendedTrucks: number;
  baseHoursBeforeHandicap: number;
  handicapPercent: number; // e.g. 0.18
  effectiveHours: number;
  daySplit: DaySplitPlan;
  baseRatePerHour: number;
  additionalTruckHourly: number;
  emergencySurchargeHourly: number; // total per hour (already multiplied by crew if applicable)
  hourlyCost: number; // (baseRate + trucks + emergency) * hours
  mileageCost: number;
  fuelCost: number;
  specialtyItemCharges: number;
  total: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function calculatePricing(input: JobInputs, rates: RatesConfig = {}): PricingBreakdown {
  const serviceSpeed = SERVICE_SPEED_CUFT_PER_HOUR_PER_MOVER[input.serviceType];
  const baseCrew = input.movers ?? crewByCuft(input.cubicFeet);

  const handicapPercent = computeHandicapPercent(input.handicaps);

  const crew = input.movers ?? applyCrewAdjustments(baseCrew, input.cubicFeet, handicapPercent);
  const trucks = input.trucks ?? Math.max(1, Math.ceil(input.cubicFeet / 1500));

  const baseHoursBeforeHandicap = input.cubicFeet / (Math.max(1, crew) * serviceSpeed);
  const effectiveHours = baseHoursBeforeHandicap * (1 + handicapPercent);

  const daySplit = getDaySplitPlan(input.distanceMiles, effectiveHours);

  const rateTable = rates.baseHourlyRate ?? BASE_HOURLY_RATES;
  const addMoverRateTable = rates.additionalMoverPerHour ?? ADDITIONAL_MOVER_RATES;
  const additionalTruckPerHour = rates.additionalTruckPerHour ?? ADDITIONAL_RATES.ADDITIONAL_TRUCK_HOURLY;
  const emergencyPerHourPerMover = rates.emergencyPerHour ?? ADDITIONAL_RATES.EMERGENCY_SERVICE_HOURLY;

  const baseRatePerHour = resolveBaseRate(rateTable, addMoverRateTable, input.billingService, crew);
  const additionalTruckHourly = Math.max(0, trucks - 1) * additionalTruckPerHour;
  const emergencySurchargeHourly = input.emergencyWithin24h ? emergencyPerHourPerMover * crew : 0;

  const hourlyCost = (baseRatePerHour + additionalTruckHourly + emergencySurchargeHourly) * effectiveHours;

  const { mileageCost, fuelCost } = computeDistanceCosts(input.distanceMiles);

  const specialtyItemCharges = (input.specialtyTiers ?? []).reduce((sum, t) => {
    if (t === 1) return sum + SPECIALTY_ITEM_TIERS.tier1;
    if (t === 2) return sum + SPECIALTY_ITEM_TIERS.tier2;
    if (t === 3) return sum + SPECIALTY_ITEM_TIERS.tier3;
    return sum;
  }, 0);

  const total = round2(hourlyCost + mileageCost + fuelCost + specialtyItemCharges);

  return {
    serviceType: input.serviceType,
    billingService: input.billingService,
    recommendedCrew: crew,
    recommendedTrucks: trucks,
    baseHoursBeforeHandicap: round2(baseHoursBeforeHandicap),
    handicapPercent: round2(handicapPercent),
    effectiveHours: round2(effectiveHours),
    daySplit,
    baseRatePerHour: round2(baseRatePerHour),
    additionalTruckHourly: round2(additionalTruckHourly),
    emergencySurchargeHourly: round2(emergencySurchargeHourly),
    hourlyCost: round2(hourlyCost),
    mileageCost: round2(mileageCost),
    fuelCost: round2(fuelCost),
    specialtyItemCharges: round2(specialtyItemCharges),
    total,
  };
}

export function crewByCuft(cuft: number): number {
  const v = Math.max(0, cuft);
  for (const band of CREW_SIZE_BY_CUBIC_FEET) {
    if (v <= band.max) return band.movers;
  }
  return CREW_SIZE_BY_CUBIC_FEET[CREW_SIZE_BY_CUBIC_FEET.length - 1].movers;
}

export function computeHandicapPercent(p?: HandicapParams): number {
  if (!p) return 0;
  const flights = Math.max(0, Math.floor(p.stairsFlights ?? 0));
  const walkHundreds = Math.max(0, Math.floor((p.walkDistanceFt ?? 0) / 100));
  const elevator = p.hasElevator ? 1 : 0;
  return flights * 0.09 + walkHundreds * 0.09 + elevator * 0.18;
}

export function applyCrewAdjustments(baseCrew: number, cuft: number, handicapPercent: number): number {
  let crew = Math.max(1, baseCrew);
  // Only add movers for handicap thresholds if cuft >= 400
  if (cuft < 400) return crew;
  const bandThreshold = cuft < 300 ? 0.36 : cuft < 600 ? 0.27 : 0.18;
  const extras = clamp(Math.floor(handicapPercent / bandThreshold), 0, 2); // cap at 2 extras
  crew += extras;
  return crew;
}

export function resolveBaseRate(
  rateTable: Partial<Record<BillingService, Record<number, number>>>,
  addMoverRateTable: Partial<Record<BillingService, number>>,
  billingService: BillingService,
  crew: number
): number {
  const serviceRates = rateTable[billingService] ?? {};
  const maxDefinedCrew = Object.keys(serviceRates)
    .map((k) => Number(k))
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b)
    .pop();
  if (serviceRates[crew]) return serviceRates[crew]!;
  if (!maxDefinedCrew) return 0;
  const addPerMover = addMoverRateTable[billingService] ?? 0;
  const extraMovers = Math.max(0, crew - maxDefinedCrew);
  return (serviceRates[maxDefinedCrew] ?? 0) + addPerMover * extraMovers;
}

export function computeDistanceCosts(distanceMiles: number): { mileageCost: number; fuelCost: number } {
  const d = Math.max(0, distanceMiles);
  if (d <= 30) return { mileageCost: 0, fuelCost: 0 };
  return {
    mileageCost: d * ADDITIONAL_RATES.MILEAGE_RATE_PER_MILE,
    fuelCost: d * ADDITIONAL_RATES.FUEL_RATE_PER_MILE,
  };
}
