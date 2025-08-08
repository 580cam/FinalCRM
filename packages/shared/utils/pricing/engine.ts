/**
 * Main Pricing Engine
 * Orchestrates all pricing calculations and provides the primary interface
 * for all 4 applications (Marketing Website, CRM Web, CRM Mobile, Crew Mobile)
 */

import type {
  PricingInputs,
  PricingResult,
  PricingCalculationResult,
  ValidationError,
  PricingErrorCode,
  PricingWarningCode
} from './types';

import {
  getCubicFeet,
  determineCrewSize,
  getServiceTierSpeed,
  calculateHandicapModifier,
  calculateBaseTime,
  determineCrewAdjustment,
  getBaseHourlyRate,
  classifyMoveType,
  determineDaySplit,
  calculateAdditionalCosts,
  roundCurrency,
  validatePricingInputs
} from './calculations';

import { HANDICAP_MODIFIERS } from './constants';

/**
 * Main pricing calculation engine
 * Returns comprehensive pricing information with full breakdown
 */
export function calculatePricing(inputs: PricingInputs): PricingResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];
  
  try {
    // Step 1: Input validation
    const inputValidationErrors = validateInputs(inputs);
    if (inputValidationErrors.length > 0) {
      return {
        success: false,
        errors: inputValidationErrors
      };
    }
    
    // Step 2: Extract and calculate cubic feet
    let cubicFeet: number;
    try {
      cubicFeet = getCubicFeet(inputs.moveSize, inputs.customCubicFeet);
      if (inputs.customCubicFeet) {
        warnings.push(`Using custom cubic feet (${inputs.customCubicFeet}) instead of standard size (${inputs.moveSize})`);
      }
    } catch (error) {
      errors.push({
        field: 'moveSize',
        message: error instanceof Error ? error.message : 'Invalid move size',
        code: 'INVALID_MOVE_SIZE'
      });
      return { success: false, errors };
    }
    
    // Step 3: Determine base crew size
    let baseCrewSize: number;
    try {
      baseCrewSize = determineCrewSize(cubicFeet, inputs.forceCrewSize);
      if (inputs.forceCrewSize) {
        warnings.push(`Using forced crew size (${inputs.forceCrewSize}) instead of calculated size`);
      }
    } catch (error) {
      errors.push({
        field: 'crewSize',
        message: error instanceof Error ? error.message : 'Invalid crew size',
        code: 'INVALID_CREW_SIZE'
      });
      return { success: false, errors };
    }
    
    // Step 4: Get service tier speed
    let serviceTierSpeed: number;
    try {
      serviceTierSpeed = getServiceTierSpeed(inputs.serviceTier);
    } catch (error) {
      errors.push({
        field: 'serviceTier',
        message: error instanceof Error ? error.message : 'Invalid service tier',
        code: 'INVALID_SERVICE_TIER'
      });
      return { success: false, errors };
    }
    
    // Step 5: Calculate handicap modifier
    let handicapModifier: number;
    let handicapBreakdown: any;
    try {
      handicapModifier = calculateHandicapModifier(cubicFeet, inputs.handicapFactors);
      
      // Create detailed breakdown
      if (cubicFeet < HANDICAP_MODIFIERS.MINIMUM_CUFT_THRESHOLD) {
        handicapBreakdown = {
          stairsModifier: 0,
          walkModifier: 0,
          elevatorModifier: 0,
          totalModifier: 1
        };
        if (inputs.handicapFactors.stairs > 0 || inputs.handicapFactors.walkFeet > 0 || inputs.handicapFactors.elevator) {
          warnings.push(`Handicap factors ignored: cubic feet (${cubicFeet}) below threshold (${HANDICAP_MODIFIERS.MINIMUM_CUFT_THRESHOLD})`);
        }
      } else {
        const stairsModifier = inputs.handicapFactors.stairs * HANDICAP_MODIFIERS.STAIRS_PER_FLIGHT;
        const walkModifier = (inputs.handicapFactors.walkFeet / 100) * HANDICAP_MODIFIERS.WALK_PER_100FT;
        const elevatorModifier = inputs.handicapFactors.elevator ? HANDICAP_MODIFIERS.ELEVATOR : 0;
        
        handicapBreakdown = {
          stairsModifier,
          walkModifier,
          elevatorModifier,
          totalModifier: handicapModifier
        };
      }
    } catch (error) {
      errors.push({
        field: 'handicapFactors',
        message: error instanceof Error ? error.message : 'Invalid handicap factors',
        code: 'INVALID_HANDICAP_FACTORS'
      });
      return { success: false, errors };
    }
    
    // Step 6: Determine crew adjustments
    const crewAdjustment = determineCrewAdjustment(cubicFeet, baseCrewSize, handicapModifier);
    const finalCrewSize = crewAdjustment.adjustedCrewSize;
    
    if (crewAdjustment.applied) {
      warnings.push(`Crew size adjusted: ${crewAdjustment.reasoning}`);
    }
    
    // Step 7: Calculate base time
    let baseTimeHours: number;
    try {
      baseTimeHours = calculateBaseTime(cubicFeet, finalCrewSize, serviceTierSpeed, handicapModifier);
    } catch (error) {
      errors.push({
        field: 'calculation',
        message: error instanceof Error ? error.message : 'Time calculation error',
        code: 'CALCULATION_ERROR'
      });
      return { success: false, errors };
    }
    
    // Step 8: Get base hourly rate
    let baseHourlyRate: number;
    try {
      baseHourlyRate = getBaseHourlyRate(inputs.serviceType, finalCrewSize);
    } catch (error) {
      errors.push({
        field: 'serviceType',
        message: error instanceof Error ? error.message : 'Invalid service type',
        code: 'INVALID_SERVICE_TYPE'
      });
      return { success: false, errors };
    }
    
    // Step 9: Classify move type and determine day splits
    const moveType = classifyMoveType(inputs.distanceMiles);
    const daySplitInfo = determineDaySplit(baseTimeHours, moveType);
    
    if (daySplitInfo.daysSplit > 1) {
      warnings.push(`Move split into ${daySplitInfo.daysSplit} days: ${daySplitInfo.reasoning}`);
    }
    
    // Step 10: Calculate costs
    const laborCost = roundCurrency(baseTimeHours * baseHourlyRate);
    
    const additionalCosts = calculateAdditionalCosts(
      inputs.distanceMiles,
      baseTimeHours,
      inputs.additionalTrucks || 0,
      inputs.emergencyService || false
    );
    
    if (inputs.emergencyService) {
      warnings.push(`Emergency service surcharge applied: $${additionalCosts.emergencyServiceCost.toFixed(2)}`);
    }
    
    const subtotal = roundCurrency(
      laborCost + 
      additionalCosts.fuelCost + 
      additionalCosts.mileageCost + 
      additionalCosts.additionalTruckCost + 
      additionalCosts.emergencyServiceCost
    );
    
    // Step 11: Build comprehensive result
    const result: PricingCalculationResult = {
      // Core Metrics
      cubicFeet,
      crewSize: finalCrewSize,
      baseHourlyRate,
      handicapModifier: roundCurrency(handicapModifier * 100) / 100, // Round to 2 decimal places
      adjustedCrewSize: finalCrewSize,
      
      // Time Calculations
      baseTimeHours: roundCurrency(baseTimeHours * 100) / 100,
      adjustedTimeHours: roundCurrency(baseTimeHours * 100) / 100,
      
      // Cost Breakdown
      laborCost,
      fuelCost: roundCurrency(additionalCosts.fuelCost),
      mileageCost: roundCurrency(additionalCosts.mileageCost),
      additionalTruckCost: roundCurrency(additionalCosts.additionalTruckCost),
      emergencyServiceCost: roundCurrency(additionalCosts.emergencyServiceCost),
      subtotal,
      
      // Day Split Information
      daysSplit: daySplitInfo.daysSplit,
      hoursPerDay: daySplitInfo.hoursPerDay.map(h => roundCurrency(h * 100) / 100),
      
      // Move Classification
      moveType,
      
      // Detailed Breakdown
      breakdown: {
        serviceTierSpeed,
        crewSizeReasoning: inputs.forceCrewSize 
          ? `Forced crew size: ${inputs.forceCrewSize}`
          : `Calculated from ${cubicFeet} cubic feet`,
        handicapBreakdown,
        crewAdjustments: {
          applied: crewAdjustment.applied,
          originalCrewSize: baseCrewSize,
          adjustedCrewSize: finalCrewSize,
          adjustmentReason: crewAdjustment.reasoning
        },
        daysSplitReasoning: daySplitInfo.reasoning
      }
    };
    
    return {
      success: true,
      data: result,
      warnings: warnings.length > 0 ? warnings : undefined
    };
    
  } catch (error) {
    // Catch any unexpected errors
    return {
      success: false,
      errors: [{
        field: 'system',
        message: error instanceof Error ? error.message : 'Unexpected calculation error',
        code: 'CALCULATION_ERROR'
      }]
    };
  }
}

/**
 * Validate pricing inputs and return structured errors
 */
function validateInputs(inputs: PricingInputs): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Validate move size
  if (!inputs.moveSize || typeof inputs.moveSize !== 'string') {
    errors.push({
      field: 'moveSize',
      message: 'Move size is required',
      code: 'INVALID_MOVE_SIZE'
    });
  }
  
  // Validate service tier
  if (!inputs.serviceTier || typeof inputs.serviceTier !== 'string') {
    errors.push({
      field: 'serviceTier',
      message: 'Service tier is required',
      code: 'INVALID_SERVICE_TIER'
    });
  }
  
  // Validate service type
  if (!inputs.serviceType || typeof inputs.serviceType !== 'string') {
    errors.push({
      field: 'serviceType',
      message: 'Service type is required',
      code: 'INVALID_SERVICE_TYPE'
    });
  }
  
  // Validate distance
  if (typeof inputs.distanceMiles !== 'number' || inputs.distanceMiles < 0) {
    errors.push({
      field: 'distanceMiles',
      message: 'Distance must be a non-negative number',
      code: 'INVALID_DISTANCE'
    });
  }
  
  // Validate handicap factors
  if (!inputs.handicapFactors) {
    errors.push({
      field: 'handicapFactors',
      message: 'Handicap factors are required',
      code: 'INVALID_HANDICAP_FACTORS'
    });
  } else {
    const { stairs, walkFeet, elevator } = inputs.handicapFactors;
    
    if (typeof stairs !== 'number' || stairs < 0) {
      errors.push({
        field: 'handicapFactors.stairs',
        message: 'Stairs must be a non-negative number',
        code: 'INVALID_HANDICAP_FACTORS'
      });
    }
    
    if (typeof walkFeet !== 'number' || walkFeet < 0) {
      errors.push({
        field: 'handicapFactors.walkFeet',
        message: 'Walk distance must be a non-negative number',
        code: 'INVALID_HANDICAP_FACTORS'
      });
    }
    
    if (typeof elevator !== 'boolean') {
      errors.push({
        field: 'handicapFactors.elevator',
        message: 'Elevator must be a boolean',
        code: 'INVALID_HANDICAP_FACTORS'
      });
    }
  }
  
  // Validate optional custom cubic feet
  if (inputs.customCubicFeet !== undefined) {
    if (typeof inputs.customCubicFeet !== 'number' || inputs.customCubicFeet <= 0) {
      errors.push({
        field: 'customCubicFeet',
        message: 'Custom cubic feet must be a positive number',
        code: 'INVALID_CUBIC_FEET'
      });
    }
  }
  
  // Validate optional force crew size
  if (inputs.forceCrewSize !== undefined) {
    if (typeof inputs.forceCrewSize !== 'number' || !Number.isInteger(inputs.forceCrewSize) || inputs.forceCrewSize < 2 || inputs.forceCrewSize > 7) {
      errors.push({
        field: 'forceCrewSize',
        message: 'Force crew size must be an integer between 2 and 7',
        code: 'INVALID_CREW_SIZE'
      });
    }
  }
  
  // Validate optional additional trucks
  if (inputs.additionalTrucks !== undefined) {
    if (typeof inputs.additionalTrucks !== 'number' || inputs.additionalTrucks < 0 || !Number.isInteger(inputs.additionalTrucks)) {
      errors.push({
        field: 'additionalTrucks',
        message: 'Additional trucks must be a non-negative integer',
        code: 'INVALID_DISTANCE'
      });
    }
  }
  
  // Validate optional emergency service
  if (inputs.emergencyService !== undefined && typeof inputs.emergencyService !== 'boolean') {
    errors.push({
      field: 'emergencyService',
      message: 'Emergency service must be a boolean',
      code: 'INVALID_HANDICAP_FACTORS'
    });
  }
  
  return errors;
}

/**
 * Simplified pricing calculation for quick estimates
 * Returns only essential pricing information
 */
export function calculateQuickPrice(
  moveSize: PricingInputs['moveSize'],
  serviceTier: PricingInputs['serviceTier'],
  serviceType: PricingInputs['serviceType'],
  distanceMiles: number
): { success: boolean; price?: number; timeHours?: number; error?: string } {
  try {
    const result = calculatePricing({
      moveSize,
      serviceTier,
      serviceType,
      distanceMiles,
      handicapFactors: { stairs: 0, walkFeet: 0, elevator: false }
    });
    
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.errors?.[0]?.message || 'Calculation failed'
      };
    }
    
    return {
      success: true,
      price: result.data.subtotal,
      timeHours: result.data.baseTimeHours
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected error'
    };
  }
}

/**
 * Get pricing breakdown for transparency
 * Useful for customer-facing applications
 */
export function getPricingBreakdown(inputs: PricingInputs): {
  success: boolean;
  breakdown?: {
    laborCost: number;
    travelCosts: number;
    additionalServices: number;
    total: number;
    timeEstimate: string;
    crewSize: number;
  };
  error?: string;
} {
  const result = calculatePricing(inputs);
  
  if (!result.success || !result.data) {
    return {
      success: false,
      error: result.errors?.[0]?.message || 'Calculation failed'
    };
  }
  
  const data = result.data;
  
  return {
    success: true,
    breakdown: {
      laborCost: data.laborCost,
      travelCosts: data.fuelCost + data.mileageCost,
      additionalServices: data.additionalTruckCost + data.emergencyServiceCost,
      total: data.subtotal,
      timeEstimate: data.daysSplit > 1 
        ? `${data.daysSplit} days (${data.baseTimeHours.toFixed(1)} total hours)`
        : `${data.baseTimeHours.toFixed(1)} hours`,
      crewSize: data.crewSize
    }
  };
}