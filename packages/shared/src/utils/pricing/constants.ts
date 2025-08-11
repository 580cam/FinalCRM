export const SERVICE_TYPES = ['Grab-n-Go', 'Full Service', 'White Glove', 'Labor Only'] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const BILLING_SERVICES = [
  'Moving',
  'Packing',
  'Unpacking',
  'Moving and Packing',
  'Full Service',
  'White Glove',
  'Load Only',
  'Unload Only',
  'Labor Only',
  'Staging',
  'Commercial',
] as const;
export type BillingService = (typeof BILLING_SERVICES)[number];

export const MOVE_SIZE_CUFT: Record<string, number> = {
  'Room or Less': 75,
  'Studio Apartment': 288,
  '1 Bedroom Apartment': 432,
  '2 Bedroom Apartment': 743,
  '3 Bedroom Apartment': 1296,
  '1 Bedroom House': 576,
  '1 Bedroom House (Large)': 720,
  '2 Bedroom House': 1008,
  '2 Bedroom House (Large)': 1152,
  '3 Bedroom House': 1440,
  '3 Bedroom House (Large)': 1584,
  '4 Bedroom House': 1872,
  '4 Bedroom House (Large)': 2016,
  '5 Bedroom House': 3168,
  '5 Bedroom House (Large)': 3816,
  '5 x 10 Storage Unit': 400,
  '5 x 15 Storage Unit': 600,
  '10 x 10 Storage Unit': 800,
  '10 x 15 Storage Unit': 1200,
  '10 x 20 Storage Unit': 1600,
  'Office (Small)': 1000,
  'Office (Medium)': 2000,
  'Office (Large)': 3000,
};

export const SERVICE_SPEED_CUFT_PER_HOUR_PER_MOVER: Record<ServiceType, number> = {
  'Grab-n-Go': 95,
  'Full Service': 80,
  'White Glove': 70,
  'Labor Only': 90,
};

export const CREW_SIZE_BY_CUBIC_FEET: Array<{ max: number; movers: number }> = [
  { max: 1009, movers: 2 },
  { max: 1500, movers: 3 },
  { max: 2000, movers: 4 },
  { max: 3200, movers: 5 },
  { max: Number.POSITIVE_INFINITY, movers: 6 },
];

export const BASE_HOURLY_RATES: Partial<Record<BillingService, Record<number, number>>> = {
  Moving: { 2: 169, 3: 229, 4: 289, 5: 349, 6: 409, 7: 469 },
  Packing: { 2: 169, 3: 229, 4: 289, 5: 349, 6: 409, 7: 469 },
  Unpacking: { 2: 169, 3: 229, 4: 289, 5: 349, 6: 409, 7: 469 },
  'Moving and Packing': { 2: 169, 3: 229, 4: 289, 5: 349, 6: 409, 7: 469 },
  'Full Service': { 2: 169, 3: 229, 4: 289, 5: 349, 6: 409, 7: 469 },
  'White Glove': { 2: 199, 3: 274, 4: 349, 5: 424, 6: 499, 7: 574 },
  'Load Only': { 2: 129, 3: 189, 4: 249, 5: 309, 6: 369, 7: 429 },
  'Unload Only': { 2: 129, 3: 189, 4: 249, 5: 309, 6: 369, 7: 429 },
  'Labor Only': { 2: 129, 3: 189, 4: 249, 5: 309, 6: 369, 7: 429 },
  Staging: { 2: 129, 3: 189, 4: 249, 5: 309, 6: 369, 7: 429 },
  Commercial: { 2: 169, 3: 229, 4: 289, 5: 349, 6: 409, 7: 469 },
};

export const ADDITIONAL_MOVER_RATES: Partial<Record<BillingService, number>> = {
  Moving: 60,
  Packing: 60,
  Unpacking: 60,
  'Moving and Packing': 60,
  'Full Service': 60,
  'White Glove': 75,
  'Load Only': 60,
  'Unload Only': 60,
  'Labor Only': 60,
  Staging: 60,
  Commercial: 60,
};

export const ADDITIONAL_RATES = {
  FUEL_RATE_PER_MILE: 2.0,
  MILEAGE_RATE_PER_MILE: 4.29,
  ADDITIONAL_TRUCK_HOURLY: 30,
  EMERGENCY_SERVICE_HOURLY: 30,
};

export const SPECIALTY_ITEM_TIERS = {
  tier1: 150,
  tier2: 250,
  tier3: 350,
} as const;

export const DAY_SPLIT_THRESHOLDS = {
  localMilesMax: 30,
  localHoursThreshold: 9,
  regionalMilesMin: 30,
  regionalMilesMax: 120,
  regionalHoursThreshold: 14, // DOT limit
};
