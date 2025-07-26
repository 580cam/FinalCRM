import { NextResponse } from 'next/server';

/**
 * API route for Google Routes API
 * This endpoint will calculate the driving distance between two addresses
 */
export async function POST(request: Request) {
  try {
    // Extract origin and destination from request body
    const { origin, destination } = await request.json();

    // Validate request parameters
    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination addresses are required' },
        { status: 400 }
      );
    }

    // Get API key from environment variables
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key is not defined in environment variables');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // Build request payload for Routes API
    const requestBody = {
      origin: {
        address: origin,
      },
      destination: {
        address: destination,
      },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      computeAlternativeRoutes: false,
      routeModifiers: {
        avoidTolls: false,
        avoidHighways: false,
        avoidFerries: false,
      },
      languageCode: "en-US",
      units: "IMPERIAL",
    };

    // Call Google Routes API
    const response = await fetch(
      `https://routes.googleapis.com/directions/v2:computeRoutes`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline,routes.legs'
        },
        body: JSON.stringify(requestBody),
      }
    );

    // Parse API response
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Routes API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch route data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // If no routes found
    if (!data.routes || data.routes.length === 0) {
      return NextResponse.json(
        { error: 'No routes found' },
        { status: 404 }
      );
    }

    // Extract route information
    const route = data.routes[0];
    
    // Convert distance from meters to miles
    const distanceInMiles = route.distanceMeters / 1609.34;
    
    // Convert duration from seconds to minutes
    const durationInMinutes = route.duration ? 
      parseInt(route.duration.replace('s', '')) / 60 : 0;

    // Return processed data
    return NextResponse.json({
      distanceInMiles,
      durationInMinutes,
      polyline: route.polyline?.encodedPolyline,
      legs: route.legs,
      status: 'OK',
    });
    
  } catch (error) {
    console.error('Route calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate route' },
      { status: 500 }
    );
  }
}
