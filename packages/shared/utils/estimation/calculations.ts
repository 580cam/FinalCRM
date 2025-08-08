/**
 * Box Estimation Calculation Engine
 * Core business logic for calculating boxes, time, and materials for moving jobs
 */

import type {
  EstimationInputs,
  BoxEstimationResult,
  TimeEstimationResult,
  MaterialCostResult,
  BoxAllocation,
  RoomType,
  BoxType,
  PropertyType,
  FixedEstimateType,
  PackingIntensity,
  EstimationValidationError
} from './types';

import {
  ESTIMATION_CONFIG,
  getPropertyConfiguration,
  getRoomBoxAllocation,
  getFixedEstimate,
  getMaterialPrice,
  getTVBoxPrice,
  BUSINESS_RULES,
  VALIDATION_LIMITS
} from './constants';

/**
 * Calculate total boxes needed based on property type and bedrooms
 * Handles both dynamic room-based calculation and fixed estimates
 */
export function calculateBoxEstimation(inputs: EstimationInputs): BoxEstimationResult {
  let totalBoxes: BoxAllocation;
  let roomBreakdown: Partial<Record<RoomType, BoxAllocation>>;
  let roomCount: Partial<Record<RoomType, number>>;
  let estimationType: "Dynamic" | "Fixed";

  // Handle fixed estimate types (studios, offices, storage units)
  if (inputs.fixedEstimateType) {
    totalBoxes = getFixedEstimate(inputs.fixedEstimateType);
    roomBreakdown = {}; // No room breakdown for fixed estimates
    roomCount = {};
    estimationType = "Fixed";
  } 
  // Handle dynamic property-based calculation
  else if (inputs.propertyType) {
    const result = calculateDynamicBoxes(
      inputs.propertyType,
      inputs.bedrooms || 1,
      inputs.customRooms
    );
    totalBoxes = result.totalBoxes;
    roomBreakdown = result.roomBreakdown;
    roomCount = result.roomCount;
    estimationType = "Dynamic";
  }
  // Fallback to minimal apartment if no type specified
  else {
    const result = calculateDynamicBoxes("Apartment", 1, inputs.customRooms);
    totalBoxes = result.totalBoxes;
    roomBreakdown = result.roomBreakdown;
    roomCount = result.roomCount;
    estimationType = "Dynamic";
  }

  // Apply packing intensity multiplier
  const multiplier = ESTIMATION_CONFIG.packingIntensityMultipliers[inputs.packingIntensity];
  totalBoxes = applyPackingIntensityMultiplier(totalBoxes, multiplier);

  // Apply multiplier to room breakdown as well
  const adjustedRoomBreakdown: Partial<Record<RoomType, BoxAllocation>> = {};
  Object.entries(roomBreakdown).forEach(([room, allocation]) => {
    adjustedRoomBreakdown[room as RoomType] = applyPackingIntensityMultiplier(allocation, multiplier);
  });

  return {
    totalBoxes,
    roomBreakdown: adjustedRoomBreakdown,
    packingIntensityApplied: multiplier,
    roomCount,
    estimationType
  };
}

/**
 * Calculate dynamic box allocation based on property type and bedrooms
 */
function calculateDynamicBoxes(
  propertyType: PropertyType,
  bedrooms: number,
  customRooms?: Partial<Record<RoomType, number>>
): {
  totalBoxes: BoxAllocation;
  roomBreakdown: Partial<Record<RoomType, BoxAllocation>>;
  roomCount: Partial<Record<RoomType, number>>;
} {
  const config = getPropertyConfiguration(propertyType);
  const roomCount: Partial<Record<RoomType, number>> = {};
  const roomBreakdown: Partial<Record<RoomType, BoxAllocation>> = {};

  // Add base rooms (always count of 1)
  config.baseRooms.forEach(room => {
    roomCount[room] = customRooms?.[room] || 1;
  });

  // Add bedrooms (dynamic count)
  if (bedrooms > 0) {
    roomCount["Bedroom"] = customRooms?.["Bedroom"] || bedrooms;
  }

  // Apply custom room overrides
  if (customRooms) {
    Object.entries(customRooms).forEach(([room, count]) => {
      if (count !== undefined && count > 0) {
        roomCount[room as RoomType] = count;
      }
    });
  }

  // Calculate total boxes by summing room allocations
  const totalBoxes: BoxAllocation = {
    Small: 0,
    Medium: 0,
    Large: 0,
    Wardrobe: 0,
    "Dish Pack": 0,
    "Mattress Bag": 0,
    "TV Box": 0
  };

  Object.entries(roomCount).forEach(([room, count]) => {
    const roomAllocation = getRoomBoxAllocation(room as RoomType);
    roomBreakdown[room as RoomType] = roomAllocation;

    // Multiply room allocation by count and add to total
    Object.entries(roomAllocation).forEach(([boxType, boxCount]) => {
      totalBoxes[boxType as BoxType] += boxCount * count;
    });
  });

  return { totalBoxes, roomBreakdown, roomCount };
}

/**
 * Apply packing intensity multiplier to box allocation
 */
function applyPackingIntensityMultiplier(
  boxes: BoxAllocation,
  multiplier: number
): BoxAllocation {
  const result: BoxAllocation = {
    Small: 0,
    Medium: 0,
    Large: 0,
    Wardrobe: 0,
    "Dish Pack": 0,
    "Mattress Bag": 0,
    "TV Box": 0
  };

  Object.entries(boxes).forEach(([boxType, count]) => {
    result[boxType as BoxType] = Math.ceil(count * multiplier);
  });

  return result;
}

/**
 * Calculate packing and unpacking time estimates
 */
export function calculateTimeEstimation(
  boxEstimation: BoxEstimationResult,
  workersRequired: number,
  whiteGloveService: boolean = false
): TimeEstimationResult {
  // Calculate base packing time
  const packingBreakdown: Record<BoxType, number> = {
    Small: 0, Medium: 0, Large: 0, Wardrobe: 0, 
    "Dish Pack": 0, "Mattress Bag": 0, "TV Box": 0
  };

  const unpackingBreakdown: Record<BoxType, number> = {
    Small: 0, Medium: 0, Large: 0, Wardrobe: 0, 
    "Dish Pack": 0, "Mattress Bag": 0, "TV Box": 0
  };

  let packingTotalMinutes = 0;
  let unpackingTotalMinutes = 0;

  // Calculate time per box type
  Object.entries(boxEstimation.totalBoxes).forEach(([boxType, quantity]) => {
    const packingTimePerBox = ESTIMATION_CONFIG.packingTimes[boxType as BoxType];
    const unpackingTimePerBox = ESTIMATION_CONFIG.unpackingTimes[boxType as BoxType];
    
    const packingMinutes = (quantity * packingTimePerBox) / workersRequired;
    const unpackingMinutes = (quantity * unpackingTimePerBox) / workersRequired;
    
    packingBreakdown[boxType as BoxType] = packingMinutes;
    unpackingBreakdown[boxType as BoxType] = unpackingMinutes;
    
    packingTotalMinutes += packingMinutes;
    unpackingTotalMinutes += unpackingMinutes;
  });

  // Calculate room penalty (extra time per room)
  const totalRooms = Object.values(boxEstimation.roomCount).reduce((sum, count) => sum + count, 0);
  const packingRoomPenalty = totalRooms * ESTIMATION_CONFIG.roomTimePenalty.packing / workersRequired;
  const unpackingRoomPenalty = totalRooms * ESTIMATION_CONFIG.roomTimePenalty.unpacking / workersRequired;

  packingTotalMinutes += packingRoomPenalty;
  unpackingTotalMinutes += unpackingRoomPenalty;

  // Apply white glove modifier if requested
  const whiteGloveModifier = whiteGloveService ? ESTIMATION_CONFIG.whiteGloveTimeModifier : 0;
  
  if (whiteGloveService) {
    packingTotalMinutes *= (1 + whiteGloveModifier);
    unpackingTotalMinutes *= (1 + whiteGloveModifier);
  }

  return {
    packingTime: {
      totalMinutes: Math.ceil(packingTotalMinutes),
      totalHours: packingTotalMinutes / 60,
      breakdown: packingBreakdown,
      roomPenalty: packingRoomPenalty,
      whiteGloveModifier: whiteGloveModifier
    },
    unpackingTime: {
      totalMinutes: Math.ceil(unpackingTotalMinutes),
      totalHours: unpackingTotalMinutes / 60,
      breakdown: unpackingBreakdown,
      roomPenalty: unpackingRoomPenalty,
      whiteGloveModifier: whiteGloveModifier
    },
    workersRequired
  };
}

/**
 * Calculate material costs based on box quantities
 */
export function calculateMaterialCosts(
  boxEstimation: BoxEstimationResult,
  includeTVBoxRentals: boolean = true
): MaterialCostResult {
  const breakdown: Record<string, { quantity: number; unitCost: number; totalCost: number }> = {};
  const rentalOptions: Record<string, { quantity: number; unitCost: number; totalCost: number }> = {};
  let totalCost = 0;

  Object.entries(boxEstimation.totalBoxes).forEach(([boxType, quantity]) => {
    if (quantity > 0) {
      let unitCost: number;
      let materialName: string;

      // Handle TV boxes separately for rental options
      if (boxType === "TV Box") {
        materialName = "TV Box (Large)";
        unitCost = getTVBoxPrice("Large TV Box", false);
        
        // Add rental option
        if (includeTVBoxRentals) {
          const rentalUnitCost = getTVBoxPrice("Large TV Box", true);
          rentalOptions[`${materialName} (Rental)`] = {
            quantity,
            unitCost: rentalUnitCost,
            totalCost: quantity * rentalUnitCost
          };
        }
      } else {
        materialName = boxType;
        unitCost = getMaterialPrice(boxType);
      }

      const itemTotalCost = quantity * unitCost;
      
      breakdown[materialName] = {
        quantity,
        unitCost,
        totalCost: itemTotalCost
      };
      
      totalCost += itemTotalCost;
    }
  });

  return {
    totalCost: Math.round(totalCost * 100) / 100, // Round to 2 decimal places
    breakdown,
    rentalOptions: includeTVBoxRentals && Object.keys(rentalOptions).length > 0 
      ? rentalOptions 
      : undefined
  };
}

/**
 * Get recommended crew size based on total box count
 */
export function getRecommendedCrewSize(boxEstimation: BoxEstimationResult): number {
  const totalBoxCount = Object.values(boxEstimation.totalBoxes).reduce((sum, count) => sum + count, 0);
  
  for (const rule of BUSINESS_RULES.CREW_SIZE_BY_BOX_COUNT) {
    if (totalBoxCount <= rule.maxBoxes) {
      return rule.crew;
    }
  }
  
  return 6; // Maximum crew size
}

/**
 * Calculate service complexity modifier based on packing intensity
 */
export function getServiceComplexityModifier(packingIntensity: PackingIntensity): number {
  return BUSINESS_RULES.COMPLEXITY_MODIFIERS[packingIntensity];
}

/**
 * Get total box count from box allocation
 */
export function getTotalBoxCount(boxes: BoxAllocation): number {
  return Object.values(boxes).reduce((sum, count) => sum + count, 0);
}

/**
 * Validate estimation inputs
 */
export function validateEstimationInputs(inputs: EstimationInputs): EstimationValidationError[] {
  const errors: EstimationValidationError[] = [];

  // Must have either property type or fixed estimate type
  if (!inputs.propertyType && !inputs.fixedEstimateType) {
    errors.push({
      field: 'estimationType',
      message: 'Must specify either propertyType or fixedEstimateType',
      code: 'MISSING_REQUIRED_INPUTS'
    });
  }

  // Cannot have both property type and fixed estimate type
  if (inputs.propertyType && inputs.fixedEstimateType) {
    errors.push({
      field: 'estimationType',
      message: 'Cannot specify both propertyType and fixedEstimateType',
      code: 'INVALID_PROPERTY_TYPE'
    });
  }

  // Validate bedroom count if property type is specified
  if (inputs.propertyType && inputs.bedrooms !== undefined) {
    const config = getPropertyConfiguration(inputs.propertyType);
    
    if (inputs.bedrooms < config.minBedrooms || inputs.bedrooms > config.maxBedrooms) {
      errors.push({
        field: 'bedrooms',
        message: `Bedroom count must be between ${config.minBedrooms} and ${config.maxBedrooms} for ${inputs.propertyType}`,
        code: 'INVALID_BEDROOM_COUNT'
      });
    }
  }

  // Validate packing intensity
  if (!inputs.packingIntensity || !ESTIMATION_CONFIG.packingIntensityMultipliers[inputs.packingIntensity]) {
    errors.push({
      field: 'packingIntensity',
      message: 'Valid packing intensity is required',
      code: 'INVALID_PACKING_INTENSITY'
    });
  }

  // Validate custom rooms if provided
  if (inputs.customRooms) {
    Object.entries(inputs.customRooms).forEach(([room, count]) => {
      if (count !== undefined) {
        if (!Number.isInteger(count) || count < VALIDATION_LIMITS.MIN_CUSTOM_ROOMS || count > VALIDATION_LIMITS.MAX_CUSTOM_ROOMS) {
          errors.push({
            field: `customRooms.${room}`,
            message: `Custom room count must be an integer between ${VALIDATION_LIMITS.MIN_CUSTOM_ROOMS} and ${VALIDATION_LIMITS.MAX_CUSTOM_ROOMS}`,
            code: 'INVALID_CUSTOM_ROOMS'
          });
        }
      }
    });
  }

  // Validate white glove service flag
  if (inputs.whiteGloveService !== undefined && typeof inputs.whiteGloveService !== 'boolean') {
    errors.push({
      field: 'whiteGloveService',
      message: 'White glove service must be a boolean',
      code: 'INVALID_PACKING_INTENSITY'
    });
  }

  return errors;
}

/**
 * Round numbers to specified decimal places
 */
export function roundToDecimals(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Calculate efficiency factor based on various conditions
 * Used for time estimate adjustments
 */
export function calculateEfficiencyFactor(
  packingIntensity: PackingIntensity,
  whiteGloveService: boolean,
  totalBoxCount: number
): number {
  let factor = BUSINESS_RULES.EFFICIENCY_FACTORS.STANDARD_EFFICIENCY;

  // Adjust for packing intensity
  switch (packingIntensity) {
    case "Less than Normal":
      factor *= 1.1; // Faster with fewer items
      break;
    case "More than Normal":
      factor *= 0.9; // Slower with more items
      break;
  }

  // Adjust for white glove service (already accounted in time calculations)
  if (whiteGloveService) {
    factor *= 0.95; // Slightly slower due to extra care
  }

  // Adjust for large jobs (economy of scale)
  if (totalBoxCount > 100) {
    factor *= 1.05; // Slight efficiency gain on large jobs
  }

  // Ensure factor stays within reasonable bounds
  return Math.max(
    BUSINESS_RULES.EFFICIENCY_FACTORS.MIN_EFFICIENCY,
    Math.min(BUSINESS_RULES.EFFICIENCY_FACTORS.MAX_EFFICIENCY, factor)
  );
}