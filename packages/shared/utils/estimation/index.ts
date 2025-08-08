/**
 * Box Estimation System - Main Export Index
 * Provides clean public API for all 4 applications to use
 */

// Main engine functions
export {
  calculateComprehensiveEstimation,
  calculateQuickEstimation,
  getEstimationBreakdown,
  EstimationPricingAdapter,
  getPricingIntegrationData,
  validateEstimationConfiguration,
  getEstimationSystemMetrics
} from './engine';

// Calculation utilities
export {
  calculateBoxEstimation,
  calculateTimeEstimation,
  calculateMaterialCosts,
  getRecommendedCrewSize,
  getServiceComplexityModifier,
  getTotalBoxCount,
  validateEstimationInputs,
  roundToDecimals,
  calculateEfficiencyFactor
} from './calculations';

// Configuration and constants
export {
  ESTIMATION_CONFIG,
  PACKING_INTENSITY_MULTIPLIERS,
  PROPERTY_TYPE_CONFIGURATIONS,
  ROOM_BOX_ALLOCATIONS,
  FIXED_ESTIMATES,
  PACKING_TIMES,
  UNPACKING_TIMES,
  ROOM_TIME_PENALTY,
  MATERIAL_PRICING,
  TV_BOX_PRICING,
  WHITE_GLOVE_TIME_MODIFIER,
  VALIDATION_LIMITS,
  BUSINESS_RULES,
  getPropertyConfiguration,
  getRoomBoxAllocation,
  getFixedEstimate,
  getMaterialPrice,
  getTVBoxPrice
} from './constants';

// Type definitions
export type {
  // Input types
  EstimationInputs,
  PropertyType,
  FixedEstimateType,
  PackingIntensity,
  RoomType,
  BoxType,
  MaterialType,
  BedroomCount,
  
  // Result types
  EstimationResult,
  ComprehensiveEstimationResult,
  BoxEstimationResult,
  TimeEstimationResult,
  MaterialCostResult,
  
  // Configuration types
  BoxAllocation,
  RoomBoxAllocation,
  PropertyConfiguration,
  PropertyTypeConfiguration,
  PackingTimes,
  UnpackingTimes,
  RoomTimePenalty,
  MaterialPricing,
  TVBoxPricing,
  EstimationConfig,
  
  // Integration types
  PricingIntegrationData,
  EstimationToPricingAdapter,
  
  // Validation types
  EstimationValidationError,
  
  // Utility types
  PositiveInteger,
  Minutes,
  Hours,
  Currency
} from './types';

// Error and warning codes
export {
  EstimationErrorCode,
  EstimationWarningCode
} from './types';

// Re-export pricing engine types for integration
export type {
  PricingInputs,
  PricingResult,
  PricingCalculationResult,
  ServiceTier,
  ServiceType,
  MoveSize,
  MoveType
} from '../pricing/types';

// Utility functions for common operations
export const EstimationUtils = {
  /**
   * Quick calculation for simple scenarios
   */
  quickEstimate: calculateQuickEstimation,
  
  /**
   * Get total box count from box allocation
   */
  getTotalBoxes: getTotalBoxCount,
  
  /**
   * Validate inputs before calculation
   */
  validateInputs: validateEstimationInputs,
  
  /**
   * Get crew size recommendation
   */
  getCrewSize: getRecommendedCrewSize,
  
  /**
   * Calculate service complexity
   */
  getComplexity: getServiceComplexityModifier,
  
  /**
   * Round numbers consistently
   */
  round: roundToDecimals
};

// Pre-configured estimation scenarios for common use cases
export const CommonEstimationScenarios = {
  /**
   * Studio apartment estimation
   */
  studioApartment: (packingIntensity: PackingIntensity) => ({
    fixedEstimateType: "Studio Apartment" as FixedEstimateType,
    packingIntensity
  }),
  
  /**
   * Small apartment estimation (1-2 bedrooms)
   */
  smallApartment: (bedrooms: 1 | 2, packingIntensity: PackingIntensity) => ({
    propertyType: "Apartment" as PropertyType,
    bedrooms,
    packingIntensity
  }),
  
  /**
   * Family home estimation (2-4 bedrooms)
   */
  familyHome: (bedrooms: 2 | 3 | 4, packingIntensity: PackingIntensity) => ({
    propertyType: "Normal Home" as PropertyType,
    bedrooms,
    packingIntensity
  }),
  
  /**
   * Large home estimation (3-5 bedrooms)
   */
  largeHome: (bedrooms: 3 | 4 | 5, packingIntensity: PackingIntensity, whiteGlove: boolean = false) => ({
    propertyType: "Large Home" as PropertyType,
    bedrooms,
    packingIntensity,
    whiteGloveService: whiteGlove
  }),
  
  /**
   * Small office estimation
   */
  smallOffice: (packingIntensity: PackingIntensity) => ({
    fixedEstimateType: "Office (Small)" as FixedEstimateType,
    packingIntensity
  }),
  
  /**
   * Storage unit estimation
   */
  storageUnit: (size: "5 x 10" | "10 x 10" | "10 x 15" | "10 x 20", packingIntensity: PackingIntensity) => ({
    fixedEstimateType: `${size} Storage Unit` as FixedEstimateType,
    packingIntensity
  })
};

// Integration helpers for pricing engine
export const PricingIntegration = {
  /**
   * Convert estimation to pricing engine format
   */
  toPricingInputs: (estimation: ComprehensiveEstimationResult) => {
    const adapter = new EstimationPricingAdapter();
    return adapter.convertToPricingInputs(estimation);
  },
  
  /**
   * Get pricing integration data
   */
  getPricingData: getPricingIntegrationData,
  
  /**
   * Calculate service modifiers for pricing
   */
  getServiceModifiers: (estimation: ComprehensiveEstimationResult) => {
    const adapter = new EstimationPricingAdapter();
    return adapter.calculateServiceModifiers(estimation);
  }
};

// System health and diagnostics
export const SystemDiagnostics = {
  /**
   * Validate system configuration
   */
  validateConfig: validateEstimationConfiguration,
  
  /**
   * Get system metrics
   */
  getMetrics: getEstimationSystemMetrics,
  
  /**
   * Test system functionality
   */
  runSmokeTest: () => {
    const testInput: EstimationInputs = {
      propertyType: "Apartment",
      bedrooms: 2,
      packingIntensity: "Normal"
    };
    
    const result = calculateComprehensiveEstimation(testInput);
    return {
      success: result.success,
      hasData: !!result.data,
      configValid: validateEstimationConfiguration().valid
    };
  }
};

// Export version for tracking
export const ESTIMATION_SYSTEM_VERSION = "1.0.0";

// Default export for convenience
export default {
  // Main functions
  calculate: calculateComprehensiveEstimation,
  quickEstimate: calculateQuickEstimation,
  getBreakdown: getEstimationBreakdown,
  
  // Utilities
  utils: EstimationUtils,
  scenarios: CommonEstimationScenarios,
  pricing: PricingIntegration,
  diagnostics: SystemDiagnostics,
  
  // Configuration
  config: ESTIMATION_CONFIG,
  version: ESTIMATION_SYSTEM_VERSION
};