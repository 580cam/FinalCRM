import { createClient } from '@/lib/supabase/client';
import { 
  EstimationParams, 
  EstimateResult, 
  ServiceType,
  calculateEstimate,
  SpecialItem
} from '@/lib/estimationUtils';
import { PackingIntensity } from '@/lib/boxEstimator';
import { getMoveSizeCubicFeet } from '@/lib/estimationUtils';

// Define the EstimateAddress type to match what's used in estimationUtils
interface EstimateAddress {
  fullAddress: string;
  propertyName?: string;
  unitNumber?: string;
  stairs?: number;
  elevator?: boolean;
  walkDistance?: number;
}

// Interface to match the form data address structure
interface FormAddress {
  address: string;
  propertyName?: string;
  unitNumber?: string;
  propertyType?: string;
  parkingType?: string;
  stairs?: string | number;
  elevator?: string | boolean;
  walkDistance?: string | number;
  stopType?: 'pickup' | 'dropoff';
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isCustomMode?: boolean;
  handicaps?: string[];
}

/**
 * Helper function to parse walk distance from form values
 * Handles "Less than 100 feet" as 0 feet
 */
function parseWalkDistance(walkDistance: string | number | undefined): number {
  if (!walkDistance) return 0;
  
  if (typeof walkDistance === 'string') {
    if (walkDistance === 'Less than 100 feet') return 0;
    
    // Extract first number from string like "100-200 feet"
    const matches = walkDistance.match(/\d+/);
    return matches ? parseInt(matches[0], 10) : 0;
  }
  
  // It's already a number
  return walkDistance;
}

/**
 * Saves an estimate and related data to the database, creating a quote and related records
 */
export async function saveEstimateToDatabase(params: {
  leadId: number;
  name: string;
  email: string;
  phone: string;
  moveDate?: Date;
  moveSize: string;
  serviceType: string;
  referralSource: string;
  addresses: EstimateAddress[];
  specialItems?: SpecialItem[];
  userId?: number;
  packingIntensity?: PackingIntensity;
}): Promise<{
  quoteId: number | null;
  success: boolean;
  error?: string;
}> {
  const supabase = createClient();
  
  try {
    // Get current user info from Supabase auth
    const { data: { user } } = await supabase.auth.getUser();
    let userId = params.userId; // Use provided userId as fallback
    
    if (user?.email) {
      console.log('Current auth user email:', user.email);
      
      // Explicitly query the users table in the public schema (default)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();
      
      if (userError) {
        console.error('Error finding user:', userError);
        // Continue with fallback userId if available
      } else if (userData) {
        userId = userData.id;
        console.log('Found user in database with id:', userId);
      } else {
        console.log('User not found in database with email:', user.email);
        // Continue with fallback userId if available
      }
    } else {
      console.log('No authenticated user found, using fallback user ID if available');
    }
    
    // Use fallback userId (from params) if we couldn't find the user
    if (!userId) {
      console.log('Using default user ID as fallback');
      userId = 71; // Default fallback - only use if nothing else worked
    }
    
    console.log('Final user ID being used:', userId);
    
    // Prepare addresses for calculation
    const validAddresses = params.addresses.filter(addr => addr.fullAddress);
    
    // Run the estimation calculations
    const estimateParams: EstimationParams = {
      addresses: validAddresses,
      serviceType: params.serviceType as ServiceType,
      moveSize: params.moveSize,
      calculationMode: 'moveSize',
      specialItems: params.specialItems || [],
      packingIntensity: params.packingIntensity || 'Normal'
    };
    
    // Calculate the estimate
    const estimate: EstimateResult = await calculateEstimate(estimateParams);
    
    // Calculate cubic feet and weight
    const cubicFeet = getMoveSizeCubicFeet(params.moveSize);
    const weight = cubicFeet * 7; // 7 lbs per cubic foot is industry standard
    
    // 1. Insert quote record
    const { data: quoteData, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        lead_id: params.leadId,
        total: estimate.total,
        total_cubic_ft: cubicFeet,
        total_weight: weight,
        move_size: params.moveSize,
        service_type: params.serviceType,
        referral_source: params.referralSource,
        calculation_mode: 'moveSize',
        user_id: userId,
        status: 'Opportunity',
        packing_density: params.packingIntensity || 'Normal',
        is_self_claimed: true // Set is_self_claimed to true
      })
      .select('id')
      .single();
    
    if (quoteError) {
      console.error('Error creating quote:', quoteError);
      return { quoteId: null, success: false, error: quoteError.message };
    }
    
    const quoteId = quoteData.id;
    
    // 2. Create job record
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .insert({
        quote_id: quoteId,
        movers: estimate.requiredMovers,
        trucks: estimate.requiredTrucks,
        estimated_hours: estimate.totalBilledTimeHours,
        hourly_rate: estimate.baseHourlyRate,
        total_price: estimate.total,
        job_type: params.serviceType,
        job_status: 'Pending',
        move_date: params.moveDate?.toISOString(),
        move_distance: estimate.moveDistance, // Use exact distance from estimate
      })
      .select('id')
      .single();
    
    if (jobError) {
      console.error('Error creating job:', jobError);
      return { quoteId, success: false, error: jobError.message };
    }
    
    const jobId = jobData.id;
    
    // 3. Create job schedule
    const { error: scheduleError } = await supabase
      .from('job_schedule')
      .insert({
        job_id: jobId,
        scheduled_date: params.moveDate?.toISOString(),
        // No start_time and end_time initially
      });
    
    if (scheduleError) {
      console.error('Error creating job schedule:', scheduleError);
      return { quoteId, success: false, error: scheduleError.message };
    }
    
    // 3. Create job addresses
    try {
      // Make sure we have at least one address
      if (!params.addresses || params.addresses.length === 0) {
        throw new Error('No addresses provided for job');
      }
      
      // Create origin address (must exist)
      const originAddress = params.addresses[0] as any;
      const originStairs = originAddress.stairs ? Number(originAddress.stairs) : 0;
      const originWalkDistance = parseWalkDistance(originAddress.walkDistance);
      
      const { error: originError } = await supabase
        .from('job_addresses')
        .insert({
          job_id: jobId,
          address: 'fullAddress' in originAddress ? originAddress.fullAddress : originAddress.address,
          type: 'origin',
          property_name: originAddress.propertyName || '',
          unit_number: originAddress.unitNumber || '',
          stairs: originStairs.toString(),
          elevator: originAddress.elevator === 'Yes' || originAddress.elevator === true,
          walk_distance: originWalkDistance.toString(),
        });
      
      if (originError) {
        console.error('Error creating origin address:', originError);
        return { quoteId, success: false, error: originError.message };
      }
      
      // Create destination address (if it exists)
      if (params.addresses.length > 1) {
        const destAddress = params.addresses[1] as any;
        const destStairs = destAddress.stairs ? Number(destAddress.stairs) : 0;
        const destWalkDistance = parseWalkDistance(destAddress.walkDistance);
        
        const { error: destError } = await supabase
          .from('job_addresses')
          .insert({
            job_id: jobId,
            address: 'fullAddress' in destAddress ? destAddress.fullAddress : destAddress.address,
            type: 'destination',
            property_name: destAddress.propertyName || '',
            unit_number: destAddress.unitNumber || '',
            stairs: destStairs.toString(),
            elevator: destAddress.elevator === 'Yes' || destAddress.elevator === true,
            walk_distance: destWalkDistance.toString(),
          });
        
        if (destError) {
          console.error('Error creating destination address:', destError);
          return { quoteId, success: false, error: destError.message };
        }
      }
      
      // Additional addresses as stops if needed (for future use)
      for (let i = 2; i < params.addresses.length; i++) {
        const stopAddress = params.addresses[i] as any;
        const stopStairs = stopAddress.stairs ? Number(stopAddress.stairs) : 0;
        const stopWalkDistance = parseWalkDistance(stopAddress.walkDistance);
        
        const { error: stopError } = await supabase
          .from('job_addresses')
          .insert({
            job_id: jobId,
            address: 'fullAddress' in stopAddress ? stopAddress.fullAddress : stopAddress.address,
            type: stopAddress.stopType === 'pickup' ? 'origin' : 'destination',
            property_name: stopAddress.propertyName || '',
            unit_number: stopAddress.unitNumber || '',
            stairs: stopStairs.toString(),
            elevator: stopAddress.elevator === 'Yes' || stopAddress.elevator === true,
            walk_distance: stopWalkDistance.toString(),
          });
        
        if (stopError) {
          console.error(`Error creating stop address ${i}:`, stopError);
          // Continue even if stop creation fails
        }
      }
    } catch (error: any) {
      console.error('Exception creating job addresses:', error);
      return { quoteId, success: false, error: error.message || 'Error creating job addresses' };
    }
    
    // 3. Insert job charges to track all the costs
    try {
      // Use the job charges data from the estimate
      if (estimate.jobCharges && estimate.jobCharges.charges) {
        for (const charge of estimate.jobCharges.charges) {
          // Create each charge from the estimate's job charges
          const { error: chargeError } = await supabase
            .from('job_charges')
            .insert({
              job_id: jobId,
              type: charge.type,
              hourly_rate: charge.hourly_rate,
              hours: charge.hours,
              number_of_crew: charge.number_of_crew,
              driving_time_mins: charge.driving_time_mins,
              amount: charge.amount,
              is_billable: charge.is_billable
            });
          
          if (chargeError) {
            console.error(`Error creating ${charge.type} charge:`, chargeError);
          }
        }
      } else {
        console.error('No job charges found in estimate');
      }
      
      // Add crew and truck info to the main job record
      if (estimate.jobCharges && (estimate.jobCharges.number_of_crew || estimate.jobCharges.number_of_trucks)) {
        try {
          // First verify the job exists
          const { data: jobCheck, error: jobCheckError } = await supabase
            .from('jobs')
            .select('id')
            .eq('id', jobId)
            .single();
            
          if (jobCheckError) {
            console.error('Error finding job for crew/truck update:', jobCheckError);
          } else if (jobCheck) {
            // Prepare the update data - using the correct column names from the database schema
            const jobUpdateData: Record<string, any> = {};
            
            // Column name is 'movers' in the database, not 'number_of_crew'
            if (estimate.jobCharges.number_of_crew) {
              jobUpdateData.movers = Number(estimate.jobCharges.number_of_crew.estimatedValue);
            }
            
            // Column name is 'trucks' in the database, not 'number_of_trucks'
            if (estimate.jobCharges.number_of_trucks) {
              jobUpdateData.trucks = Number(estimate.jobCharges.number_of_trucks.estimatedValue);
            }
            
            console.log('Updating job with crew/truck info:', { jobId, jobUpdateData });
            
            const { error: jobUpdateError } = await supabase
              .from('jobs')
              .update(jobUpdateData)
              .eq('id', jobId);
              
            if (jobUpdateError) {
              console.error('Error updating job crew/truck info:', jobUpdateError);
            }
          } else {
            console.error('Could not find job with ID:', jobId);
          }
        } catch (error) {
          console.error('Exception during job crew/truck update:', error);
        }
      }
      
      // Create materials record if packing is included
      if (['Packing', 'Full Service', 'White Glove', 'Moving and Packing'].includes(params.serviceType) && 
          estimate.materialsCost > 0 && estimate.estimatedBoxes) {
        
        try {
          // Log the materials data we're about to insert
          console.log('Creating job materials with data:', {
            job_id: jobId,
            typeColumn: 'meterial_type', // Note: column name has a typo in the database schema
            service_type: params.serviceType,
            materials_cost: estimate.materialsCost,
            box_counts: estimate.estimatedBoxes
          });
          
          // Create job materials record with box counts
          const { data: materialsData, error: materialsError } = await supabase
            .from('job_materials')
            .insert({
              job_id: jobId,
              meterial_type: 'packing', // Match the database column name which has a typo
              estimated_quantity: {
                initialValue: {
                  small: estimate.estimatedBoxes.small,
                  medium: estimate.estimatedBoxes.medium,
                  large: estimate.estimatedBoxes.large,
                  wardrobe: estimate.estimatedBoxes.wardrobe,
                  dishPack: estimate.estimatedBoxes.dishPack,
                  mattressBag: estimate.estimatedBoxes.mattressBag,
                  tvBox: estimate.estimatedBoxes.tvBox,
                },
                estimatedValue: {
                  small: estimate.estimatedBoxes.small,
                  medium: estimate.estimatedBoxes.medium,
                  large: estimate.estimatedBoxes.large,
                  wardrobe: estimate.estimatedBoxes.wardrobe,
                  dishPack: estimate.estimatedBoxes.dishPack,
                  mattressBag: estimate.estimatedBoxes.mattressBag,
                  tvBox: estimate.estimatedBoxes.tvBox,
                },
                actualValue: null,
                isOverridden: false
              },
              price_per_unit: {
                small: 3.00,
                medium: 4.50,
                large: 5.00,
                dishPack: 8.00,
                wardrobe: 12.00,
                tvBox: 10.00,
                mattressBag: 10.00,
              },
              total_estimated_cost: {
                initialValue: estimate.materialsCost,
                estimatedValue: estimate.materialsCost,
                actualValue: null,
                isOverridden: false
              }
            })
            .select();
          
          if (materialsError) {
            console.error('Error creating job materials:', materialsError);
            
            // Try to log more detailed information about the error
            if (materialsError.details) {
              console.error('Error details:', materialsError.details);
            }
            if (materialsError.hint) {
              console.error('Error hint:', materialsError.hint);
            }
            if (materialsError.code) {
              console.error('Error code:', materialsError.code);
            }
          } else {
            console.log('Successfully created job materials with ID:', materialsData?.[0]?.id);
          }
        } catch (error) {
          console.error('Exception during job materials creation:', error);
        }
      }
    } catch (error) {
      console.error('Error handling job charges:', error);
    }
    
    // Recalculate the total when jobs and charges are added
    try {
      // Fetch all job charges to calculate the actual total
      const { data: allJobCharges, error: chargesError } = await supabase
        .from('job_charges')
        .select('id, amount, is_billable')
        .eq('job_id', jobId);
      
      if (chargesError) {
        console.error('Error fetching job charges for total calculation:', chargesError);
      } else {
        // Calculate the total from all job charges
        const calculatedTotal = allJobCharges.reduce((sum, charge) => {
          const isBillable = charge.is_billable?.estimatedValue !== false;
          return sum + (isBillable ? (charge.amount?.estimatedValue || 0) : 0);
        }, 0);
        
        console.log('Calculated total from job charges:', calculatedTotal);
        
        // Update the quote with the calculated total
        const { data: updatedQuoteData, error: updateQuoteError } = await supabase
          .from('quotes')
          .update({
            total: calculatedTotal,
          })
          .eq('id', quoteId)
          .select('id')
          .single();
        
        if (updateQuoteError) {
          console.error('Error updating quote with calculated total:', updateQuoteError);
        } else {
          console.log('Successfully updated quote total based on job charges');
        }
      }
    } catch (error) {
      console.error('Error calculating quote total from job charges:', error);
    }
    
    // Successfully saved everything
    return {
      quoteId,
      success: true
    };
    
  } catch (error: any) {
    console.error('Error in saveEstimateToDatabase:', error);
    return {
      quoteId: null,
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

/**
 * Maps modal form data addresses to estimate addresses
 */
export function mapFormAddressesToEstimateAddresses(
  originAddress: FormAddress,
  destinationAddresses: FormAddress[]
): EstimateAddress[] {
  const addresses: EstimateAddress[] = [];
  
  // Map origin address
  if (originAddress && originAddress.address) {
    addresses.push({
      fullAddress: originAddress.address,
      propertyName: originAddress.propertyName || '',
      unitNumber: originAddress.unitNumber || '',
      stairs: originAddress.stairs ? parseInt(originAddress.stairs.toString().replace(/\D/g, '') || '0', 10) : 0,
      elevator: originAddress.elevator === 'Yes' || originAddress.elevator === true,
      walkDistance: originAddress.walkDistance ? 
        originAddress.walkDistance === 'Less than 100 feet' ? 0 : 
        parseInt(originAddress.walkDistance.toString().replace(/\D/g, '') || '0', 10) : 0,
    });
  }
  
  // Map destination addresses
  destinationAddresses.forEach(address => {
    if (address && address.address) {
      addresses.push({
        fullAddress: address.address,
        propertyName: address.propertyName || '',
        unitNumber: address.unitNumber || '',
        stairs: address.stairs ? parseInt(address.stairs.toString().replace(/\D/g, '') || '0', 10) : 0,
        elevator: address.elevator === 'Yes' || address.elevator === true,
        walkDistance: address.walkDistance ? 
          address.walkDistance === 'Less than 100 feet' ? 0 : 
          parseInt(address.walkDistance.toString().replace(/\D/g, '') || '0', 10) : 0,
      });
    }
  });
  
  return addresses;
}
