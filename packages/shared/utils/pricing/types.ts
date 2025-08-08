/**
 * Comprehensive TypeScript Types for Moving Company Pricing Engine
 * Foundation types that all 4 applications (Marketing Website, CRM Web, CRM Mobile, Crew Mobile) will use
 */

export type MoveSize = 
  | "Room or Less"
  | "Studio Apartment"
  | "1 Bedroom Apartment"
  | "2 Bedroom Apartment"
  | "3 Bedroom Apartment"
  | "1 Bedroom House"
  | "1 Bedroom House (Large)"
  | "2 Bedroom House"
  | "2 Bedroom House (Large)"
  | "3 Bedroom House"
  | "3 Bedroom House (Large)"
  | "4 Bedroom House"
  | "4 Bedroom House (Large)"
  | "5 Bedroom House"
  | "5 Bedroom House (Large)"
  | "5 x 10 Storage Unit"
  | "5 x 15 Storage Unit"
  | "10 x 10 Storage Unit"
  | "10 x 15 Storage Unit"
  | "10 x 20 Storage Unit"
  | "Office (Small)"
  | "Office (Medium)"
  | "Office (Large)";

export type ServiceTier = 
  | "Grab-n-Go"
  | "Full Service"
  | "White Glove"
  | "Labor Only";

export type ServiceType = 
  | "Moving"
  | "Packing"
  | "Full Service"
  | "White Glove"
  | "Labor Only"
  | "Commercial";

export type MoveType = "LOCAL" | "REGIONAL" | "LONG_DISTANCE";

export interface CrewSizeRule {
  max: number;
  movers: number;
}

export interface BaseHourlyRates {
  [serviceType: string]: {
    [crewSize: number]: number;
  };
}

export interface AdditionalRates {
  FUEL_RATE_PER_MILE: number;
  MILEAGE_RATE_PER_MILE: number;
  ADDITIONAL_TRUCK_HOURLY: number;
  EMERGENCY_SERVICE_HOURLY: number;
}

export interface HandicapFactors {
  stairs: number;
  walkFeet: number;
  elevator: boolean;
}

export interface CrewAdjustmentRule {
  minCuft: number;
  maxCuft: number;
  firstExtraModifier: number;
  secondExtraModifier: number;
}

export interface PricingInputs {
  moveSize: MoveSize;
  serviceTier: ServiceTier;
  serviceType: ServiceType;
  distanceMiles: number;
  handicapFactors: HandicapFactors;
  customCubicFeet?: number;
  forceCrewSize?: number;
  additionalTrucks?: number;
  emergencyService?: boolean;
}

export interface PricingCalculationResult {
  // Core Metrics
  cubicFeet: number;
  crewSize: number;
  baseHourlyRate: number;
  handicapModifier: number;
  adjustedCrewSize: number;
  
  // Time Calculations
  baseTimeHours: number;
  adjustedTimeHours: number;
  
  // Cost Breakdown
  laborCost: number;
  fuelCost: number;
  mileageCost: number;
  additionalTruckCost: number;
  emergencyServiceCost: number;
  subtotal: number;
  
  // Day Split Information
  daysSplit: number;
  hoursPerDay: number[];
  
  // Move Classification
  moveType: MoveType;
  
  // Detailed Breakdown for Transparency
  breakdown: {
    serviceTierSpeed: number;
    crewSizeReasoning: string;
    handicapBreakdown: {
      stairsModifier: number;
      walkModifier: number;
      elevatorModifier: number;
      totalModifier: number;
    };
    crewAdjustments: {
      applied: boolean;
      originalCrewSize: number;
      adjustedCrewSize: number;
      adjustmentReason: string;
    };
    daysSplitReasoning: string;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface PricingResult {
  success: boolean;
  data?: PricingCalculationResult;
  errors?: ValidationError[];
  warnings?: string[];
}

// Service Speed Configuration
export interface ServiceSpeedConfig {
  [key in ServiceTier]: number; // cuft/hr/mover
}

// Move Size to Cubic Feet Mapping
export interface MoveSizeCubicFeetMapping {
  [key in MoveSize]: number;
}

// Configuration Interfaces for Easy Updates
export interface PricingConfig {
  moveSizeCubicFeet: MoveSizeCubicFeetMapping;
  serviceSpeed: ServiceSpeedConfig;
  crewSizeRules: CrewSizeRule[];
  baseHourlyRates: BaseHourlyRates;
  additionalRates: AdditionalRates;
  crewAdjustmentRules: CrewAdjustmentRule[];
  daysSplitThresholds: {
    localMaxHours: number;
    regionalMaxHours: number;
    localDistanceThreshold: number;
    regionalDistanceThreshold: number;
  };
}

// Utility Types for Type Safety
export type CrewSize = 2 | 3 | 4 | 5 | 6 | 7;
export type PositiveNumber = number; // Runtime validation required
export type CubicFeet = PositiveNumber;
export type DistanceMiles = PositiveNumber;
export type Hours = PositiveNumber;
export type Currency = PositiveNumber;

// Error Codes for Consistent Error Handling
export enum PricingErrorCode {
  INVALID_MOVE_SIZE = "INVALID_MOVE_SIZE",
  INVALID_SERVICE_TIER = "INVALID_SERVICE_TIER",
  INVALID_SERVICE_TYPE = "INVALID_SERVICE_TYPE",
  INVALID_DISTANCE = "INVALID_DISTANCE",
  INVALID_CUBIC_FEET = "INVALID_CUBIC_FEET",
  INVALID_CREW_SIZE = "INVALID_CREW_SIZE",
  INVALID_HANDICAP_FACTORS = "INVALID_HANDICAP_FACTORS",
  CONFIGURATION_ERROR = "CONFIGURATION_ERROR",
  CALCULATION_ERROR = "CALCULATION_ERROR"
}

// Warning Codes for Business Logic Notifications
export enum PricingWarningCode {
  CREW_SIZE_ADJUSTED = "CREW_SIZE_ADJUSTED",
  DAYS_SPLIT_APPLIED = "DAYS_SPLIT_APPLIED",
  HANDICAP_THRESHOLD_NOT_MET = "HANDICAP_THRESHOLD_NOT_MET",
  CUSTOM_CUBIC_FEET_OVERRIDE = "CUSTOM_CUBIC_FEET_OVERRIDE",
  EMERGENCY_SERVICE_SURCHARGE = "EMERGENCY_SERVICE_SURCHARGE"
}