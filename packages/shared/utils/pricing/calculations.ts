/**
 * Core Pricing Calculation Functions
 * Pure functions for all pricing computations with comprehensive error handling
 */

import type {
  MoveSize,
  ServiceTier,
  ServiceType,
  CrewSize,
  HandicapFactors,
  CrewSizeRule,
  CrewAdjustmentRule,
  MoveType
} from './types';

import {
  MOVE_SIZE_CUFT,
  SERVICE_SPEED,
  CREW_SIZE_BY_CUBIC_FEET,
  BASE_HOURLY_RATES,
  ADDITIONAL_RATES,
  HANDICAP_MODIFIERS,
  CREW_ADJUSTMENT_RULES,
  DAY_SPLIT_THRESHOLDS,
  MAX_CREW_SIZE,
  isValidCrewSize
} from './constants';

/**
 * Get cubic feet for a move size with fallback to custom value
 */
export function getCubicFeet(moveSize: MoveSize, customCubicFeet?: number): number {
  if (customCubicFeet !== undefined) {
    if (customCubicFeet <= 0) {
      throw new Error('Custom cubic feet must be greater than 0');
    }
    return customCubicFeet;
  }
  
  const cubicFeet = MOVE_SIZE_CUFT[moveSize];
  if (cubicFeet === undefined) {
    throw new Error(`Invalid move size: ${moveSize}`);
  }
  
  return cubicFeet;
}

/**
 * Determine optimal crew size based on cubic feet
 */
export function determineCrewSize(cubicFeet: number, forceCrewSize?: number): number {
  if (forceCrewSize !== undefined) {
    if (!isValidCrewSize(forceCrewSize)) {
      throw new Error(`Invalid crew size: ${forceCrewSize}. Must be between 2 and ${MAX_CREW_SIZE}`);
    }
    return forceCrewSize;
  }
  
  if (cubicFeet <= 0) {
    throw new Error('Cubic feet must be greater than 0');
  }
  
  // Find the appropriate crew size rule
  for (const rule of CREW_SIZE_BY_CUBIC_FEET) {
    if (cubicFeet <= rule.max) {
      return rule.movers;
    }
  }
  
  // Fallback to maximum crew size if no rule matches
  return CREW_SIZE_BY_CUBIC_FEET[CREW_SIZE_BY_CUBIC_FEET.length - 1].movers;
}

/**
 * Get service speed (cuft/hr/mover) for a service tier
 */
export function getServiceTierSpeed(serviceTier: ServiceTier): number {
  const speed = SERVICE_SPEED[serviceTier];
  if (speed === undefined) {
    throw new Error(`Invalid service tier: ${serviceTier}`);
  }
  return speed;
}

/**
 * Calculate handicap modifier based on accessibility factors
 * Only applies if cubic feet >= 400
 */
export function calculateHandicapModifier(
  cubicFeet: number,
  handicapFactors: HandicapFactors
): number {
  // Handicap modifiers only apply if cubic feet >= 400
  if (cubicFeet < HANDICAP_MODIFIERS.MINIMUM_CUFT_THRESHOLD) {
    return 1.0;
  }
  
  const { stairs, walkFeet, elevator } = handicapFactors;
  
  // Validate inputs
  if (stairs < 0) throw new Error('Stairs count cannot be negative');
  if (walkFeet < 0) throw new Error('Walk distance cannot be negative');
  
  const stairsModifier = stairs * HANDICAP_MODIFIERS.STAIRS_PER_FLIGHT;
  const walkModifier = (walkFeet / 100) * HANDICAP_MODIFIERS.WALK_PER_100FT;
  const elevatorModifier = elevator ? HANDICAP_MODIFIERS.ELEVATOR : 0;
  
  return 1 + stairsModifier + walkModifier + elevatorModifier;
}

/**
 * Calculate base time required for the move
 */
export function calculateBaseTime(
  cubicFeet: number,
  crewSize: number,
  serviceTierSpeed: number,
  handicapModifier: number = 1
): number {
  if (cubicFeet <= 0) throw new Error('Cubic feet must be greater than 0');
  if (crewSize <= 0) throw new Error('Crew size must be greater than 0');
  if (serviceTierSpeed <= 0) throw new Error('Service tier speed must be greater than 0');
  if (handicapModifier < 1) throw new Error('Handicap modifier must be >= 1');
  
  // Formula: baseTime = cuft / (crewCount * serviceSpeed) * handicapModifier
  return (cubicFeet / (crewSize * serviceTierSpeed)) * handicapModifier;
}

/**
 * Determine if crew size should be adjusted based on handicap modifier
 * Returns the adjusted crew size and reasoning
 */
export function determineCrewAdjustment(
  cubicFeet: number,
  originalCrewSize: number,
  handicapModifier: number
): { adjustedCrewSize: number; reasoning: string; applied: boolean } {
  // Crew adjustments only apply if cubic feet >= 400
  if (cubicFeet < HANDICAP_MODIFIERS.MINIMUM_CUFT_THRESHOLD) {
    return {
      adjustedCrewSize: originalCrewSize,
      reasoning: `No crew adjustment: cubic feet (${cubicFeet}) below threshold (${HANDICAP_MODIFIERS.MINIMUM_CUFT_THRESHOLD})`,
      applied: false
    };
  }
  
  // Find the appropriate adjustment rule
  const rule = CREW_ADJUSTMENT_RULES.find(r => 
    cubicFeet >= r.minCuft && cubicFeet <= r.maxCuft
  );
  
  if (!rule) {
    return {
      adjustedCrewSize: originalCrewSize,
      reasoning: 'No crew adjustment rule found for cubic feet range',
      applied: false
    };
  }
  
  // Calculate the handicap percentage (modifier - 1)
  const handicapPercentage = handicapModifier - 1;
  
  let extraMovers = 0;
  let reasoning = '';
  
  if (handicapPercentage >= rule.secondExtraModifier) {
    extraMovers = 2;
    reasoning = `Added 2 movers: handicap ${(handicapPercentage * 100).toFixed(1)}% >= ${(rule.secondExtraModifier * 100).toFixed(0)}% threshold (${cubicFeet} cuft range)`;
  } else if (handicapPercentage >= rule.firstExtraModifier) {
    extraMovers = 1;
    reasoning = `Added 1 mover: handicap ${(handicapPercentage * 100).toFixed(1)}% >= ${(rule.firstExtraModifier * 100).toFixed(0)}% threshold (${cubicFeet} cuft range)`;
  } else {
    reasoning = `No crew adjustment: handicap ${(handicapPercentage * 100).toFixed(1)}% below ${(rule.firstExtraModifier * 100).toFixed(0)}% threshold (${cubicFeet} cuft range)`;
  }
  
  const adjustedCrewSize = Math.min(originalCrewSize + extraMovers, MAX_CREW_SIZE);
  
  return {
    adjustedCrewSize,
    reasoning,
    applied: extraMovers > 0
  };
}

/**
 * Get base hourly rate for service type and crew size
 */
export function getBaseHourlyRate(serviceType: ServiceType, crewSize: number): number {
  const serviceRates = BASE_HOURLY_RATES[serviceType];
  if (!serviceRates) {
    throw new Error(`Invalid service type: ${serviceType}`);
  }
  
  const rate = serviceRates[crewSize];
  if (rate === undefined) {
    throw new Error(`No hourly rate found for service type '${serviceType}' with crew size ${crewSize}`);
  }
  
  return rate;
}

/**
 * Classify move type based on distance
 */
export function classifyMoveType(distanceMiles: number): MoveType {
  if (distanceMiles < 0) {
    throw new Error('Distance cannot be negative');
  }
  
  if (distanceMiles <= DAY_SPLIT_THRESHOLDS.localDistanceThreshold) {
    return 'LOCAL';
  } else if (distanceMiles <= DAY_SPLIT_THRESHOLDS.regionalDistanceThreshold) {
    return 'REGIONAL';
  } else {
    return 'LONG_DISTANCE';
  }
}

/**
 * Determine if move should be split across multiple days
 */
export function determineDaySplit(
  timeHours: number,
  moveType: MoveType
): { daysSplit: number; hoursPerDay: number[]; reasoning: string } {
  if (timeHours <= 0) {
    throw new Error('Time hours must be greater than 0');
  }
  
  let maxHoursPerDay: number;
  let reasoning: string;
  
  switch (moveType) {
    case 'LOCAL':
      maxHoursPerDay = DAY_SPLIT_THRESHOLDS.localMaxHours;
      if (timeHours <= maxHoursPerDay) {
        return {
          daysSplit: 1,
          hoursPerDay: [timeHours],
          reasoning: `Single day: ${timeHours.toFixed(1)} hours ≤ ${maxHoursPerDay} hour local limit`
        };
      }
      break;
      
    case 'REGIONAL':
      // Regional moves attempt single day first, split if > 14 hours
      maxHoursPerDay = DAY_SPLIT_THRESHOLDS.regionalMaxHours;
      if (timeHours <= maxHoursPerDay) {
        return {
          daysSplit: 1,
          hoursPerDay: [timeHours],
          reasoning: `Single day: ${timeHours.toFixed(1)} hours ≤ ${maxHoursPerDay} hour regional limit`
        };
      }
      break;
      
    case 'LONG_DISTANCE':
      // Long distance moves are typically multi-day by nature
      maxHoursPerDay = DAY_SPLIT_THRESHOLDS.regionalMaxHours; // Use regional limit as base
      break;
  }
  
  // Calculate how many days needed
  const daysNeeded = Math.ceil(timeHours / maxHoursPerDay);
  const hoursPerDay: number[] = [];
  
  // Distribute hours as evenly as possible
  const baseHoursPerDay = timeHours / daysNeeded;
  for (let i = 0; i < daysNeeded; i++) {
    hoursPerDay.push(baseHoursPerDay);
  }
  
  reasoning = `Split into ${daysNeeded} days: ${timeHours.toFixed(1)} total hours > ${maxHoursPerDay} hour ${moveType.toLowerCase()} limit`;
  
  return {
    daysSplit: daysNeeded,
    hoursPerDay,
    reasoning
  };
}

/**
 * Calculate additional costs (fuel, mileage, trucks, emergency)
 */
export function calculateAdditionalCosts(
  distanceMiles: number,
  timeHours: number,
  additionalTrucks: number = 0,
  emergencyService: boolean = false
): {
  fuelCost: number;
  mileageCost: number;
  additionalTruckCost: number;
  emergencyServiceCost: number;
  total: number;
} {
  if (distanceMiles < 0) throw new Error('Distance cannot be negative');
  if (timeHours <= 0) throw new Error('Time hours must be greater than 0');
  if (additionalTrucks < 0) throw new Error('Additional trucks cannot be negative');
  
  const fuelCost = distanceMiles * ADDITIONAL_RATES.FUEL_RATE_PER_MILE;
  const mileageCost = distanceMiles * ADDITIONAL_RATES.MILEAGE_RATE_PER_MILE;
  const additionalTruckCost = additionalTrucks * timeHours * ADDITIONAL_RATES.ADDITIONAL_TRUCK_HOURLY;
  const emergencyServiceCost = emergencyService ? (timeHours * ADDITIONAL_RATES.EMERGENCY_SERVICE_HOURLY) : 0;
  
  return {
    fuelCost,
    mileageCost,
    additionalTruckCost,
    emergencyServiceCost,
    total: fuelCost + mileageCost + additionalTruckCost + emergencyServiceCost
  };
}

/**
 * Round currency values to 2 decimal places
 */
export function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Validate pricing inputs for common errors
 */
export function validatePricingInputs(inputs: {
  cubicFeet?: number;
  crewSize?: number;
  distanceMiles?: number;
  handicapFactors?: HandicapFactors;
}): string[] {
  const errors: string[] = [];
  
  if (inputs.cubicFeet !== undefined && inputs.cubicFeet <= 0) {
    errors.push('Cubic feet must be greater than 0');
  }
  
  if (inputs.crewSize !== undefined && !isValidCrewSize(inputs.crewSize)) {
    errors.push(`Crew size must be between 2 and ${MAX_CREW_SIZE}`);
  }
  
  if (inputs.distanceMiles !== undefined && inputs.distanceMiles < 0) {
    errors.push('Distance cannot be negative');
  }
  
  if (inputs.handicapFactors) {
    const { stairs, walkFeet } = inputs.handicapFactors;
    if (stairs < 0) errors.push('Stairs count cannot be negative');
    if (walkFeet < 0) errors.push('Walk distance cannot be negative');
  }
  
  return errors;
}