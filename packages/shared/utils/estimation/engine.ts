/**
 * Main Box Estimation Engine
 * Orchestrates all estimation calculations and provides integration with pricing engine
 */

import type {
  EstimationInputs,
  EstimationResult,
  ComprehensiveEstimationResult,
  EstimationValidationError,
  PricingIntegrationData,
  EstimationToPricingAdapter
} from './types';

import {
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

/**
 * Main estimation calculation engine
 * Returns comprehensive estimation with boxes, time, and materials
 */
export function calculateComprehensiveEstimation(inputs: EstimationInputs): EstimationResult {
  const errors: EstimationValidationError[] = [];
  const warnings: string[] = [];

  try {
    // Step 1: Input validation
    const inputValidationErrors = validateEstimationInputs(inputs);
    if (inputValidationErrors.length > 0) {
      return {
        success: false,
        errors: inputValidationErrors
      };
    }

    // Step 2: Calculate box estimation
    let boxEstimation;
    try {
      boxEstimation = calculateBoxEstimation(inputs);
      
      // Add warnings for edge cases
      if (boxEstimation.packingIntensityApplied !== 1.0) {
        const direction = boxEstimation.packingIntensityApplied > 1.0 ? "increased" : "decreased";
        warnings.push(
          `Box quantities ${direction} by ${(boxEstimation.packingIntensityApplied * 100).toFixed(0)}% due to ${inputs.packingIntensity} packing intensity`
        );
      }

      if (inputs.customRooms && Object.keys(inputs.customRooms).length > 0) {
        warnings.push(`Custom room counts applied: ${Object.keys(inputs.customRooms).join(", ")}`);
      }

    } catch (error) {
      errors.push({
        field: 'boxCalculation',
        message: error instanceof Error ? error.message : 'Box calculation error',
        code: 'CALCULATION_ERROR'
      });
      return { success: false, errors };
    }

    // Step 3: Determine crew size and calculate time
    const recommendedCrewSize = getRecommendedCrewSize(boxEstimation);
    const totalBoxCount = getTotalBoxCount(boxEstimation.totalBoxes);
    
    if (recommendedCrewSize >= 5) {
      warnings.push(`Large job detected: ${totalBoxCount} total boxes require ${recommendedCrewSize} crew members`);
    }

    let timeEstimation;
    try {
      timeEstimation = calculateTimeEstimation(
        boxEstimation, 
        recommendedCrewSize, 
        inputs.whiteGloveService || false
      );

      if (inputs.whiteGloveService) {
        warnings.push(
          `White Glove service adds ${(timeEstimation.packingTime.whiteGloveModifier * 100).toFixed(0)}% additional time for extra care`
        );
      }

      // Check for long job times
      const totalHours = timeEstimation.packingTime.totalHours + timeEstimation.unpackingTime.totalHours;
      if (totalHours > 8) {
        warnings.push(`Estimated total time: ${totalHours.toFixed(1)} hours may require multiple days`);
      }

    } catch (error) {
      errors.push({
        field: 'timeCalculation',
        message: error instanceof Error ? error.message : 'Time calculation error',
        code: 'CALCULATION_ERROR'
      });
      return { success: false, errors };
    }

    // Step 4: Calculate material costs
    let materialCosts;
    try {
      materialCosts = calculateMaterialCosts(boxEstimation, true); // Include TV box rentals

      if (materialCosts.rentalOptions && Object.keys(materialCosts.rentalOptions).length > 0) {
        const rentalSavings = Object.values(materialCosts.rentalOptions)
          .reduce((sum, option) => sum + option.totalCost, 0);
        const purchaseCost = Object.values(materialCosts.breakdown)
          .filter(item => item.quantity > 0)
          .reduce((sum, item) => sum + item.totalCost, 0);
        
        warnings.push(
          `TV box rentals available: potential savings of $${(purchaseCost - rentalSavings).toFixed(2)}`
        );
      }

    } catch (error) {
      errors.push({
        field: 'materialCalculation',
        message: error instanceof Error ? error.message : 'Material cost calculation error',
        code: 'CALCULATION_ERROR'
      });
      return { success: false, errors };
    }

    // Step 5: Build comprehensive result
    const result: ComprehensiveEstimationResult = {
      boxes: boxEstimation,
      time: timeEstimation,
      materials: materialCosts,
      inputs,
      generatedAt: new Date()
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
        message: error instanceof Error ? error.message : 'Unexpected estimation error',
        code: 'CALCULATION_ERROR'
      }]
    };
  }
}

/**
 * Quick estimation for basic scenarios
 * Returns only essential information for rapid quotes
 */
export function calculateQuickEstimation(
  propertyType: EstimationInputs['propertyType'],
  bedrooms: number,
  packingIntensity: EstimationInputs['packingIntensity']
): {
  success: boolean;
  totalBoxes?: number;
  estimatedHours?: number;
  materialCost?: number;
  crewSize?: number;
  error?: string;
} {
  try {
    const result = calculateComprehensiveEstimation({
      propertyType,
      bedrooms,
      packingIntensity
    });

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.errors?.[0]?.message || 'Estimation failed'
      };
    }

    const data = result.data;
    const totalBoxCount = getTotalBoxCount(data.boxes.totalBoxes);
    const totalHours = data.time.packingTime.totalHours + data.time.unpackingTime.totalHours;

    return {
      success: true,
      totalBoxes: totalBoxCount,
      estimatedHours: roundToDecimals(totalHours, 1),
      materialCost: data.materials.totalCost,
      crewSize: data.time.workersRequired
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected error'
    };
  }
}

/**
 * Get estimation breakdown for customer presentation
 * Provides clear, customer-friendly information
 */
export function getEstimationBreakdown(inputs: EstimationInputs): {
  success: boolean;
  breakdown?: {
    packingSupplies: number;
    packingTime: string;
    unpackingTime: string;
    totalTime: string;
    crewSize: number;
    boxTypes: Record<string, number>;
    intensity: string;
  };
  error?: string;
} {
  const result = calculateComprehensiveEstimation(inputs);

  if (!result.success || !result.data) {
    return {
      success: false,
      error: result.errors?.[0]?.message || 'Estimation failed'
    };
  }

  const data = result.data;
  
  // Format box types for customer display
  const boxTypes: Record<string, number> = {};
  Object.entries(data.boxes.totalBoxes).forEach(([type, count]) => {
    if (count > 0) {
      boxTypes[type] = count;
    }
  });

  return {
    success: true,
    breakdown: {
      packingSupplies: data.materials.totalCost,
      packingTime: `${data.time.packingTime.totalHours.toFixed(1)} hours`,
      unpackingTime: `${data.time.unpackingTime.totalHours.toFixed(1)} hours`,
      totalTime: `${(data.time.packingTime.totalHours + data.time.unpackingTime.totalHours).toFixed(1)} hours`,
      crewSize: data.time.workersRequired,
      boxTypes,
      intensity: inputs.packingIntensity
    }
  };
}

/**
 * Integration adapter for pricing engine
 * Converts estimation results to pricing engine inputs
 */
export class EstimationPricingAdapter implements EstimationToPricingAdapter {
  
  /**
   * Convert estimation results to pricing engine inputs
   */
  convertToPricingInputs(estimation: ComprehensiveEstimationResult): any {
    // Import pricing types if available
    // Note: In real implementation, this would import from ../pricing/types
    
    const totalHours = estimation.time.packingTime.totalHours + estimation.time.unpackingTime.totalHours;
    const complexityModifier = this.calculateServiceModifiers(estimation);
    
    return {
      // Additional costs that should be included in pricing
      materialCosts: estimation.materials.totalCost,
      packingServiceHours: totalHours,
      crewSizeOverride: estimation.time.workersRequired,
      serviceComplexityModifier: complexityModifier,
      
      // Metadata for pricing decisions
      estimationMetadata: {
        totalBoxes: getTotalBoxCount(estimation.boxes.totalBoxes),
        packingIntensity: estimation.inputs.packingIntensity,
        whiteGloveService: estimation.inputs.whiteGloveService || false,
        propertyType: estimation.inputs.propertyType,
        estimationType: estimation.boxes.estimationType
      }
    };
  }

  /**
   * Calculate service complexity modifiers based on estimation
   */
  calculateServiceModifiers(estimation: ComprehensiveEstimationResult): number {
    const baseModifier = getServiceComplexityModifier(estimation.inputs.packingIntensity);
    const totalBoxCount = getTotalBoxCount(estimation.boxes.totalBoxes);
    
    // Additional modifiers based on job complexity
    let modifier = baseModifier;
    
    // Large job modifier
    if (totalBoxCount > 100) {
      modifier *= 1.1;
    }
    
    // White glove modifier
    if (estimation.inputs.whiteGloveService) {
      modifier *= 1.2;
    }
    
    // Complex property type modifier
    if (estimation.inputs.propertyType === "Large Home") {
      modifier *= 1.05;
    }
    
    return roundToDecimals(modifier, 2);
  }

  /**
   * Get recommended crew size from estimation
   */
  getRecommendedCrewSize(estimation: ComprehensiveEstimationResult): number {
    return estimation.time.workersRequired;
  }
}

/**
 * Get pricing integration data
 * Simplified interface for pricing engine integration
 */
export function getPricingIntegrationData(estimation: ComprehensiveEstimationResult): PricingIntegrationData {
  const adapter = new EstimationPricingAdapter();
  
  return {
    materialCosts: estimation.materials.totalCost,
    packingTime: estimation.time.packingTime.totalHours,
    unpackingTime: estimation.time.unpackingTime.totalHours,
    totalBoxes: getTotalBoxCount(estimation.boxes.totalBoxes),
    crewSizeRecommendation: adapter.getRecommendedCrewSize(estimation),
    serviceComplexityModifier: adapter.calculateServiceModifiers(estimation)
  };
}

/**
 * Validate estimation configuration
 * Ensures all required configuration is present and valid
 */
export function validateEstimationConfiguration(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  try {
    // Check if all required constants are defined
    const { ESTIMATION_CONFIG } = require('./constants');
    
    if (!ESTIMATION_CONFIG.packingIntensityMultipliers) {
      errors.push('Missing packing intensity multipliers');
    }
    
    if (!ESTIMATION_CONFIG.roomBoxAllocations) {
      errors.push('Missing room box allocations');
    }
    
    if (!ESTIMATION_CONFIG.materialPricing) {
      errors.push('Missing material pricing');
    }
    
    if (!ESTIMATION_CONFIG.packingTimes || !ESTIMATION_CONFIG.unpackingTimes) {
      errors.push('Missing time calculations configuration');
    }
    
    // Validate price consistency
    const materialPrices = Object.values(ESTIMATION_CONFIG.materialPricing);
    if (materialPrices.some(price => price <= 0)) {
      errors.push('Invalid material prices detected (zero or negative values)');
    }
    
  } catch (error) {
    errors.push(`Configuration validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get system health and performance metrics
 */
export function getEstimationSystemMetrics(): {
  configurationValid: boolean;
  totalPropertyTypes: number;
  totalRoomTypes: number;
  totalFixedEstimates: number;
  materialItemCount: number;
  averageCalculationTime?: number;
} {
  const configValidation = validateEstimationConfiguration();
  
  return {
    configurationValid: configValidation.valid,
    totalPropertyTypes: 3, // Apartment, Normal Home, Large Home
    totalRoomTypes: 8, // All room types
    totalFixedEstimates: 9, // All fixed estimate types
    materialItemCount: Object.keys(require('./constants').MATERIAL_PRICING).length,
    // Note: averageCalculationTime would be measured in production
  };
}