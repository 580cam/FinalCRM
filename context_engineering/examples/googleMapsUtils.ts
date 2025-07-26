/**
 * Google Maps Utilities for distance calculations and geocoding
 */

import { Address } from './estimationUtils';

// Interface for Google Maps Place results
interface PlaceResult {
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  formatted_address?: string;
  geometry?: {
    location?: {
      lat: () => number;
      lng: () => number;
    };
  };
  place_id?: string;
  name?: string;
}

// Interface for Autocomplete options
interface AutocompleteOptions {
  types?: string[];
  componentRestrictions?: {
    country: string | string[];
  };
}

// Interface for our Routes API response
interface RouteResponse {
  distanceInMiles: number;
  durationInMinutes: number;
  polyline?: string;
  legs?: any[];
  status: string;
}

// Use API key from environment variables
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

/**
 * Calculate the driving distance between two addresses using our Routes API endpoint
 */
export async function calculateDrivingDistance(
  originAddress: string,
  destinationAddress: string
): Promise<{
  distanceInMiles: number;
  durationInMinutes: number;
  status: string;
}> {
  try {
    // Call our internal API route which uses the Google Routes API
    const response = await fetch('/api/maps/route', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        origin: originAddress,
        destination: destinationAddress,
      }),
    });

    // Check if API call was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error from Routes API:', errorData);
      return {
        distanceInMiles: 0,
        durationInMinutes: 0,
        status: 'ERROR',
      };
    }

    // Parse response
    const data: RouteResponse = await response.json();

    return {
      distanceInMiles: data.distanceInMiles,
      durationInMinutes: data.durationInMinutes,
      status: data.status,
    };
  } catch (error) {
    console.error('Error calculating distance:', error);
    return {
      distanceInMiles: 0,
      durationInMinutes: 0,
      status: 'ERROR',
    };
  }
}

/**
 * Calculate the driving distance between multiple addresses
 * For a move, this calculates total distance between all consecutive addresses
 */
export async function calculateMoveDistance(addresses: Address[]): Promise<{
  distanceInMiles: number;
  durationInMinutes: number;
}> {
  // If there are less than 2 addresses, return 0 miles
  if (addresses.length < 2) {
    return {
      distanceInMiles: 0,
      durationInMinutes: 0
    };
  }

  try {
    let totalDistanceInMiles = 0;
    let totalDurationInMinutes = 0;

    // Calculate distance between each consecutive pair of addresses
    for (let i = 0; i < addresses.length - 1; i++) {
      const origin = addresses[i].fullAddress;
      const destination = addresses[i + 1].fullAddress;
      
      // Skip if either address is missing
      if (!origin || !destination) {
        console.warn(`Missing address data for stops ${i} and ${i+1}`);
        continue;
      }
      
      const result = await calculateDrivingDistance(
        origin,
        destination
      );

      totalDistanceInMiles += result.distanceInMiles;
      totalDurationInMinutes += result.durationInMinutes;
    }

    return {
      distanceInMiles: totalDistanceInMiles,
      durationInMinutes: totalDurationInMinutes
    };
  } catch (error) {
    console.error('Error calculating move distance:', error);
    
    // Fallback to simple estimation based on consecutive ZIP codes if available
    try {
      let totalDistanceInMiles = 0;
      let totalDurationInMinutes = 0;
      
      for (let i = 0; i < addresses.length - 1; i++) {
        const originZip = addresses[i].zip;
        const destZip = addresses[i + 1].zip;
        
        if (originZip && destZip) {
          const originZipNum = parseInt(originZip, 10);
          const destZipNum = parseInt(destZip, 10);
          
          if (!isNaN(originZipNum) && !isNaN(destZipNum)) {
            // Very rough ZIP code based distance estimation
            const distanceInMiles = Math.abs(originZipNum - destZipNum) / 100;
            // Assuming ~45mph average speed for the fallback
            const durationInMinutes = (distanceInMiles / 45) * 60;
            
            totalDistanceInMiles += distanceInMiles;
            totalDurationInMinutes += durationInMinutes;
          }
        }
      }
      
      if (totalDistanceInMiles > 0) {
        return { 
          distanceInMiles: totalDistanceInMiles,
          durationInMinutes: totalDurationInMinutes
        };
      }
    } catch (fallbackError) {
      console.error('Error in distance fallback calculation:', fallbackError);
    }
    
    // If all else fails, return a default value with multiple stops estimation
    const defaultDistancePerStop = 5;
    const defaultTimePerStop = 15; // 15 minutes per stop
    const numberOfStops = addresses.length - 1;
    
    return { 
      distanceInMiles: defaultDistancePerStop * numberOfStops,
      durationInMinutes: defaultTimePerStop * numberOfStops
    };
  }
}

/**
 * Initialize the Google Maps API for client-side use
 * Call this before using any Google Maps functionality on the client
 */
export function initGoogleMapsApi(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Skip if not in browser, API already loaded, or no key provided
    if (typeof window === 'undefined' || (window as any).google?.maps || !GOOGLE_MAPS_API_KEY) {
      resolve();
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    // Set up callbacks
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps API'));
    
    // Add script to document
    document.head.appendChild(script);
  });
}

/**
 * Autocomplete address using Google Maps Places API
 * This can be used in the frontend to provide address suggestions
 */
export function setupAddressAutocomplete(
  inputElement: HTMLInputElement,
  onPlaceSelected: (place: PlaceResult) => void
): any {
  // Skip if not in browser or Places API not loaded
  if (typeof window === 'undefined' || !(window as any).google?.maps?.places) {
    console.error('Google Maps Places API not loaded');
    return null;
  }

  // Create autocomplete instance with type assertion
  const autocomplete = new ((window as any).google.maps.places.Autocomplete)(
    inputElement,
    {
      types: ['address'],
      componentRestrictions: { country: 'us' },
    }
  );

  // Set up place changed event listener
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    onPlaceSelected(place as PlaceResult);
  });

  return autocomplete;
}
