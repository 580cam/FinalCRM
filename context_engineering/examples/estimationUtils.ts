import { 
  BoxCounts, 
  INTENSITY_MULTIPLIERS,
  PackingIntensity, 
  calculateBoxEstimate, 
  calculateMaterialCost,
  calculatePackingTime,
  calculateUnpackingTime,
  estimateNumberOfRooms,
  getBedroomsFromMoveSize,
  mapMoveSizeToPropertyType
} from "./boxEstimator";
import { ChargeValue, JobChargeData, JobChargeItem, createChargeValue } from "./chargeUtils";
import { calculateMoveDistance } from "./googleMapsUtils";

// Types of services offered
export type ServiceType = 
  | "Moving" 
  | "Packing" 
  | "Unpacking" 
  | "Moving and Packing"
  | "Full Service" 
  | "White Glove" 
  | "Load Only" 
  | "Unload Only" 
  | "Labor Only" 
  | "Staging" 
  | "Commercial";

// Cubic feet per hour per mover rates (standard)
export const CUFT_PER_HOUR_PER_MOVER: { [service in ServiceType]?: number } = {
  "Moving": 80,
  "Packing": 0, // Not applicable - calculated by box count
  "Unpacking": 0, // Not applicable - calculated by box count
  "Moving and Packing": 80, // Moving portion, packing calculated separately
  "Full Service": 80, // Moving portion, packing/unpacking calculated separately
  "White Glove": 70, // Reduced rate for white glove service
  "Load Only": 85, // Same as labor only but only 60% of time
  "Unload Only": 85, // Same as labor only but only 40% of time
  "Labor Only": 85,
  "Staging": 85, // Same as load only
  "Commercial": 80 // Same as full service
};

// Base hourly rates by service type and crew size from the tariff
export const BASE_HOURLY_RATES: { [service in ServiceType]?: { [crewSize: number]: number } } = {
  "Moving": { 2: 169, 3: 229, 4: 289, 5: 349, 6: 409, 7: 469 },
  "Packing": { 2: 169, 3: 229, 4: 289, 5: 349, 6: 409, 7: 469 },
  "Unpacking": { 2: 169, 3: 229, 4: 289, 5: 349, 6: 409, 7: 469 },
  "Moving and Packing": { 2: 169, 3: 229, 4: 289, 5: 349, 6: 409, 7: 469 },
  "Full Service": { 2: 169, 3: 229, 4: 289, 5: 349, 6: 409, 7: 469 },
  "White Glove": { 2: 199, 3: 274, 4: 349, 5: 424, 6: 499, 7: 574 },
  "Load Only": { 2: 129, 3: 189, 4: 249, 5: 309, 6: 369, 7: 429 },
  "Unload Only": { 2: 129, 3: 189, 4: 249, 5: 309, 6: 369, 7: 429 },
  "Labor Only": { 2: 129, 3: 189, 4: 249, 5: 309, 6: 369, 7: 429 },
  "Staging": { 2: 129, 3: 189, 4: 249, 5: 309, 6: 369, 7: 429 },
  "Commercial": { 2: 169, 3: 229, 4: 289, 5: 349, 6: 409, 7: 469 }
};

// Additional mover costs (per hour)
export const ADDITIONAL_MOVER_RATES: { [service in ServiceType]?: number } = {
  "Moving": 60,
  "Packing": 60,
  "Unpacking": 60,
  "Moving and Packing": 60,
  "Full Service": 60,
  "White Glove": 75,
  "Load Only": 60,
  "Unload Only": 60,
  "Labor Only": 60,
  "Staging": 60,
  "Commercial": 60
};

// Cubic feet ranges for determining movers required
export const CREW_SIZE_BY_CUBIC_FEET = [
  { max: 1009, movers: 2 },
  { max: 1500, movers: 3 },
  { max: 2000, movers: 4 },
  { max: 3200, movers: 5 },
  { max: Infinity, movers: 6 }
];

// Standard cubic feet by move size
export const MOVE_SIZE_CUFT: { [moveSize: string]: number } = {
  "Room or Less": 75,
  "Studio Apartment": 288,
  "1 Bedroom Apartment": 432,
  "2 Bedroom Apartment": 743,
  "3 Bedroom Apartment": 1296,
  "1 Bedroom House": 576,
  "1 Bedroom House (Large)": 720,
  "2 Bedroom House": 1008,
  "2 Bedroom House (Large)": 1152,
  "3 Bedroom House": 1440,
  "3 Bedroom House (Large)": 1584,
  "4 Bedroom House": 1872,
  "4 Bedroom House (Large)": 2016,
  "5 Bedroom House": 3168,
  "5 Bedroom House (Large)": 3816,
  "5 x 10 Storage Unit": 400,
  "5 x 15 Storage Unit": 600,
  "10 x 10 Storage Unit": 800,
  "10 x 15 Storage Unit": 1200,
  "10 x 20 Storage Unit": 1600,
  "Office (Small)": 1000,
  "Office (Medium)": 2000,
  "Office (Large)": 3000
};

// Constants for travel calculation from the tariff
export const TRAVEL_CONSTANTS = {
  MIN_TRAVEL_HOURS: 0.25, // 15 minutes minimum travel
  TRAVEL_SPEED_MPH: 30, // Average travel speed in miles per hour
  LONG_DISTANCE_THRESHOLD: 30, // Miles
  LONG_DISTANCE_PERCENT: 0.50, // Only charge 50% of hourly rate for long distance travel
  FUEL_RATE_PER_MILE: 2.00, // Fuel surcharge per mile for long distance
  MILEAGE_RATE_PER_MILE: 4.29, // Mileage fee per mile for long distance
  ADDITIONAL_TRUCK_HOURLY: 30 // Additional truck hourly rate
};

// Types for addresses, handicaps, inventory
export interface Address {
  fullAddress: string;
  zip?: string;
  stairs?: number;
  elevator?: boolean;
  walkDistance?: number; // in feet
}

export interface InventoryItem {
  id: string;
  name: string;
  cubicFeet: number;
  quantity: number;
}

export interface SpecialItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// Input parameters for estimation
export interface EstimationParams {
  // Service details
  serviceType: ServiceType;
  moveSize: string;
  packingIntensity?: PackingIntensity;
  bedrooms?: number;
  
  // Locations
  addresses: Address[];
  
  // Inventory details (optional)
  inventory?: InventoryItem[];
  calculationMode?: 'moveSize' | 'inventory';
  
  // Special items (optional)
  specialItems?: SpecialItem[];
}

// Result of the estimation calculation
export interface EstimateResult {
  // Time calculations
  calculatedMovingTimeHours: number;
  calculatedPackingTimeHours: number;
  calculatedUnpackingTimeHours: number;
  effectiveBaseTimeHours: number;
  travelTimeHours: number;
  totalBilledTimeHours: number;

  // Resources
  requiredMovers: number;
  requiredTrucks: number;
  baseHourlyRate: number;

  // Box estimates
  estimatedBoxes: BoxCounts;
  materialsCost: number;

  // Cost breakdown
  baseMovingCost: number;
  additionalTruckCost: number;
  travelCost: number;
  fuelCost: number;
  mileageCost: number;
  specialItemsCost: number;
  originHandicapCost: number;  // Keeping this in interface but will be 0
  destinationHandicapCost: number;  // Keeping this in interface but will be 0
  additionalMoverCost: number;  // Keeping this in interface but will be 0
  subtotal: number;
  total: number;
  
  // Distance info
  moveDistance: number;

  // Data for database
  jobCharges: JobChargeData;
}

/**
 * Round time to the nearest 15-minute increment (.25 hours)
 */
export function roundTimeToQuarterHour(timeInHours: number): number {
  // Multiple by 4 to get quarter hours, round, then divide by 4
  return Math.ceil(timeInHours * 4) / 4;
}

/**
 * Get cubic feet for a move size
 */
export function getMoveSizeCubicFeet(moveSize: string): number {
  return MOVE_SIZE_CUFT[moveSize] || 500; // Default to 500 if not found
}

/**
 * Calculate cubic feet based on inventory items
 */
export function calculateInventoryCubicFeet(inventory: InventoryItem[]): number {
  return inventory.reduce((total, item) => {
    return total + (item.cubicFeet * item.quantity);
  }, 0);
}

/**
 * Determine the number of movers required based on cubic feet
 */
export function determineMovers(cubicFeet: number): number {
  for (const range of CREW_SIZE_BY_CUBIC_FEET) {
    if (cubicFeet <= range.max) {
      return range.movers;
    }
  }
  return 6; // Maximum crew size as fallback
}

/**
 * Determine the hourly rate based on service type and number of movers
 */
export function determineHourlyRate(serviceType: ServiceType, movers: number): number {
  const ratesByCrewSize = BASE_HOURLY_RATES[serviceType];
  if (!ratesByCrewSize) {
    console.error(`No hourly rates defined for service type: ${serviceType}`);
    return 169; // Default rate
  }

  // Get all available crew sizes as numbers, sorted
  const crewSizes = Object.keys(ratesByCrewSize).map(Number).sort((a, b) => a - b);
  
  // If we have an exact match, use it
  if (ratesByCrewSize[movers]) {
    return ratesByCrewSize[movers];
  }
  
  // If larger than our maximum defined crew size, use the largest defined rate
  // plus additional movers at the increment rate
  const maxCrewSize = crewSizes[crewSizes.length - 1];
  if (movers > maxCrewSize) {
    // Calculate the standard increment between crew sizes (e.g., usually $60 per additional mover)
    const standardIncrement = ADDITIONAL_MOVER_RATES[serviceType] || 60;
    
    // Get the rate for the largest defined crew size
    const baseRate = ratesByCrewSize[maxCrewSize];
    
    // Add the standard increment for each additional mover
    const additionalMovers = movers - maxCrewSize;
    return baseRate + (additionalMovers * standardIncrement);
  }
  
  // Otherwise find the nearest crew size (rounding up)
  for (const crewSize of crewSizes) {
    if (movers <= crewSize) {
      return ratesByCrewSize[crewSize];
    }
  }

  // Fallback - should not reach here if rates are defined properly
  return 169;
}

/**
 * Calculate base time based on cubic feet and service type
 */
export function calculateBaseTime(cubicFeet: number, serviceType: ServiceType, movers: number): number {
  const cuftPerHourPerMover = CUFT_PER_HOUR_PER_MOVER[serviceType] || 85;
  
  // If the rate is 0, this service doesn't use cuft rates (e.g., packing only)
  if (cuftPerHourPerMover === 0) return 0;
  
  let totalCuftPerHour = cuftPerHourPerMover * movers;
  let calculatedHours = cubicFeet / totalCuftPerHour;
  
  // Apply load/unload only time adjustments
  if (serviceType === "Load Only") {
    calculatedHours *= 0.6; // 60% of labor only time
  } else if (serviceType === "Unload Only") {
    calculatedHours *= 0.4; // 40% of labor only time
  }
  
  // Round to nearest 15 minute increment
  return roundTimeToQuarterHour(calculatedHours);
}

/**
 * Calculate handicap percentage for an address
 */
export function calculateHandicapPercentage(address: Address): number {
  let handicapPercent = 0;
  
  // Add 9% per flight of stairs
  if (address.stairs && address.stairs > 0) {
    handicapPercent += address.stairs * 0.09;
  }
  
  // Add 18% for elevator
  if (address.elevator) {
    handicapPercent += 0.18;
  }
  
  // Add 9% per 100ft of walking distance
  if (address.walkDistance && address.walkDistance > 0) {
    handicapPercent += Math.floor(address.walkDistance / 100) * 0.09;
  }
  
  return handicapPercent;
}

/**
 * Calculate distance between addresses
 * Uses Google Maps API for accurate distance calculation when available
 * Falls back to simplified calculation when API is not available
 */
export async function calculateDistance(addresses: Address[]): Promise<{
  distance: number;
  durationMinutes: number;
}> {
  // If there are less than 2 addresses, return 0 miles
  if (!addresses || addresses.length < 2) {
    return { distance: 0, durationMinutes: 0 };
  }

  // Ensure addresses have full address information
  const validAddresses = addresses.filter(addr => addr && addr.fullAddress);
  if (validAddresses.length < 2) {
    return { distance: 0, durationMinutes: 0 };
  }

  try {
    // Use Google Maps for distance calculation
    const mapResult = await calculateMoveDistance(validAddresses);
    return { 
      distance: mapResult.distanceInMiles,
      durationMinutes: mapResult.durationInMinutes
    };
  } catch (error) {
    console.error('Error using Google Maps API, falling back to simplified calculation:', error);
    
    // Fallback to simplified calculation
    const distance = calculateSimplifiedDistance(validAddresses);
    // Simple estimate: assume 30mph average speed
    const durationMinutes = (distance / 30) * 60;
    
    return { distance, durationMinutes };
  }
}

/**
 * Calculate simplified distance between addresses based on ZIP codes
 * This is a fallback when Google Maps API is unavailable
 */
export function calculateSimplifiedDistance(addresses: Address[]): number {
  // If there are less than 2 addresses, return 0 miles
  if (addresses.length < 2) return 0;
  
  // Simple mock calculation based on zip codes
  const origin = addresses[0];
  const destination = addresses[1];
  
  // If no zip codes are available, return a default distance
  if (!origin.zip || !destination.zip) return 10;
  
  // Calculate distance based on ZIP code difference
  const originZip = parseInt(origin.zip, 10);
  const destZip = parseInt(destination.zip, 10);
  
  if (isNaN(originZip) || isNaN(destZip)) return 10;
  
  // Just a simple calculation for example purposes
  return Math.abs(originZip - destZip) / 100 + 5; // Add 5 miles as base distance
}

/**
 * Calculate travel charges based on distance
 */
export function calculateTravelCharges(
  distanceInfo: { distance: number; durationMinutes: number; }, 
  hourlyRate: number, 
  movers: number,
  trucks: number
): { 
  travelTime: number; 
  travelCost: number; 
  fuelCost: number; 
  mileageCost: number;
} {
  const { distance, durationMinutes } = distanceInfo;
  
  // If no distance, return zeros for all values
  if (!distance || distance <= 0) {
    return {
      travelTime: 0,
      travelCost: 0,
      fuelCost: 0,
      mileageCost: 0
    };
  }

  // Always calculate travel time in hours (unrounded - keep exact value)
  const travelTime = durationMinutes / 60;
  
  // Different charging logic based on distance
  let travelCost = 0;
  let fuelCost = 0;
  let mileageCost = 0;

  if (distance <= TRAVEL_CONSTANTS.LONG_DISTANCE_THRESHOLD) {
    // Local move (<=30 miles): Charge full hourly rate for travel time
    travelCost = travelTime * hourlyRate;
    // No mileage or fuel costs for local moves
  } else {
    // Long distance (>30 miles): Do NOT charge for travel time
    // Only charge mileage fee and fuel surcharge based on exact rates
    travelCost = 0; // No travel time cost for long distance
    mileageCost = distance * TRAVEL_CONSTANTS.MILEAGE_RATE_PER_MILE * trucks; // Multiply by truck count
    fuelCost = distance * TRAVEL_CONSTANTS.FUEL_RATE_PER_MILE * trucks; // Multiply by truck count
  }

  return { travelTime, travelCost, fuelCost, mileageCost };
}

/**
 * Generate job charge data object for database storage
 */
export function createJobChargeDataObject(
  jobId: number | undefined,
  hourlyRate: number,
  billedHours: number,
  packingHours: number,
  unpackingHours: number,
  movers: number,
  trucks: number,
  originHandicapPercent: number,
  destinationHandicapPercent: number,
  travel: { travelTime: number; travelCost: number; fuelCost: number; mileageCost: number },
  materialsCost: number,
  specialItemsCost: number,
  minimumHoursThreshold: number,
  combinedBaseTime: number,
  serviceType: ServiceType
): JobChargeData {
  const data: JobChargeData = {};
  const charges: JobChargeItem[] = [];
  
  if (jobId !== undefined) {
    data.job_id = jobId;
  }
  
  // Add charges array to hold the individual charge items
  data.charges = charges;
  
  // Split moving time into load (60%) and unload (40%)
  // Only if service type requires moving
  if (serviceType !== 'Packing' && serviceType !== 'Unpacking') {
    const movingHours = serviceType === 'Load Only' ? billedHours :
                        serviceType === 'Unload Only' ? billedHours :
                        billedHours - packingHours - unpackingHours;
    
    // Calculate hours for load and unload based on 60/40 split
    const loadHoursRaw = movingHours * 0.6;
    const unloadHoursRaw = movingHours * 0.4;
    
    // Round to nearest 15-minute increment
    const loadHours = roundTimeToQuarterHour(loadHoursRaw);
    const unloadHours = roundTimeToQuarterHour(unloadHoursRaw);
    
    // Create load charge if applicable
    if (serviceType !== 'Unload Only' && loadHours > 0) {
      charges.push({
        job_id: jobId,
        type: 'load',
        hourly_rate: createChargeValue(hourlyRate, hourlyRate, null, false, '$/hr'),
        hours: createChargeValue(loadHours, loadHours, null, false, 'hours'),
        number_of_crew: createChargeValue(movers, movers, null, false, 'workers'),
        amount: createChargeValue(loadHours * hourlyRate, loadHours * hourlyRate, null, false, '$'),
        is_billable: createChargeValue(true, true, null, false, '')
      });
    }
    
    // Create unload charge if applicable
    if (serviceType !== 'Load Only' && unloadHours > 0) {
      charges.push({
        job_id: jobId,
        type: 'unload',
        hourly_rate: createChargeValue(hourlyRate, hourlyRate, null, false, '$/hr'),
        hours: createChargeValue(unloadHours, unloadHours, null, false, 'hours'),
        number_of_crew: createChargeValue(movers, movers, null, false, 'workers'),
        amount: createChargeValue(unloadHours * hourlyRate, unloadHours * hourlyRate, null, false, '$'),
        is_billable: createChargeValue(true, true, null, false, '')
      });
    }
  }
  
  // Add packing charge if applicable
  if (packingHours > 0) {
    charges.push({
      job_id: jobId,
      type: 'packing',
      hourly_rate: createChargeValue(hourlyRate, hourlyRate, null, false, '$/hr'),
      hours: createChargeValue(packingHours, packingHours, null, false, 'hours'),
      number_of_crew: createChargeValue(movers, movers, null, false, 'workers'),
      amount: createChargeValue(packingHours * hourlyRate, packingHours * hourlyRate, null, false, '$'),
      is_billable: createChargeValue(true, true, null, false, '')
    });
  }
  
  // Add travel charge if applicable
  if (travel.travelTime > 0) {
    charges.push({
      job_id: jobId,
      type: 'travel',
      hourly_rate: createChargeValue(travel.travelCost > 0 ? hourlyRate : 0, travel.travelCost > 0 ? hourlyRate : 0, null, false, '$/hr'),
      hours: createChargeValue(travel.travelTime, travel.travelTime, null, false, 'hours'),
      driving_time_mins: createChargeValue(travel.travelTime * 60, travel.travelTime * 60, null, false, 'minutes'),
      amount: createChargeValue(travel.travelCost, travel.travelCost, null, false, '$'),
      is_billable: createChargeValue(travel.travelCost > 0, travel.travelCost > 0, null, false, '')
    });
  }
  
  // Add unpacking charge if applicable
  if (unpackingHours > 0) {
    charges.push({
      job_id: jobId,
      type: 'unpacking',
      hourly_rate: createChargeValue(hourlyRate, hourlyRate, null, false, '$/hr'),
      hours: createChargeValue(unpackingHours, unpackingHours, null, false, 'hours'),
      number_of_crew: createChargeValue(movers, movers, null, false, 'workers'),
      amount: createChargeValue(unpackingHours * hourlyRate, unpackingHours * hourlyRate, null, false, '$'),
      is_billable: createChargeValue(true, true, null, false, '')
    });
  }
  
  // Add additional truck cost if applicable (as a separate charge)
  const additionalTrucks = Math.max(0, trucks - 1);
  const additionalTruckCost = additionalTrucks * TRAVEL_CONSTANTS.ADDITIONAL_TRUCK_HOURLY * billedHours;
  
  if (additionalTruckCost > 0) {
    charges.push({
      job_id: jobId,
      type: 'additional_trucks',
      amount: createChargeValue(additionalTruckCost, additionalTruckCost, null, false, '$'),
      is_billable: createChargeValue(true, true, null, false, '')
    });
  }
  
  // Add fuel charge if applicable
  if (travel.fuelCost > 0) {
    charges.push({
      job_id: jobId,
      type: 'fuel',
      amount: createChargeValue(travel.fuelCost, travel.fuelCost, null, false, '$'),
      is_billable: createChargeValue(true, true, null, false, '')
    });
  }
  
  // Add mileage charge if applicable
  if (travel.mileageCost > 0) {
    charges.push({
      job_id: jobId,
      type: 'mileage',
      amount: createChargeValue(travel.mileageCost, travel.mileageCost, null, false, '$'),
      is_billable: createChargeValue(true, true, null, false, '')
    });
  }
  
  // Add materials charge if applicable
  if (materialsCost > 0) {
    charges.push({
      job_id: jobId,
      type: 'materials',
      amount: createChargeValue(materialsCost, materialsCost, null, false, '$'),
      is_billable: createChargeValue(true, true, null, false, '')
    });
  }
  
  // Add special items charge if applicable
  if (specialItemsCost > 0) {
    charges.push({
      job_id: jobId,
      type: 'special_items',
      amount: createChargeValue(specialItemsCost, specialItemsCost, null, false, '$'),
      is_billable: createChargeValue(true, true, null, false, '')
    });
  }
  
  // Only include minimum_time if the minimum was actually applied
  if (billedHours === minimumHoursThreshold && combinedBaseTime < minimumHoursThreshold) {
    data.minimum_time = createChargeValue(minimumHoursThreshold, minimumHoursThreshold, null, false, 'hours');
  }
  
  // Set number of crew and trucks on the top-level job charge data
  data.number_of_crew = createChargeValue(movers, movers, null, false, 'workers');
  data.number_of_trucks = createChargeValue(trucks, trucks, null, false, 'trucks');
  
  return data;
}

/**
 * Master function to calculate the complete estimate
 */
export async function calculateEstimate(params: EstimationParams): Promise<EstimateResult> {
  // 0. Set defaults and validate
  const packingIntensity = params.packingIntensity || "Normal";
  const bedrooms = params.bedrooms || getBedroomsFromMoveSize(params.moveSize);
  
  // 1. Calculate Box Estimate for materials and packing/unpacking time
  const propertyType = mapMoveSizeToPropertyType(params.moveSize);
  const boxEstimateInput = {
    propertyType,
    bedrooms,
    packingIntensity
  };
  
  const estimatedBoxes = calculateBoxEstimate(boxEstimateInput);
  
  // Only calculate materials cost if service involves packing
  const includesPacking = ['Packing', 'Full Service', 'White Glove', 'Moving and Packing'].includes(params.serviceType);
  const materialsCost = includesPacking ? calculateMaterialCost(estimatedBoxes) : 0;

  // 2. Calculate Core Moving Metrics (Cubic Feet, Movers, Trucks, Rate)
  const cubicFeet = params.calculationMode === 'inventory' && params.inventory
    ? calculateInventoryCubicFeet(params.inventory)
    : getMoveSizeCubicFeet(params.moveSize);
    
  const requiredMovers = determineMovers(cubicFeet);
  
  // Add an extra mover for Full Service, White Glove, and Moving and Packing service types (REMOVED TO TEST)
  const extraMoverServiceTypes = ['Full Service', 'White Glove', 'Moving and Packing'];
  const finalRequiredMovers = extraMoverServiceTypes.includes(params.serviceType) 
    ? requiredMovers  
    : requiredMovers;
    
  const requiredTrucks = Math.ceil(cubicFeet / 1600);
  const baseHourlyRate = determineHourlyRate(params.serviceType, finalRequiredMovers);

  // 3. Calculate Moving Time (based on cuft/hr)
  let calculatedMovingTimeHours = 0;
  let calculatedPackingTimeHours = 0;
  let calculatedUnpackingTimeHours = 0;
  
  // Calculate base moving time if needed
  if (params.serviceType !== 'Packing' && params.serviceType !== 'Unpacking') {
    calculatedMovingTimeHours = calculateBaseTime(
      cubicFeet, 
      params.serviceType, 
      finalRequiredMovers
    );
    
    // Get handicap percentages for origin and destination
    const originHandicapPercent = params.addresses[0] ? 
      calculateHandicapPercentage(params.addresses[0]) : 0;
    
    const destinationHandicapPercent = params.addresses.length > 1 ? 
      calculateHandicapPercentage(params.addresses[1]) : 0;

    // Apply handicap percentages to increase the moving time
    // Only increase the time based on the handicaps that apply to this move
    const totalHandicapPercent = originHandicapPercent + destinationHandicapPercent;
    
    // Apply the handicap increase to the moving time
    if (totalHandicapPercent > 0) {
      calculatedMovingTimeHours *= (1 + totalHandicapPercent);
      
      // Round to nearest quarter hour
      calculatedMovingTimeHours = roundTimeToQuarterHour(calculatedMovingTimeHours);
    }
  }

  // 4. Calculate Packing/Unpacking Time (based on boxes)
  const numberOfRooms = estimateNumberOfRooms(propertyType, bedrooms);
  const isWhiteGlove = params.serviceType === "White Glove";

  if (['Packing', 'Full Service', 'White Glove', 'Moving and Packing'].includes(params.serviceType)) {
    calculatedPackingTimeHours = roundTimeToQuarterHour(calculatePackingTime(
      estimatedBoxes, 
      numberOfRooms, 
      finalRequiredMovers,
      isWhiteGlove
    ));
  }
  
  if (['Unpacking', 'Full Service', 'White Glove'].includes(params.serviceType)) {
    calculatedUnpackingTimeHours = roundTimeToQuarterHour(calculateUnpackingTime(
      estimatedBoxes, 
      numberOfRooms, 
      finalRequiredMovers,
      isWhiteGlove
    ));
  }

  // 5. Determine Effective Base Time for Billing
  let combinedBaseTime = 0;
  
  if (params.serviceType === 'Packing') {
    combinedBaseTime = calculatedPackingTimeHours;
  } else if (params.serviceType === 'Unpacking') {
    combinedBaseTime = calculatedUnpackingTimeHours;
  } else if (['Load Only', 'Unload Only', 'Labor Only', 'Staging'].includes(params.serviceType)) {
    combinedBaseTime = calculatedMovingTimeHours;
  } else if (params.serviceType === 'Moving') {
    combinedBaseTime = calculatedMovingTimeHours;
  } else if (params.serviceType === 'Moving and Packing') {
    combinedBaseTime = calculatedMovingTimeHours + calculatedPackingTimeHours;
  } else if (['Full Service', 'White Glove', 'Commercial'].includes(params.serviceType)) {
    // Sum all applicable times
    combinedBaseTime = calculatedMovingTimeHours + calculatedPackingTimeHours + calculatedUnpackingTimeHours;
  } else {
    combinedBaseTime = calculatedMovingTimeHours; // Default fallback
  }

  // Apply 2-hour minimum
  const minimumHours = 2;
  const effectiveBaseTimeHours = Math.max(combinedBaseTime, minimumHours);

  // 6. Calculate Travel & Handicaps
  const distanceInfo = await calculateDistance(params.addresses);
  const travel = calculateTravelCharges(
    distanceInfo, 
    baseHourlyRate, 
    finalRequiredMovers,
    requiredTrucks
  );
  
  const originHandicapPercent = params.addresses[0] ? 
    calculateHandicapPercentage(params.addresses[0]) : 0;
  
  const destinationHandicapPercent = params.addresses.length > 1 ? 
    calculateHandicapPercentage(params.addresses[1]) : 0;

  // 7. Calculate Costs based on Effective Time
  const baseMovingCost = effectiveBaseTimeHours * baseHourlyRate;
  
  // No separate handicap costs - handicaps only affect time
  const originHandicapCost = 0;
  const destinationHandicapCost = 0;

  // No additional mover cost - already included in hourly rate
  const additionalMoverCost = 0;

  // Only charge for additional trucks
  const additionalTrucks = Math.max(0, requiredTrucks - 1);
  const additionalTruckCost = additionalTrucks * TRAVEL_CONSTANTS.ADDITIONAL_TRUCK_HOURLY * effectiveBaseTimeHours;

  // Calculate special items cost
  const specialItemsCost = params.specialItems
    ? params.specialItems.reduce((total, item) => total + (item.price * item.quantity), 0)
    : 0;

  // Sum all costs 
  // Note: baseMovingCost already includes all billed time multiplied by hourly rate
  // Packing and unpacking costs are derived from those hours, so we don't add them separately
  const subtotal = baseMovingCost +
    originHandicapCost +
    destinationHandicapCost +
    additionalTruckCost +
    travel.travelCost +
    travel.fuelCost +
    travel.mileageCost +
    materialsCost +
    specialItemsCost;

  const total = subtotal; // Add tax if needed later

  // 8. Create Job Charges Data object
  const jobCharges = createJobChargeDataObject(
    undefined, // job_id to be filled in later
    baseHourlyRate,
    effectiveBaseTimeHours,
    calculatedPackingTimeHours,
    calculatedUnpackingTimeHours,
    finalRequiredMovers,
    requiredTrucks,
    originHandicapPercent,
    destinationHandicapPercent,
    travel,
    materialsCost,
    specialItemsCost,
    minimumHours,
    combinedBaseTime,
    params.serviceType
  );

  return {
    calculatedMovingTimeHours,
    calculatedPackingTimeHours,
    calculatedUnpackingTimeHours,
    effectiveBaseTimeHours,
    travelTimeHours: travel.travelTime,
    totalBilledTimeHours: effectiveBaseTimeHours + travel.travelTime,
    requiredMovers: finalRequiredMovers,
    requiredTrucks,
    baseHourlyRate,
    estimatedBoxes,
    materialsCost,
    baseMovingCost,
    additionalTruckCost,
    originHandicapCost,
    destinationHandicapCost,
    travelCost: travel.travelCost,
    fuelCost: travel.fuelCost,
    mileageCost: travel.mileageCost,
    specialItemsCost,
    additionalMoverCost,
    subtotal,
    total,
    moveDistance: distanceInfo.distance,
    jobCharges
  };
}

/**
 * Re-rate an existing job with potentially overridden values
 */
export async function rerateEstimate(
  params: EstimationParams,
  existingJobCharges?: JobChargeData
): Promise<EstimateResult> {
  // Calculate fresh estimate
  const newEstimate = await calculateEstimate(params);
  
  // If no existing charges, just return the new estimate
  if (!existingJobCharges) {
    return newEstimate;
  }
  
  // Create a copy of the new estimate's job charges
  const updatedJobCharges: JobChargeData = { ...newEstimate.jobCharges };
  
  // Preserve job_id
  if (existingJobCharges.job_id) {
    updatedJobCharges.job_id = existingJobCharges.job_id;
  }
  
  // For each field in the existing charges, preserve overrides
  for (const [key, existingValue] of Object.entries(existingJobCharges)) {
    if (key === 'job_id') continue;
    
    // If existing field is overridden, preserve its value
    if (existingValue && existingValue.isOverridden) {
      updatedJobCharges[key as keyof JobChargeData] = existingValue;
    }
  }
  
  // Return the updated estimate with preserved overrides
  return {
    ...newEstimate,
    jobCharges: updatedJobCharges
  };
}
