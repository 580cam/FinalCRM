# Box Estimation System

A comprehensive TypeScript system for calculating packing materials, time estimates, and costs for moving company operations. This system integrates seamlessly with the existing pricing engine and provides accurate estimates based on property types, room configurations, and packing intensity levels.

## Features

### 🏠 Property-Based Calculations
- **Dynamic Room Calculation**: Apartment, Normal Home, Large Home with configurable bedrooms (0-5)
- **Fixed Estimates**: Studios, offices, and storage units with predefined box counts
- **Custom Room Overrides**: Flexible room configurations for unique properties

### 📦 Precise Box Allocation
- **8 Box Types**: Small, Medium, Large, Wardrobe, Dish Pack, Mattress Bag, TV Box
- **Room-Specific Allocations**: Each room type has precise box requirements
- **Packing Intensity Multipliers**: Less than Normal (0.75x), Normal (1.0x), More than Normal (1.5x)

### ⏱️ Accurate Time Calculations
- **Packing/Unpacking Times**: Different rates for each box type per worker
- **Room Penalties**: Additional time for setup, labeling, and organization
- **White Glove Service**: +20% time modifier for premium service
- **Crew Size Optimization**: Intelligent crew recommendations based on job size

### 💰 Material Cost Integration
- **Current Market Pricing**: Up-to-date costs for all packing materials
- **TV Box Rentals**: 50% rental pricing option for specialty boxes
- **Cost Breakdown**: Detailed material costs with quantity and pricing transparency

## Quick Start

```typescript
import { calculateComprehensiveEstimation } from '@moving-company/box-estimation';

// Basic estimation
const result = await calculateComprehensiveEstimation({
  propertyType: "Normal Home",
  bedrooms: 3,
  packingIntensity: "Normal",
  whiteGloveService: false
});

if (result.success) {
  console.log(`Total boxes: ${result.data.boxes.totalBoxes}`);
  console.log(`Estimated time: ${result.data.time.packingTime.totalHours + result.data.time.unpackingTime.totalHours} hours`);
  console.log(`Material cost: $${result.data.materials.totalCost}`);
  console.log(`Recommended crew: ${result.data.time.workersRequired} workers`);
}
```

## Property Types

### Apartment
- **Base Rooms**: Living Room, Kitchen
- **Bedrooms**: 0-5 (configurable)
- **Use Case**: Apartments, condos, townhomes

### Normal Home  
- **Base Rooms**: Living Room, Kitchen, Dining Room, Garage
- **Bedrooms**: 1-5 (configurable)
- **Use Case**: Standard single-family homes

### Large Home
- **Base Rooms**: Living Room, Kitchen, Dining Room, Garage, Office, Patio/Shed, Attic/Basement  
- **Bedrooms**: 1-5 (configurable)
- **Use Case**: Large homes, estates, multi-level properties

## Box Allocation Examples

### 3-Bedroom Normal Home (Normal Intensity)
```
Bedrooms (3): 51 boxes (17 each)
Living Room: 14 boxes
Kitchen: 15 boxes  
Dining Room: 8 boxes
Garage: 16 boxes
Total: 104 boxes
```

### Studio Apartment (Fixed Estimate)
```
Small: 8 boxes
Medium: 12 boxes
Large: 6 boxes
Wardrobe: 2 boxes
Dish Pack: 2 boxes
Mattress Bag: 1 box
TV Box: 1 box
Total: 32 boxes
```

## Time Calculations

### Packing Time (Minutes per Box per Worker)
- Small: 5 min
- Medium: 7 min  
- Large: 9 min
- Wardrobe: 10 min
- Dish Pack: 14 min
- Mattress Bag: 5 min
- TV Box: 6 min

### Additional Time
- **Room Setup**: +15 minutes per room (packing & unpacking)
- **White Glove**: +20% total time for premium service

## Material Pricing

### Standard Boxes
- Small Box: $1.85
- Medium Box: $2.66
- Large Box: $3.33
- Wardrobe Box: $29.03

### Specialty Items
- Dish Pack: $10.94
- TV Box (Large): $40.49 (Purchase) / $20.25 (Rental)
- Queen Mattress Bag: $12.49
- Paper Pad: $4.59

## API Reference

### Main Functions

#### `calculateComprehensiveEstimation(inputs: EstimationInputs): EstimationResult`
Complete estimation with boxes, time, and materials.

#### `calculateQuickEstimation(propertyType, bedrooms, packingIntensity): QuickResult`
Fast estimation for basic quotes.

#### `getEstimationBreakdown(inputs: EstimationInputs): BreakdownResult`
Customer-friendly breakdown for presentations.

### Integration with Pricing Engine

```typescript
import { EstimationPricingAdapter, getPricingIntegrationData } from '@moving-company/box-estimation';

const estimation = await calculateComprehensiveEstimation(inputs);
const pricingData = getPricingIntegrationData(estimation.data);

// Use with pricing engine
const pricingResult = await calculatePricing({
  ...basePricingInputs,
  additionalCosts: pricingData.materialCosts,
  packingServiceHours: pricingData.packingTime + pricingData.unpackingTime,
  forceCrewSize: pricingData.crewSizeRecommendation
});
```

### Utility Functions

```typescript
import { EstimationUtils } from '@moving-company/box-estimation';

// Get total box count
const totalBoxes = EstimationUtils.getTotalBoxes(boxAllocation);

// Get crew recommendation
const crewSize = EstimationUtils.getCrewSize(boxEstimation);

// Validate inputs
const errors = EstimationUtils.validateInputs(inputs);
```

## Common Scenarios

### Residential Moves
```typescript
import { CommonEstimationScenarios } from '@moving-company/box-estimation';

// Studio apartment
const studio = CommonEstimationScenarios.studioApartment("Normal");

// Family home
const family = CommonEstimationScenarios.familyHome(3, "Normal");

// Large estate
const estate = CommonEstimationScenarios.largeHome(5, "More than Normal", true);
```

### Commercial Moves
```typescript
// Small office
const office = CommonEstimationScenarios.smallOffice("Normal");

// Storage unit
const storage = CommonEstimationScenarios.storageUnit("10 x 15", "Less than Normal");
```

## System Validation

```typescript
import { SystemDiagnostics } from '@moving-company/box-estimation';

// Validate configuration
const configCheck = SystemDiagnostics.validateConfig();
console.log(`Configuration valid: ${configCheck.valid}`);

// Run smoke test
const smokeTest = SystemDiagnostics.runSmokeTest();
console.log(`System functional: ${smokeTest.success}`);

// Get metrics
const metrics = SystemDiagnostics.getMetrics();
console.log(`Total material items: ${metrics.materialItemCount}`);
```

## Error Handling

```typescript
const result = await calculateComprehensiveEstimation(inputs);

if (!result.success) {
  result.errors?.forEach(error => {
    console.error(`${error.field}: ${error.message} (${error.code})`);
  });
}

if (result.warnings?.length) {
  result.warnings.forEach(warning => {
    console.warn(warning);
  });
}
```

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test file
npm test -- engine.test.ts
```

## Integration Notes

### With CRM Web Application
- Use `getEstimationBreakdown()` for customer quotes
- Integrate with pricing engine for complete job estimates
- Store estimation data with customer records

### With CRM Mobile Application  
- Use `calculateQuickEstimation()` for field estimates
- Offline calculation capabilities
- Sync estimation data when online

### With Crew Mobile Application
- Access box breakdowns for packing guidance
- Time estimates for job planning
- Material requirements for truck loading

### With Marketing Website
- Quick estimates for lead generation
- Cost calculators for customer engagement
- Service tier comparisons

## Performance Considerations

- All calculations run synchronously and complete in <10ms
- Configuration loaded once at startup
- No external dependencies for core calculations
- Memory efficient with minimal object allocation

## License

MIT License - See LICENSE file for details.

---

**Next Steps**: 
1. Run comprehensive tests: `npm test`
2. Integrate with existing pricing engine
3. Deploy across all 4 applications
4. Monitor performance and accuracy in production