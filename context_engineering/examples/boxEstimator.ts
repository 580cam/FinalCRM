import { ChargeValue, createChargeValue } from "@/lib/chargeUtils";

// Define types for box counts
export interface BoxCounts {
  small: number;
  medium: number;
  large: number;
  wardrobe: number;
  dishPack: number;
  mattressBag: number;
  tvBox: number;
}

// Define packing intensity types and multipliers
export type PackingIntensity = "Less than Normal" | "Normal" | "More than Normal";
export const INTENSITY_MULTIPLIERS: { [key in PackingIntensity]: number } = {
  "Less than Normal": 0.75,
  "Normal": 1.00,
  "More than Normal": 1.50,
};

// Base counts per room (Normal Intensity)
export const BASE_BOXES_PER_ROOM: { [roomType: string]: Partial<BoxCounts> } = {
  Bedroom: { small: 4, medium: 6, large: 2, wardrobe: 2, dishPack: 1, mattressBag: 1, tvBox: 1 },
  LivingRoom: { small: 3, medium: 5, large: 3, wardrobe: 1, dishPack: 1, tvBox: 1 },
  Kitchen: { small: 4, medium: 6, large: 2, wardrobe: 0, dishPack: 3 },
  DiningRoom: { small: 2, medium: 3, large: 2, wardrobe: 0, dishPack: 1 },
  Garage: { small: 5, medium: 7, large: 3, wardrobe: 0, dishPack: 1 },
  Office: { small: 3, medium: 4, large: 2, wardrobe: 0, dishPack: 1, tvBox: 1 },
  PatioShed: { small: 2, medium: 3, large: 3, wardrobe: 0, dishPack: 1 },
  AtticBasement: { small: 3, medium: 5, large: 3, wardrobe: 0, dishPack: 1 },
};

// Property Type Definitions (Rooms included)
export const PROPERTY_ROOMS: { [propertyType: string]: string[] } = {
  Apartment: ["LivingRoom", "Kitchen"], // Bedrooms added dynamically
  NormalHome: ["LivingRoom", "Kitchen", "DiningRoom", "Garage"], // Bedrooms added dynamically
  LargeHome: ["LivingRoom", "Kitchen", "DiningRoom", "Garage", "Office", "PatioShed", "AtticBasement"], // Bedrooms added dynamically
};

// Fixed Estimates for Non-Standard Types (Normal Intensity)
export const FIXED_ESTIMATES: { [propertyType: string]: Partial<BoxCounts> } = {
  "Office (Small)": { small: 20, medium: 30, large: 12, wardrobe: 0, dishPack: 4, tvBox: 1 },
  "Office (Medium)": { small: 30, medium: 45, large: 18, wardrobe: 0, dishPack: 6, tvBox: 2 },
  "Office (Large)": { small: 40, medium: 60, large: 24, wardrobe: 0, dishPack: 8, tvBox: 2 },
  "Room or Less": { small: 2, medium: 3, large: 1, wardrobe: 0, dishPack: 1 },
  "Studio Apartment": { small: 8, medium: 13, large: 5, wardrobe: 3, dishPack: 4, mattressBag: 1, tvBox: 1 },
  "5 x 10 Storage Unit": { small: 10, medium: 15, large: 6, wardrobe: 1, dishPack: 2, tvBox: 1 },
  "5 x 15 Storage Unit": { small: 15, medium: 22, large: 9, wardrobe: 2, dishPack: 3, mattressBag: 1, tvBox: 1 },
  "10 x 10 Storage Unit": { small: 18, medium: 27, large: 11, wardrobe: 2, dishPack: 3, mattressBag: 1, tvBox: 1 },
  "10 x 15 Storage Unit": { small: 25, medium: 38, large: 16, wardrobe: 3, dishPack: 4, mattressBag: 2, tvBox: 2 },
  "10 x 20 Storage Unit": { small: 28, medium: 42, large: 18, wardrobe: 6, dishPack: 7, mattressBag: 3, tvBox: 4 },
};

// Box prices (for cost calculation)
export const BOX_PRICES = {
  small: 3.00,
  medium: 4.50,
  large: 5.00,
  dishPack: 8.00,
  wardrobe: 12.00,
  tvBox: 10.00,
  mattressBag: 10.00
};

// Time constants (minutes per box/item per worker)
export const TIME_PER_BOX_PACKING = {
  small: 5,
  medium: 7,
  large: 9,
  wardrobe: 10,
  dishPack: 14,
  mattressBag: 5,
  tvBox: 6,
};

export const TIME_PER_BOX_UNPACKING = {
  small: 4,
  medium: 6,
  large: 8,
  wardrobe: 8,
  dishPack: 12,
  mattressBag: 4,
  tvBox: 5,
};

// Extra flat time constants (minutes per room per worker)
export const EXTRA_TIME_PER_ROOM_PACKING = 15; // For wrapping, labeling, etc.
export const EXTRA_TIME_PER_ROOM_UNPACKING = 15; // For setup, disposal, etc.

// Interface for box estimate input
export interface BoxEstimateInput {
  propertyType: string; // Matches keys in PROPERTY_ROOMS or FIXED_ESTIMATES
  bedrooms?: number; // Required for Apartment, NormalHome, LargeHome
  packingIntensity: PackingIntensity;
}

/**
 * Maps a move size to a property type for box estimation
 */
export function mapMoveSizeToPropertyType(moveSize: string): string {
  // Direct mapping for fixed estimates
  if (moveSize in FIXED_ESTIMATES) {
    return moveSize;
  }

  // Simple mapping based on keywords
  if (moveSize.includes("(Large)")) {
    return "LargeHome";
  }
  
  if (moveSize.includes("Apartment")) {
    return "Apartment";
  } 
  
  if (moveSize.includes("House")) {
    return "NormalHome";
  }

  // Default to Normal Home if no match
  return "NormalHome";
}

/**
 * Get number of bedrooms from a move size
 */
export function getBedroomsFromMoveSize(moveSize: string): number {
  if (moveSize.startsWith("Studio")) return 0;
  
  const bedroomMatch = moveSize.match(/(\d+)\s+Bedroom/);
  if (bedroomMatch && bedroomMatch[1]) {
    return parseInt(bedroomMatch[1], 10);
  }
  
  // Default value if no match
  return 1;
}

/**
 * Estimate the number of rooms based on property type and bedrooms
 */
export function estimateNumberOfRooms(propertyType: string, bedrooms?: number): number {
  // Handle fixed types first (estimate rooms based on description)
  if (propertyType === "Room or Less") return 1;
  if (propertyType === "Studio Apartment") return 1; // Treat studio as one main room + kitchen/bath implicitly
  if (propertyType.includes("Office")) return 1; // Assume main office space
  if (propertyType.includes("Storage Unit")) return 1; // Treat as one space

  // Dynamic types
  const baseRooms = PROPERTY_ROOMS[propertyType];
  if (baseRooms && bedrooms !== undefined) {
    // Base rooms + number of bedrooms
    return baseRooms.length + bedrooms;
  }

  // Fallback for unknown types
  return 1;
}

/**
 * Calculate box estimate based on property type, bedrooms, and packing intensity
 */
export function calculateBoxEstimate(input: BoxEstimateInput): BoxCounts {
  const multiplier = INTENSITY_MULTIPLIERS[input.packingIntensity];
  const finalCounts: BoxCounts = { 
    small: 0, 
    medium: 0, 
    large: 0, 
    wardrobe: 0, 
    dishPack: 0, 
    mattressBag: 0, 
    tvBox: 0 
  };

  console.log(`Box estimate for property type: ${input.propertyType}`);

  // Handle fixed estimates first
  if (input.propertyType in FIXED_ESTIMATES) {
    const base = FIXED_ESTIMATES[input.propertyType];
    for (const [key, value] of Object.entries(base)) {
      finalCounts[key as keyof BoxCounts] = Math.ceil((value || 0) * multiplier);
    }
    return finalCounts;
  }

  // Handle dynamic property types (Apartment, Homes)
  const rooms = PROPERTY_ROOMS[input.propertyType];
  if (!rooms || input.bedrooms === undefined) {
    console.error("Invalid input for dynamic box estimation:", input);
    return finalCounts; // Return empty counts on error
  }

  // Add bedrooms to the room list
  const allRoomTypes = [...rooms];
  for (let i = 0; i < input.bedrooms; i++) {
    allRoomTypes.push("Bedroom");
  }

  console.log(`Rooms included in estimate: ${allRoomTypes.join(', ')}`);

  // Sum base counts for all included rooms
  let baseTotal: Partial<BoxCounts> = { 
    small: 0, 
    medium: 0, 
    large: 0, 
    wardrobe: 0, 
    dishPack: 0, 
    mattressBag: 0, 
    tvBox: 0 
  };
  
  allRoomTypes.forEach(roomType => {
    const roomBase = BASE_BOXES_PER_ROOM[roomType];
    if (roomBase) {
      for (const [key, value] of Object.entries(roomBase)) {
        const typedKey = key as keyof BoxCounts;
        baseTotal[typedKey] = (baseTotal[typedKey] || 0) + (value || 0);
      }
    }
  });

  // Apply intensity multiplier to summed base counts
  for (const [key, value] of Object.entries(baseTotal)) {
    finalCounts[key as keyof BoxCounts] = Math.ceil((value || 0) * multiplier);
  }

  console.log(`Final box counts:`, finalCounts);
  
  return finalCounts;
}

/**
 * Calculate the total material cost based on the estimated boxes
 */
export function calculateMaterialCost(boxCounts: BoxCounts): number {
  let totalCost = 0;
  totalCost += (boxCounts.small || 0) * BOX_PRICES.small;
  totalCost += (boxCounts.medium || 0) * BOX_PRICES.medium;
  totalCost += (boxCounts.large || 0) * BOX_PRICES.large;
  totalCost += (boxCounts.wardrobe || 0) * BOX_PRICES.wardrobe;
  totalCost += (boxCounts.dishPack || 0) * BOX_PRICES.dishPack;
  totalCost += (boxCounts.mattressBag || 0) * BOX_PRICES.mattressBag;
  totalCost += (boxCounts.tvBox || 0) * BOX_PRICES.tvBox;
  return totalCost;
}

/**
 * Calculate packing time based on box counts, rooms, and workers
 */
export function calculatePackingTime(
  boxCounts: BoxCounts, 
  numberOfRooms: number, 
  numberOfPackers: number, 
  isWhiteGlove: boolean = false
): number {
  return calculateTaskTimeByBoxes(
    boxCounts,
    TIME_PER_BOX_PACKING,
    EXTRA_TIME_PER_ROOM_PACKING,
    numberOfRooms,
    numberOfPackers,
    isWhiteGlove ? 1.20 : 1.0 // 20% longer for White Glove
  );
}

/**
 * Calculate unpacking time based on box counts, rooms, and workers
 */
export function calculateUnpackingTime(
  boxCounts: BoxCounts, 
  numberOfRooms: number, 
  numberOfUnpackers: number,
  isWhiteGlove: boolean = false
): number {
  return calculateTaskTimeByBoxes(
    boxCounts,
    TIME_PER_BOX_UNPACKING,
    EXTRA_TIME_PER_ROOM_UNPACKING,
    numberOfRooms,
    numberOfUnpackers,
    isWhiteGlove ? 1.20 : 1.0 // 20% longer for White Glove
  );
}

/**
 * Helper function to calculate task time by boxes
 */
function calculateTaskTimeByBoxes(
  boxCounts: BoxCounts,
  timePerBox: typeof TIME_PER_BOX_PACKING | typeof TIME_PER_BOX_UNPACKING,
  extraTimePerRoom: number,
  numberOfRooms: number,
  numberOfWorkers: number,
  intensityModifier: number = 1.0
): number { // Returns time in hours
  if (numberOfWorkers <= 0) return 0; // Prevent division by zero

  let subtotalMinutes = 0;
  subtotalMinutes += (boxCounts.small || 0) * timePerBox.small;
  subtotalMinutes += (boxCounts.medium || 0) * timePerBox.medium;
  subtotalMinutes += (boxCounts.large || 0) * timePerBox.large;
  subtotalMinutes += (boxCounts.wardrobe || 0) * timePerBox.wardrobe;
  subtotalMinutes += (boxCounts.dishPack || 0) * timePerBox.dishPack;
  subtotalMinutes += (boxCounts.mattressBag || 0) * (timePerBox.mattressBag || 0);
  subtotalMinutes += (boxCounts.tvBox || 0) * (timePerBox.tvBox || 0);

  // Apply the intensity modifier (for White Glove)
  subtotalMinutes *= intensityModifier;

  // Add flat extra time per room
  const extraMinutes = numberOfRooms * extraTimePerRoom;

  const totalMinutesPerWorker = (subtotalMinutes + extraMinutes) / numberOfWorkers;

  // Convert to hours
  const totalHours = totalMinutesPerWorker / 60;

  return totalHours;
}

/**
 * Create job materials entries from box counts
 */
export function createJobMaterials(
  jobId: number, 
  estimatedBoxes: BoxCounts
): any[] {
  const materials: any[] = [];
  
  // Map of box type to material_type for database
  const boxTypeToMaterialType: Record<keyof BoxCounts, string> = {
    small: 'small_box',
    medium: 'medium_box',
    large: 'large_box',
    wardrobe: 'wardrobe_box',
    dishPack: 'dish_pack_box',
    mattressBag: 'mattress_bag',
    tvBox: 'tv_box'
  };
  
  // Create a JobMaterial for each box type with quantity > 0
  Object.entries(estimatedBoxes).forEach(([boxType, count]) => {
    if (count > 0) {
      const materialType = boxTypeToMaterialType[boxType as keyof BoxCounts];
      const price = BOX_PRICES[boxType as keyof typeof BOX_PRICES];
      const totalCost = count * price;
      
      materials.push({
        job_id: jobId,
        material_type: materialType,
        quantity: createChargeValue(count, count, null, false, 'boxes'),
        unit_price: createChargeValue(price, price, null, false, '$'),
        total_cost: createChargeValue(totalCost, totalCost, null, false, '$')
      });
    }
  });
  
  return materials;
}
