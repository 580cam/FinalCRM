/**
 * Pricing Constants and Configuration
 * All business rules and rates centralized for easy maintenance and updates
 */

import type {
  MoveSizeCubicFeetMapping,
  ServiceSpeedConfig,
  CrewSizeRule,
  BaseHourlyRates,
  AdditionalRates,
  CrewAdjustmentRule,
  PricingConfig
} from './types';

/**
 * Move Size to Cubic Feet Mapping
 * Exact values from specification
 */
export const MOVE_SIZE_CUFT: MoveSizeCubicFeetMapping = {
  "Room or Less": 75,
  "Studio Apartment": 288,
  "1 Bedroom Apartment": 432,
  "2 Bedroom Apartment": 743,
  "3 Bedroom Apartment": 1296,
  "1 Bedroom House": 576,
  "1 Bedroom House (Large)": 720,
  "2 Bedroom House": 1008,
  "2 Bedroom House (Large)": 1152,
  "3 Bedroom House": 1440,
  "3 Bedroom House (Large)": 1584,
  "4 Bedroom House": 1872,
  "4 Bedroom House (Large)": 2016,
  "5 Bedroom House": 3168,
  "5 Bedroom House (Large)": 3816,
  "5 x 10 Storage Unit": 400,
  "5 x 15 Storage Unit": 600,
  "10 x 10 Storage Unit": 800,
  "10 x 15 Storage Unit": 1200,
  "10 x 20 Storage Unit": 1600,
  "Office (Small)": 1000,
  "Office (Medium)": 2000,
  "Office (Large)": 3000
};

/**
 * Service Tier Speed Configuration (cuft/hr/mover)
 * These values determine how fast each service tier moves items
 */
export const SERVICE_SPEED: ServiceSpeedConfig = {
  "Grab-n-Go": 95,
  "Full Service": 80,
  "White Glove": 70,
  "Labor Only": 90
};

/**
 * Crew Size Determination Rules
 * Based on cubic feet, determines optimal crew size
 */
export const CREW_SIZE_BY_CUBIC_FEET: CrewSizeRule[] = [
  { max: 1009, movers: 2 },
  { max: 1500, movers: 3 },
  { max: 2000, movers: 4 },
  { max: 3200, movers: 5 },
  { max: Infinity, movers: 6 }
];

/**
 * Base Hourly Rates by Service Type and Crew Size
 * All rates in USD per hour
 */
export const BASE_HOURLY_RATES: BaseHourlyRates = {
  "Moving": { 2: 169, 3: 229, 4: 289, 5: 349, 6: 409, 7: 469 },
  "Packing": { 2: 169, 3: 229, 4: 289, 5: 349, 6: 409, 7: 469 },
  "Full Service": { 2: 169, 3: 229, 4: 289, 5: 349, 6: 409, 7: 469 },
  "White Glove": { 2: 199, 3: 274, 4: 349, 5: 424, 6: 499, 7: 574 },
  "Labor Only": { 2: 129, 3: 189, 4: 249, 5: 309, 6: 369, 7: 429 },
  "Commercial": { 2: 169, 3: 229, 4: 289, 5: 349, 6: 409, 7: 469 }
};

/**
 * Additional Service Rates
 * Supplementary charges and fees
 */
export const ADDITIONAL_RATES: AdditionalRates = {
  FUEL_RATE_PER_MILE: 2.00,
  MILEAGE_RATE_PER_MILE: 4.29,
  ADDITIONAL_TRUCK_HOURLY: 30,
  EMERGENCY_SERVICE_HOURLY: 30
};

/**
 * Handicap Modifier Base Rates
 * Used for calculating accessibility surcharges
 */
export const HANDICAP_MODIFIERS = {
  STAIRS_PER_FLIGHT: 0.09, // 9% per flight
  WALK_PER_100FT: 0.09,    // 9% per 100ft
  ELEVATOR: 0.18,          // 18% if elevator required
  MINIMUM_CUFT_THRESHOLD: 400 // Only applies if cuft >= 400
} as const;

/**
 * Crew Adjustment Rules
 * When handicap modifiers justify additional crew members
 * Only applies if cuft >= 400
 */
export const CREW_ADJUSTMENT_RULES: CrewAdjustmentRule[] = [
  {
    minCuft: 0,
    maxCuft: 299,
    firstExtraModifier: 0.36,  // 36% handicap adds 1 mover
    secondExtraModifier: 0.72  // 72% handicap adds 2 movers
  },
  {
    minCuft: 300,
    maxCuft: 599,
    firstExtraModifier: 0.27,  // 27% handicap adds 1 mover
    secondExtraModifier: 0.54  // 54% handicap adds 2 movers
  },
  {
    minCuft: 600,
    maxCuft: Infinity,
    firstExtraModifier: 0.18,  // 18% handicap adds 1 mover
    secondExtraModifier: 0.36  // 36% handicap adds 2 movers
  }
];

/**
 * Day Split Logic Configuration
 * Thresholds for splitting moves across multiple days
 */
export const DAY_SPLIT_THRESHOLDS = {
  localMaxHours: 9,              // LOCAL moves split if > 9 hours
  regionalMaxHours: 14,          // REGIONAL moves split if > 14 hours
  localDistanceThreshold: 30,    // <= 30 miles = LOCAL
  regionalDistanceThreshold: 120 // 30-120 miles = REGIONAL, >120 = LONG_DISTANCE
} as const;

/**
 * Maximum Crew Size Supported
 * Business constraint for operational management
 */
export const MAX_CREW_SIZE = 7;

/**
 * Minimum Values for Validation
 */
export const VALIDATION_LIMITS = {
  MIN_CUBIC_FEET: 1,
  MAX_CUBIC_FEET: 10000,
  MIN_DISTANCE_MILES: 0,
  MAX_DISTANCE_MILES: 3000,
  MIN_STAIRS: 0,
  MAX_STAIRS: 20,
  MIN_WALK_FEET: 0,
  MAX_WALK_FEET: 1000
} as const;

/**
 * Complete Pricing Configuration
 * Centralized configuration object for easy import and testing
 */
export const PRICING_CONFIG: PricingConfig = {
  moveSizeCubicFeet: MOVE_SIZE_CUFT,
  serviceSpeed: SERVICE_SPEED,
  crewSizeRules: CREW_SIZE_BY_CUBIC_FEET,
  baseHourlyRates: BASE_HOURLY_RATES,
  additionalRates: ADDITIONAL_RATES,
  crewAdjustmentRules: CREW_ADJUSTMENT_RULES,
  daysSplitThresholds: DAY_SPLIT_THRESHOLDS
};

/**
 * Utility function to validate if a crew size is supported
 */
export const isValidCrewSize = (size: number): size is 2 | 3 | 4 | 5 | 6 | 7 => {
  return Number.isInteger(size) && size >= 2 && size <= MAX_CREW_SIZE;
};

/**
 * Utility function to get all available move sizes
 */
export const getAvailableMoveSizes = (): (keyof MoveSizeCubicFeetMapping)[] => {
  return Object.keys(MOVE_SIZE_CUFT) as (keyof MoveSizeCubicFeetMapping)[];
};

/**
 * Utility function to get cubic feet for a move size
 */
export const getCubicFeetForMoveSize = (moveSize: keyof MoveSizeCubicFeetMapping): number => {
  return MOVE_SIZE_CUFT[moveSize];
};

/**
 * Utility function to get service speed for a tier
 */
export const getServiceSpeed = (tier: keyof ServiceSpeedConfig): number => {
  return SERVICE_SPEED[tier];
};