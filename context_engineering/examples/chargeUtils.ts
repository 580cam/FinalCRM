/**
 * Represents a charge value with tracking for initial, estimated, and actual values
 */
export interface ChargeValue<T = number | null> {
  value: T;              // The current value to use (often estimated or actual if set)
  initialValue: T;       // The very first system estimate
  estimatedValue: T;     // The latest system estimate
  actualValue: T | null; // The final value after job/user input
  isOverridden: boolean; // True if a user manually changed 'value' or 'actualValue'
  unit?: string;         // e.g., 'boxes', '$', 'hours'
}

/**
 * Creates a ChargeValue object with the given values
 */
export function createChargeValue<T>(
  initialValue: T, 
  estimatedValue: T = initialValue, 
  actualValue: T | null = null, 
  isOverridden: boolean = false,
  unit?: string
): ChargeValue<T> {
  return {
    value: isOverridden && actualValue !== null ? actualValue : estimatedValue,
    initialValue,
    estimatedValue,
    actualValue,
    isOverridden,
    unit
  };
}

/**
 * Updates a ChargeValue object with new estimated values, preserving overrides
 */
export function updateChargeValue<T>(
  existing: ChargeValue<T>,
  newEstimatedValue: T
): ChargeValue<T> {
  // If value was overridden, keep the override
  if (existing.isOverridden) {
    return {
      ...existing,
      estimatedValue: newEstimatedValue,
      // Keep the original value if it was overridden
    };
  }
  
  // Otherwise update both estimated and current value
  return {
    ...existing,
    value: newEstimatedValue,
    estimatedValue: newEstimatedValue
  };
}

/**
 * Sets an override on a ChargeValue
 */
export function overrideChargeValue<T>(
  existing: ChargeValue<T>,
  overrideValue: T
): ChargeValue<T> {
  return {
    ...existing,
    value: overrideValue,
    actualValue: overrideValue,
    isOverridden: true
  };
}

/**
 * Interface for individual job charge item
 */
export interface JobChargeItem {
  job_id?: number;
  type: string; // 'packing', 'load', 'travel', 'unload', 'unpacking', 'materials', etc.
  hourly_rate?: ChargeValue;
  hours?: ChargeValue;
  number_of_crew?: ChargeValue;
  driving_time_mins?: ChargeValue;
  amount: ChargeValue;
  is_billable: ChargeValue<boolean>;
}

/**
 * Interface for job charge data object (used in job_charges table)
 */
export interface JobChargeData {
  job_id?: number;
  hourly_rate?: ChargeValue;
  hours?: ChargeValue; // Total billed hours
  packing_hours?: ChargeValue; // Specific packing time estimate
  unpacking_hours?: ChargeValue; // Specific unpacking time estimate
  number_of_crew?: ChargeValue;
  number_of_trucks?: ChargeValue;
  origin_handicaps?: ChargeValue; // Percentage
  destination_handicaps?: ChargeValue; // Percentage
  minimum_time?: ChargeValue; // Minimum hours applied (e.g., 2)
  fuel_cost?: ChargeValue;
  milage_cost?: ChargeValue; // Typo from schema
  item_cost?: ChargeValue; // For materials
  charges?: JobChargeItem[]; // Array of individual charge items
  // Add other potential charge fields from schema as needed
}
