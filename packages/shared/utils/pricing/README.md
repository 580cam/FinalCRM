# Moving Company Core Pricing Engine

The foundation pricing system for all moving company CRM applications. This TypeScript package provides comprehensive, accurate, and flexible pricing calculations that comply with industry standards and business requirements.

## Applications Served

- **Marketing Website**: Quote estimates and lead generation
- **CRM Web Application**: Detailed pricing and job management
- **CRM Mobile Application**: Field pricing and mobile quotes
- **Crew Mobile Application**: Job pricing and time tracking

## Features

### ✅ Complete Business Logic Implementation

- **Move Size to Cubic Feet Mapping**: 23 predefined move sizes with exact cubic feet values
- **Service Tier Speed Calculations**: Grab-n-Go (95), Full Service (80), White Glove (70), Labor Only (90) cuft/hr/mover
- **Dynamic Crew Size Determination**: Intelligent crew sizing based on cubic feet and business rules
- **Handicap Accessibility Modifiers**: Comprehensive calculations for stairs, walking distance, and elevator access
- **Crew Size Adjustments**: Automatic crew increases based on handicap complexity
- **Multi-Day Move Splitting**: LOCAL (≤30 mi, >9 hrs), REGIONAL (30-120 mi, >14 hrs), LONG_DISTANCE logic
- **Comprehensive Cost Breakdown**: Labor, fuel, mileage, additional trucks, emergency services

### ✅ Production-Ready Architecture

- **100% TypeScript**: Full type safety with comprehensive interfaces
- **Pure Functions**: Immutable, testable calculation functions
- **Error Handling**: Comprehensive validation and structured error responses
- **Performance Optimized**: Efficient calculations with minimal overhead
- **Extensible Design**: Easy to modify rates and add new business rules

### ✅ Comprehensive Testing

- **Unit Tests**: 100% coverage of all calculation functions
- **Integration Tests**: End-to-end pricing scenarios
- **Edge Case Validation**: Boundary conditions and error states
- **Real-World Scenarios**: Actual moving company use cases

## Quick Start

```typescript
import { calculatePricing, PricingInputs } from '@moving-crm/pricing-engine';

const pricingInputs: PricingInputs = {
  moveSize: "2 Bedroom Apartment",
  serviceTier: "Full Service",
  serviceType: "Moving",
  distanceMiles: 25,
  handicapFactors: {
    stairs: 1,
    walkFeet: 50,
    elevator: false
  }
};

const result = calculatePricing(pricingInputs);

if (result.success) {
  console.log(`Total Price: $${result.data.subtotal}`);
  console.log(`Estimated Time: ${result.data.baseTimeHours} hours`);
  console.log(`Crew Size: ${result.data.crewSize} movers`);
}
```

## Core Functions

### Main Pricing Engine

- `calculatePricing(inputs)`: Complete pricing calculation with full breakdown
- `calculateQuickPrice(moveSize, serviceTier, serviceType, distance)`: Fast estimate for quotes
- `getPricingBreakdown(inputs)`: Customer-friendly pricing summary

### Individual Calculations

- `getCubicFeet(moveSize, customOverride?)`: Get cubic feet for move size
- `determineCrewSize(cubicFeet, forceSize?)`: Calculate optimal crew size
- `calculateHandicapModifier(cubicFeet, factors)`: Accessibility surcharges
- `determineCrewAdjustment(cubicFeet, crewSize, handicapModifier)`: Crew size adjustments
- `classifyMoveType(distance)`: LOCAL, REGIONAL, or LONG_DISTANCE
- `determineDaySplit(timeHours, moveType)`: Multi-day move logic

## Business Rules

### Move Size Mapping (Cubic Feet)
```typescript
"Room or Less": 75
"Studio Apartment": 288
"1 Bedroom Apartment": 432
"2 Bedroom Apartment": 743
"3 Bedroom Apartment": 1296
// ... 23 total predefined sizes
```

### Service Tier Speeds (cuft/hr/mover)
```typescript
"Grab-n-Go": 95    // Fastest service
"Full Service": 80  // Standard service
"White Glove": 70   // Premium service
"Labor Only": 90    // Labor-only moves
```

### Crew Size Rules
- ≤ 1009 cuft: 2 movers
- 1010-1500 cuft: 3 movers  
- 1501-2000 cuft: 4 movers
- 2001-3200 cuft: 5 movers
- \> 3200 cuft: 6 movers

### Handicap Modifiers (cuft ≥ 400 only)
- Stairs: +9% per flight
- Walking: +9% per 100ft
- Elevator: +18%

### Crew Adjustments (cuft ≥ 400 only)
- < 300 cuft: Add mover at 36%/72% handicap
- 300-599 cuft: Add mover at 27%/54% handicap  
- ≥ 600 cuft: Add mover at 18%/36% handicap

### Day Split Logic
- LOCAL (≤30 miles): Split if > 9 hours
- REGIONAL (30-120 miles): Split if > 14 hours
- LONG_DISTANCE (>120 miles): Multi-day by default

## Pricing Structure

### Base Hourly Rates
```typescript
Moving/Packing/Full Service: $169-$469 (2-7 crew)
White Glove: $199-$574 (2-7 crew) 
Labor Only: $129-$429 (2-7 crew)
Commercial: $169-$469 (2-7 crew)
```

### Additional Services
```typescript
Fuel: $2.00/mile
Mileage: $4.29/mile  
Additional Truck: $30/hour
Emergency Service: $30/hour
```

## Error Handling

The pricing engine provides structured error handling:

```typescript
interface PricingResult {
  success: boolean;
  data?: PricingCalculationResult;
  errors?: ValidationError[];
  warnings?: string[];
}
```

### Error Codes
- `INVALID_MOVE_SIZE`: Invalid or missing move size
- `INVALID_SERVICE_TIER`: Invalid service tier
- `INVALID_DISTANCE`: Invalid distance value
- `INVALID_HANDICAP_FACTORS`: Invalid accessibility factors
- `CALCULATION_ERROR`: Internal calculation error

## Testing

Run the comprehensive test suite:

```bash
npm test                # Run all tests
npm run test:watch     # Watch mode for development  
npm run test:coverage  # Coverage report
```

Tests include:
- Unit tests for all calculation functions
- Integration tests for complete pricing scenarios
- Edge case validation
- Real-world moving company scenarios
- Error condition handling

## Integration Examples

### Marketing Website (Quick Quote)
```typescript
const quickPrice = calculateQuickPrice(
  "3 Bedroom House",
  "Full Service", 
  "Moving",
  45
);
// Returns: { success: true, price: 1247.50, timeHours: 8.2 }
```

### CRM Applications (Full Details)
```typescript
const fullPricing = calculatePricing({
  moveSize: "4 Bedroom House",
  serviceTier: "White Glove",
  serviceType: "White Glove", 
  distanceMiles: 125,
  handicapFactors: { stairs: 2, walkFeet: 100, elevator: true },
  additionalTrucks: 1,
  emergencyService: true
});

// Returns comprehensive breakdown with:
// - Labor costs, travel costs, surcharges
// - Time estimates and crew requirements
// - Day-by-day scheduling information  
// - Detailed reasoning for all calculations
```

### Mobile Applications (Customer Breakdown)
```typescript
const breakdown = getPricingBreakdown(pricingInputs);
// Returns customer-friendly summary:
// {
//   laborCost: 1200.00,
//   travelCosts: 150.50,
//   additionalServices: 75.00,
//   total: 1425.50,
//   timeEstimate: "2 days (16.5 total hours)",
//   crewSize: 4
// }
```

## Configuration

All business rules are centralized in `constants.ts` for easy maintenance:

```typescript
import { PRICING_CONFIG } from '@moving-crm/pricing-engine';

// Access all configuration
const config = PRICING_CONFIG;

// Individual components
const moveSizes = MOVE_SIZE_CUFT;
const hourlyRates = BASE_HOURLY_RATES;
const serviceSpeeds = SERVICE_SPEED;
```

## Validation

Built-in validation ensures data integrity:

```typescript
import { validatePricingEngineSetup } from '@moving-crm/pricing-engine';

const validation = validatePricingEngineSetup();
if (!validation.valid) {
  console.error('Pricing engine setup errors:', validation.errors);
}
```

## Version & Compatibility

- **Version**: 1.0.0
- **TypeScript**: 5.0+  
- **Node.js**: 16.0+
- **Dependencies**: Zero runtime dependencies

## Support

This pricing engine is the foundation for all CRM applications and is maintained with the highest standards for:

- **Accuracy**: All calculations match business specifications exactly
- **Performance**: Optimized for high-frequency pricing requests  
- **Reliability**: Comprehensive error handling and validation
- **Maintainability**: Clean, documented, and tested codebase
- **Extensibility**: Easy to add new business rules and pricing models

For questions, bug reports, or feature requests, please contact the development team or create an issue in the project repository.