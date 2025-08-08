/**
 * Moving Company Pricing Engine
 * Entry point for all pricing calculations across all 4 applications
 * 
 * This is the CORE PRICING ENGINE that serves:
 * - Marketing Website (quote estimates)
 * - CRM Web Application (detailed pricing)
 * - CRM Mobile Application (field pricing)
 * - Crew Mobile Application (job pricing)
 */

// Main Engine Functions
export {
  calculatePricing,
  calculateQuickPrice,
  getPricingBreakdown
} from './engine';

// Core Calculation Functions
export {
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

// Constants and Configuration
export {
  MOVE_SIZE_CUFT,
  SERVICE_SPEED,
  CREW_SIZE_BY_CUBIC_FEET,
  BASE_HOURLY_RATES,
  ADDITIONAL_RATES,
  HANDICAP_MODIFIERS,
  CREW_ADJUSTMENT_RULES,
  DAY_SPLIT_THRESHOLDS,
  MAX_CREW_SIZE,
  VALIDATION_LIMITS,
  PRICING_CONFIG,
  isValidCrewSize,
  getAvailableMoveSizes,
  getCubicFeetForMoveSize,
  getServiceSpeed
} from './constants';

// TypeScript Types
export type {
  // Core Types
  MoveSize,
  ServiceTier,
  ServiceType,
  MoveType,
  CrewSize,
  
  // Input/Output Types
  PricingInputs,
  PricingResult,
  PricingCalculationResult,
  HandicapFactors,
  ValidationError,
  
  // Configuration Types
  CrewSizeRule,
  BaseHourlyRates,
  AdditionalRates,
  CrewAdjustmentRule,
  ServiceSpeedConfig,
  MoveSizeCubicFeetMapping,
  PricingConfig,
  
  // Utility Types
  PositiveNumber,
  CubicFeet,
  DistanceMiles,
  Hours,
  Currency
} from './types';

// Error and Warning Codes
export {
  PricingErrorCode,
  PricingWarningCode
} from './types';

/**
 * Package Version and Metadata
 */
export const PRICING_ENGINE_VERSION = '1.0.0';
export const PRICING_ENGINE_NAME = 'Moving Company Core Pricing Engine';

/**
 * Quick validation function to check if pricing engine is properly configured
 */
export function validatePricingEngineSetup(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    // Test basic calculation
    const testResult = calculateQuickPrice(
      "2 Bedroom Apartment",
      "Full Service", 
      "Moving",
      20
    );
    
    if (!testResult.success) {
      errors.push(`Basic calculation test failed: ${testResult.error}`);
    }
    
    // Validate constants are loaded
    if (Object.keys(MOVE_SIZE_CUFT).length === 0) {
      errors.push('Move size cubic feet mapping is empty');
    }
    
    if (Object.keys(BASE_HOURLY_RATES).length === 0) {
      errors.push('Base hourly rates are empty');
    }
    
    // Check for any configuration inconsistencies
    if (CREW_SIZE_BY_CUBIC_FEET.length === 0) {
      errors.push('Crew size rules are empty');
    }
    
    if (CREW_ADJUSTMENT_RULES.length === 0) {
      errors.push('Crew adjustment rules are empty');
    }
    
  } catch (error) {
    errors.push(`Pricing engine setup validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get pricing engine information
 */
export function getPricingEngineInfo() {
  return {
    name: PRICING_ENGINE_NAME,
    version: PRICING_ENGINE_VERSION,
    supportedMoveSizes: Object.keys(MOVE_SIZE_CUFT),
    supportedServiceTiers: Object.keys(SERVICE_SPEED),
    supportedServiceTypes: Object.keys(BASE_HOURLY_RATES),
    maxCrewSize: MAX_CREW_SIZE,
    features: [
      'Cubic feet to crew size mapping',
      'Service tier speed calculations',
      'Handicap accessibility modifiers',
      'Dynamic crew size adjustments',
      'Multi-day move splitting',
      'Comprehensive cost breakdowns',
      'Input validation and error handling',
      'Regional/local move classification',
      'Emergency service surcharges',
      'Additional truck calculations'
    ]
  };
}