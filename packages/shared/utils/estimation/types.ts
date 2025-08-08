/**
 * Comprehensive TypeScript Types for Box Estimation System
 * Integrates with the existing pricing engine for complete moving company operations
 */

// Base types for packing intensity and property types
export type PackingIntensity = 
  | "Less than Normal"  // 0.75x multiplier
  | "Normal"           // 1.0x multiplier  
  | "More than Normal"; // 1.5x multiplier

export type PropertyType = "Apartment" | "Normal Home" | "Large Home";

export type FixedEstimateType = 
  | "Studio Apartment"
  | "Office (Small)"
  | "Office (Medium)" 
  | "Office (Large)"
  | "5 x 10 Storage Unit"
  | "5 x 15 Storage Unit"
  | "10 x 10 Storage Unit"
  | "10 x 15 Storage Unit"
  | "10 x 20 Storage Unit";

// Room types for dynamic calculation
export type RoomType = 
  | "Bedroom"
  | "Living Room" 
  | "Kitchen"
  | "Dining Room"
  | "Garage"
  | "Office"
  | "Patio/Shed"
  | "Attic/Basement";

// Box types with exact specifications
export type BoxType = 
  | "Small"
  | "Medium" 
  | "Large"
  | "Wardrobe"
  | "Dish Pack"
  | "Mattress Bag"
  | "TV Box";

// Packing material types with purchase/rental options
export type MaterialType = BoxType | "Skin Blanket" | "Paper Pad";

export interface BoxAllocation {
  Small: number;
  Medium: number;
  Large: number;
  Wardrobe: number;
  "Dish Pack": number;
  "Mattress Bag": number;
  "TV Box": number;
}

export interface RoomBoxAllocation {
  [key in RoomType]: BoxAllocation;
}

export interface PropertyConfiguration {
  baseRooms: RoomType[];
  minBedrooms: number;
  maxBedrooms: number;
  description: string;
}

export interface PropertyTypeConfiguration {
  [key in PropertyType]: PropertyConfiguration;
}

// Time calculation interfaces
export interface PackingTimes {
  [key in BoxType]: number; // minutes per box per worker
}

export interface UnpackingTimes {
  [key in BoxType]: number; // minutes per box per worker
}

export interface RoomTimePenalty {
  packing: number;   // extra minutes per room
  unpacking: number; // extra minutes per room
}

// Material pricing interfaces
export interface MaterialPricing {
  [key: string]: number; // price in USD
}

export interface TVBoxPricing {
  purchase: MaterialPricing;
  rental: MaterialPricing; // 50% of purchase price
}

// Input interfaces for estimation
export interface EstimationInputs {
  propertyType?: PropertyType;
  fixedEstimateType?: FixedEstimateType;
  bedrooms?: number; // 0-5 for dynamic calculation
  packingIntensity: PackingIntensity;
  whiteGloveService?: boolean; // +20% time modifier
  customRooms?: Partial<Record<RoomType, number>>; // override room counts
}

// Result interfaces
export interface BoxEstimationResult {
  totalBoxes: BoxAllocation;
  roomBreakdown: Partial<Record<RoomType, BoxAllocation>>;
  packingIntensityApplied: number; // multiplier used
  roomCount: Partial<Record<RoomType, number>>;
  estimationType: "Dynamic" | "Fixed";
}

export interface TimeEstimationResult {
  packingTime: {
    totalMinutes: number;
    totalHours: number;
    breakdown: Record<BoxType, number>; // minutes per box type
    roomPenalty: number; // extra minutes for room setup
    whiteGloveModifier: number; // additional time percentage
  };
  unpackingTime: {
    totalMinutes: number;
    totalHours: number;
    breakdown: Record<BoxType, number>; // minutes per box type
    roomPenalty: number; // extra minutes for room setup
    whiteGloveModifier: number; // additional time percentage
  };
  workersRequired: number; // recommended number of workers
}

export interface MaterialCostResult {
  totalCost: number;
  breakdown: Record<string, { quantity: number; unitCost: number; totalCost: number }>;
  rentalOptions?: Record<string, { quantity: number; unitCost: number; totalCost: number }>;
}

export interface ComprehensiveEstimationResult {
  boxes: BoxEstimationResult;
  time: TimeEstimationResult;
  materials: MaterialCostResult;
  inputs: EstimationInputs;
  generatedAt: Date;
}

// Validation interfaces
export interface EstimationValidationError {
  field: string;
  message: string;
  code: string;
}

export interface EstimationResult {
  success: boolean;
  data?: ComprehensiveEstimationResult;
  errors?: EstimationValidationError[];
  warnings?: string[];
}

// Configuration interfaces
export interface PackingIntensityMultipliers {
  [key in PackingIntensity]: number;
}

export interface EstimationConfig {
  packingIntensityMultipliers: PackingIntensityMultipliers;
  propertyTypes: PropertyTypeConfiguration;
  roomBoxAllocations: RoomBoxAllocation;
  fixedEstimates: Record<FixedEstimateType, BoxAllocation>;
  packingTimes: PackingTimes;
  unpackingTimes: UnpackingTimes;
  roomTimePenalty: RoomTimePenalty;
  materialPricing: MaterialPricing;
  tvBoxPricing: TVBoxPricing;
  whiteGloveTimeModifier: number; // 0.20 for 20% increase
}

// Utility types for type safety
export type BedroomCount = 0 | 1 | 2 | 3 | 4 | 5;
export type PositiveInteger = number; // Runtime validation required
export type Minutes = PositiveInteger;
export type Hours = number;
export type Currency = number;

// Error codes for consistent error handling
export enum EstimationErrorCode {
  INVALID_PROPERTY_TYPE = "INVALID_PROPERTY_TYPE",
  INVALID_FIXED_ESTIMATE_TYPE = "INVALID_FIXED_ESTIMATE_TYPE",
  INVALID_BEDROOM_COUNT = "INVALID_BEDROOM_COUNT",
  INVALID_PACKING_INTENSITY = "INVALID_PACKING_INTENSITY",
  INVALID_CUSTOM_ROOMS = "INVALID_CUSTOM_ROOMS",
  MISSING_REQUIRED_INPUTS = "MISSING_REQUIRED_INPUTS",
  CALCULATION_ERROR = "CALCULATION_ERROR",
  CONFIGURATION_ERROR = "CONFIGURATION_ERROR"
}

// Warning codes for business logic notifications
export enum EstimationWarningCode {
  BEDROOM_COUNT_ADJUSTED = "BEDROOM_COUNT_ADJUSTED",
  CUSTOM_ROOMS_OVERRIDE = "CUSTOM_ROOMS_OVERRIDE",
  WHITE_GLOVE_TIME_APPLIED = "WHITE_GLOVE_TIME_APPLIED",
  PACKING_INTENSITY_EXTREME = "PACKING_INTENSITY_EXTREME",
  FIXED_ESTIMATE_USED = "FIXED_ESTIMATE_USED"
}

// Integration types with pricing engine
export interface PricingIntegrationData {
  materialCosts: number;
  packingTime: Hours;
  unpackingTime: Hours;
  totalBoxes: number;
  crewSizeRecommendation: number;
  serviceComplexityModifier: number; // based on box count and intensity
}

export interface EstimationToPricingAdapter {
  convertToPricingInputs(estimation: ComprehensiveEstimationResult): Partial<any>; // Pricing engine inputs
  calculateServiceModifiers(estimation: ComprehensiveEstimationResult): number;
  getRecommendedCrewSize(estimation: ComprehensiveEstimationResult): number;
}