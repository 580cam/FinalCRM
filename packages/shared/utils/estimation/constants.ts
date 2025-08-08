/**
 * Box Estimation System Constants and Configuration
 * All business rules, room allocations, and pricing centralized for easy maintenance
 */

import type {
  PackingIntensityMultipliers,
  PropertyTypeConfiguration,
  RoomBoxAllocation,
  FixedEstimateType,
  BoxAllocation,
  PackingTimes,
  UnpackingTimes,
  RoomTimePenalty,
  MaterialPricing,
  TVBoxPricing,
  EstimationConfig,
  PropertyType,
  RoomType
} from './types';

/**
 * Packing Intensity Multipliers
 * Applied to all box calculations based on customer belongings density
 */
export const PACKING_INTENSITY_MULTIPLIERS: PackingIntensityMultipliers = {
  "Less than Normal": 0.75,  // Minimal belongings
  "Normal": 1.0,             // Standard household
  "More than Normal": 1.5    // Extensive belongings
};

/**
 * Property Type Configurations
 * Defines base rooms and bedroom ranges for each property type
 */
export const PROPERTY_TYPE_CONFIGURATIONS: PropertyTypeConfiguration = {
  "Apartment": {
    baseRooms: ["Living Room", "Kitchen"],
    minBedrooms: 0,
    maxBedrooms: 5,
    description: "Basic apartment with living room and kitchen, plus bedrooms"
  },
  "Normal Home": {
    baseRooms: ["Living Room", "Kitchen", "Dining Room", "Garage"],
    minBedrooms: 1,
    maxBedrooms: 5,
    description: "Standard house with common areas and garage, plus bedrooms"
  },
  "Large Home": {
    baseRooms: ["Living Room", "Kitchen", "Dining Room", "Garage", "Office", "Patio/Shed", "Attic/Basement"],
    minBedrooms: 1,
    maxBedrooms: 5,
    description: "Large house with all common spaces and utility areas, plus bedrooms"
  }
};

/**
 * Per-Room Box Allocation (EXACT COUNTS as specified)
 * Each room type has precise box requirements based on typical contents
 */
export const ROOM_BOX_ALLOCATIONS: RoomBoxAllocation = {
  "Bedroom": {
    "Small": 4,
    "Medium": 6,
    "Large": 2,
    "Wardrobe": 2,
    "Dish Pack": 1,
    "Mattress Bag": 1,
    "TV Box": 1
  },
  "Living Room": {
    "Small": 3,
    "Medium": 5,
    "Large": 3,
    "Wardrobe": 1,
    "Dish Pack": 1,
    "Mattress Bag": 0,
    "TV Box": 1
  },
  "Kitchen": {
    "Small": 4,
    "Medium": 6,
    "Large": 2,
    "Wardrobe": 0,
    "Dish Pack": 3,
    "Mattress Bag": 0,
    "TV Box": 0
  },
  "Dining Room": {
    "Small": 2,
    "Medium": 3,
    "Large": 2,
    "Wardrobe": 0,
    "Dish Pack": 1,
    "Mattress Bag": 0,
    "TV Box": 0
  },
  "Garage": {
    "Small": 5,
    "Medium": 7,
    "Large": 3,
    "Wardrobe": 0,
    "Dish Pack": 1,
    "Mattress Bag": 0,
    "TV Box": 0
  },
  "Office": {
    "Small": 3,
    "Medium": 4,
    "Large": 2,
    "Wardrobe": 0,
    "Dish Pack": 1,
    "Mattress Bag": 0,
    "TV Box": 1
  },
  "Patio/Shed": {
    "Small": 2,
    "Medium": 3,
    "Large": 3,
    "Wardrobe": 0,
    "Dish Pack": 1,
    "Mattress Bag": 0,
    "TV Box": 0
  },
  "Attic/Basement": {
    "Small": 3,
    "Medium": 5,
    "Large": 3,
    "Wardrobe": 0,
    "Dish Pack": 1,
    "Mattress Bag": 0,
    "TV Box": 0
  }
};

/**
 * Fixed Estimates for Studios, Offices, and Storage Units
 * Predefined box counts based on space size and typical contents
 */
export const FIXED_ESTIMATES: Record<FixedEstimateType, BoxAllocation> = {
  "Studio Apartment": {
    "Small": 8,
    "Medium": 12,
    "Large": 6,
    "Wardrobe": 2,
    "Dish Pack": 2,
    "Mattress Bag": 1,
    "TV Box": 1
  },
  "Office (Small)": {
    "Small": 10,
    "Medium": 15,
    "Large": 8,
    "Wardrobe": 0,
    "Dish Pack": 2,
    "Mattress Bag": 0,
    "TV Box": 2
  },
  "Office (Medium)": {
    "Small": 20,
    "Medium": 30,
    "Large": 15,
    "Wardrobe": 0,
    "Dish Pack": 4,
    "Mattress Bag": 0,
    "TV Box": 4
  },
  "Office (Large)": {
    "Small": 35,
    "Medium": 50,
    "Large": 25,
    "Wardrobe": 0,
    "Dish Pack": 8,
    "Mattress Bag": 0,
    "TV Box": 6
  },
  "5 x 10 Storage Unit": {
    "Small": 6,
    "Medium": 8,
    "Large": 4,
    "Wardrobe": 1,
    "Dish Pack": 1,
    "Mattress Bag": 0,
    "TV Box": 1
  },
  "5 x 15 Storage Unit": {
    "Small": 9,
    "Medium": 12,
    "Large": 6,
    "Wardrobe": 2,
    "Dish Pack": 2,
    "Mattress Bag": 0,
    "TV Box": 1
  },
  "10 x 10 Storage Unit": {
    "Small": 12,
    "Medium": 16,
    "Large": 8,
    "Wardrobe": 2,
    "Dish Pack": 2,
    "Mattress Bag": 1,
    "TV Box": 2
  },
  "10 x 15 Storage Unit": {
    "Small": 18,
    "Medium": 24,
    "Large": 12,
    "Wardrobe": 3,
    "Dish Pack": 3,
    "Mattress Bag": 1,
    "TV Box": 2
  },
  "10 x 20 Storage Unit": {
    "Small": 24,
    "Medium": 32,
    "Large": 16,
    "Wardrobe": 4,
    "Dish Pack": 4,
    "Mattress Bag": 2,
    "TV Box": 3
  }
};

/**
 * Packing Time (Minutes per Box per Worker)
 * Includes time for packing, wrapping, and securing each box type
 */
export const PACKING_TIMES: PackingTimes = {
  "Small": 5,
  "Medium": 7,
  "Large": 9,
  "Wardrobe": 10,
  "Dish Pack": 14,
  "Mattress Bag": 5,
  "TV Box": 6
};

/**
 * Unpacking Time (Minutes per Box per Worker)
 * Includes time for unpacking, placing items, and disposing of materials
 */
export const UNPACKING_TIMES: UnpackingTimes = {
  "Small": 4,
  "Medium": 6,
  "Large": 8,
  "Wardrobe": 8,
  "Dish Pack": 12,
  "Mattress Bag": 4,
  "TV Box": 5
};

/**
 * Extra Time Per Room (Minutes)
 * Additional time for room setup, labeling, and organization
 */
export const ROOM_TIME_PENALTY: RoomTimePenalty = {
  packing: 15,   // wrapping, labeling, setup per room
  unpacking: 15  // setup, disposal, organization per room
};

/**
 * Packing Materials Purchase Prices (USD)
 * Current market pricing for all packing materials
 */
export const MATERIAL_PRICING: MaterialPricing = {
  // Standard boxes
  "Small": 1.85,
  "Medium": 2.66,
  "Large": 3.33,
  "Extra Large": 4.68,
  
  // Specialty boxes
  "Wardrobe": 29.03,
  "Medium TV Box": 27.34,
  "Large TV Box": 40.49,
  "Extra Large TV Box": 53.93,
  "Lamp Box": 8.03,
  "Mirror Box": 9.38,
  "Large Mirror Box": 11.14,
  "4-Way Mirror Box": 13.43,
  "Dish Pack": 10.94,
  
  // Mattress bags
  "Twin Mattress Bag": 10.73,
  "Full Mattress Bag": 11.46,
  "Queen Mattress Bag": 12.49,
  "King Mattress Bag": 13.43,
  
  // Protection materials
  "Skin Blanket": 12.00,
  "Paper Pad": 4.59,
  
  // Standard box mappings for estimation system
  "TV Box": 40.49,      // Default to Large TV Box
  "Mattress Bag": 12.49 // Default to Queen Mattress Bag
};

/**
 * TV Box Rental Pricing (50% of Purchase Price)
 * All TV boxes available at rental rates
 */
export const TV_BOX_PRICING: TVBoxPricing = {
  purchase: {
    "Medium TV Box": 27.34,
    "Large TV Box": 40.49,
    "Extra Large TV Box": 53.93,
    "TV Box": 40.49 // Default mapping
  },
  rental: {
    "Medium TV Box": 13.67,    // 50% of purchase
    "Large TV Box": 20.25,     // 50% of purchase
    "Extra Large TV Box": 26.97, // 50% of purchase
    "TV Box": 20.25            // Default mapping
  }
};

/**
 * White Glove Service Time Modifier
 * Additional time percentage for extra care and attention to detail
 */
export const WHITE_GLOVE_TIME_MODIFIER = 0.20; // 20% increase

/**
 * Validation Limits
 * Business constraints for input validation
 */
export const VALIDATION_LIMITS = {
  MIN_BEDROOMS: 0,
  MAX_BEDROOMS: 5,
  MIN_CUSTOM_ROOMS: 0,
  MAX_CUSTOM_ROOMS: 10,
  MIN_WORKERS: 1,
  MAX_WORKERS: 8
} as const;

/**
 * Complete Estimation Configuration
 * Centralized configuration object for easy import and testing
 */
export const ESTIMATION_CONFIG: EstimationConfig = {
  packingIntensityMultipliers: PACKING_INTENSITY_MULTIPLIERS,
  propertyTypes: PROPERTY_TYPE_CONFIGURATIONS,
  roomBoxAllocations: ROOM_BOX_ALLOCATIONS,
  fixedEstimates: FIXED_ESTIMATES,
  packingTimes: PACKING_TIMES,
  unpackingTimes: UNPACKING_TIMES,
  roomTimePenalty: ROOM_TIME_PENALTY,
  materialPricing: MATERIAL_PRICING,
  tvBoxPricing: TV_BOX_PRICING,
  whiteGloveTimeModifier: WHITE_GLOVE_TIME_MODIFIER
};

/**
 * Utility Functions for Configuration Access
 */
export const getPropertyConfiguration = (propertyType: PropertyType) => {
  return PROPERTY_TYPE_CONFIGURATIONS[propertyType];
};

export const getRoomBoxAllocation = (roomType: RoomType): BoxAllocation => {
  return ROOM_BOX_ALLOCATIONS[roomType];
};

export const getFixedEstimate = (estimateType: FixedEstimateType): BoxAllocation => {
  return FIXED_ESTIMATES[estimateType];
};

export const getMaterialPrice = (materialName: string): number => {
  return MATERIAL_PRICING[materialName] || 0;
};

export const getTVBoxPrice = (boxType: string, isRental: boolean = false): number => {
  const priceSet = isRental ? TV_BOX_PRICING.rental : TV_BOX_PRICING.purchase;
  return priceSet[boxType] || priceSet["TV Box"] || 0;
};

/**
 * Business Logic Constants
 */
export const BUSINESS_RULES = {
  // Recommended crew sizes based on total box count
  CREW_SIZE_BY_BOX_COUNT: [
    { maxBoxes: 30, crew: 2 },
    { maxBoxes: 60, crew: 3 },
    { maxBoxes: 90, crew: 4 },
    { maxBoxes: 120, crew: 5 },
    { maxBoxes: Infinity, crew: 6 }
  ],
  
  // Service complexity modifiers based on packing intensity
  COMPLEXITY_MODIFIERS: {
    "Less than Normal": 0.9,  // Simpler service
    "Normal": 1.0,            // Standard complexity
    "More than Normal": 1.2   // More complex service
  },
  
  // Time efficiency factors
  EFFICIENCY_FACTORS: {
    MIN_EFFICIENCY: 0.8,      // Worst case scenario
    STANDARD_EFFICIENCY: 1.0,  // Normal operations
    MAX_EFFICIENCY: 1.3       // Best case scenario
  }
} as const;