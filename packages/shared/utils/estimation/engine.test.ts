/**
 * Comprehensive Unit Tests for Box Estimation System
 * Tests all scenarios including edge cases and integration points
 */

import {
  calculateComprehensiveEstimation,
  calculateQuickEstimation,
  getEstimationBreakdown,
  EstimationPricingAdapter,
  getPricingIntegrationData,
  validateEstimationConfiguration,
  getEstimationSystemMetrics
} from './engine';

import {
  calculateBoxEstimation,
  calculateTimeEstimation,
  calculateMaterialCosts,
  getRecommendedCrewSize,
  getServiceComplexityModifier,
  getTotalBoxCount,
  validateEstimationInputs
} from './calculations';

import type {
  EstimationInputs,
  BoxEstimationResult,
  ComprehensiveEstimationResult,
  PropertyType,
  PackingIntensity
} from './types';

describe('Box Estimation System', () => {

  // Test Basic Box Calculations
  describe('calculateBoxEstimation', () => {
    
    test('should calculate correct boxes for 2-bedroom apartment', () => {
      const inputs: EstimationInputs = {
        propertyType: "Apartment",
        bedrooms: 2,
        packingIntensity: "Normal"
      };

      const result = calculateBoxEstimation(inputs);
      
      expect(result.estimationType).toBe("Dynamic");
      expect(result.packingIntensityApplied).toBe(1.0);
      expect(result.roomCount["Bedroom"]).toBe(2);
      expect(result.roomCount["Living Room"]).toBe(1);
      expect(result.roomCount["Kitchen"]).toBe(1);
      
      // Verify total calculation: 2 bedrooms + living room + kitchen
      // Bedroom: (4+6+2+2+1+1+1) * 2 = 34
      // Living Room: 3+5+3+1+1+0+1 = 14
      // Kitchen: 4+6+2+0+3+0+0 = 15
      // Total: 63 boxes
      const totalBoxes = getTotalBoxCount(result.totalBoxes);
      expect(totalBoxes).toBe(63);
    });

    test('should handle packing intensity multipliers correctly', () => {
      const normalInputs: EstimationInputs = {
        propertyType: "Apartment",
        bedrooms: 1,
        packingIntensity: "Normal"
      };
      
      const lessInputs: EstimationInputs = {
        ...normalInputs,
        packingIntensity: "Less than Normal"
      };
      
      const moreInputs: EstimationInputs = {
        ...normalInputs,
        packingIntensity: "More than Normal"
      };

      const normalResult = calculateBoxEstimation(normalInputs);
      const lessResult = calculateBoxEstimation(lessInputs);
      const moreResult = calculateBoxEstimation(moreInputs);

      const normalCount = getTotalBoxCount(normalResult.totalBoxes);
      const lessCount = getTotalBoxCount(lessResult.totalBoxes);
      const moreCount = getTotalBoxCount(moreResult.totalBoxes);

      expect(lessResult.packingIntensityApplied).toBe(0.75);
      expect(moreResult.packingIntensityApplied).toBe(1.5);
      
      // Less than normal should have fewer boxes
      expect(lessCount).toBeLessThan(normalCount);
      // More than normal should have more boxes  
      expect(moreCount).toBeGreaterThan(normalCount);
    });

    test('should handle fixed estimates correctly', () => {
      const inputs: EstimationInputs = {
        fixedEstimateType: "Studio Apartment",
        packingIntensity: "Normal"
      };

      const result = calculateBoxEstimation(inputs);
      
      expect(result.estimationType).toBe("Fixed");
      expect(Object.keys(result.roomBreakdown)).toHaveLength(0);
      expect(Object.keys(result.roomCount)).toHaveLength(0);
      
      // Studio should have predefined box counts
      expect(result.totalBoxes.Small).toBe(8);
      expect(result.totalBoxes.Medium).toBe(12);
      expect(result.totalBoxes.Large).toBe(6);
    });

    test('should handle custom room overrides', () => {
      const inputs: EstimationInputs = {
        propertyType: "Normal Home",
        bedrooms: 2,
        packingIntensity: "Normal",
        customRooms: {
          "Office": 2,  // Add 2 offices
          "Garage": 0   // Remove garage
        }
      };

      const result = calculateBoxEstimation(inputs);
      
      expect(result.roomCount["Office"]).toBe(2);
      expect(result.roomCount["Garage"]).toBe(0);
      expect(result.roomCount["Bedroom"]).toBe(2);
      
      // Should have office boxes but no garage boxes
      const officeAllocation = result.roomBreakdown["Office"];
      expect(officeAllocation).toBeDefined();
    });

    test('should validate bedroom limits for property types', () => {
      const apartmentInputs: EstimationInputs = {
        propertyType: "Apartment",
        bedrooms: 0, // Valid for apartments
        packingIntensity: "Normal"
      };

      const normalHomeInputs: EstimationInputs = {
        propertyType: "Normal Home", 
        bedrooms: 0, // Invalid for normal homes (min 1)
        packingIntensity: "Normal"
      };

      const errors1 = validateEstimationInputs(apartmentInputs);
      const errors2 = validateEstimationInputs(normalHomeInputs);
      
      expect(errors1).toHaveLength(0);
      expect(errors2).toHaveLength(1);
      expect(errors2[0].code).toBe("INVALID_BEDROOM_COUNT");
    });
  });

  // Test Time Calculations
  describe('calculateTimeEstimation', () => {
    
    test('should calculate packing and unpacking times correctly', () => {
      const boxEstimation: BoxEstimationResult = {
        totalBoxes: {
          Small: 10,
          Medium: 15,
          Large: 5,
          Wardrobe: 2,
          "Dish Pack": 3,
          "Mattress Bag": 1,
          "TV Box": 1
        },
        roomBreakdown: {
          "Bedroom": {
            Small: 4, Medium: 6, Large: 2, Wardrobe: 2,
            "Dish Pack": 1, "Mattress Bag": 1, "TV Box": 1
          }
        },
        packingIntensityApplied: 1.0,
        roomCount: { "Bedroom": 1 },
        estimationType: "Dynamic"
      };

      const timeResult = calculateTimeEstimation(boxEstimation, 3, false);

      expect(timeResult.workersRequired).toBe(3);
      expect(timeResult.packingTime.totalMinutes).toBeGreaterThan(0);
      expect(timeResult.unpackingTime.totalMinutes).toBeGreaterThan(0);
      
      // Packing should take longer than unpacking for most box types
      expect(timeResult.packingTime.totalMinutes).toBeGreaterThan(timeResult.unpackingTime.totalMinutes);
    });

    test('should apply white glove service modifier correctly', () => {
      const boxEstimation: BoxEstimationResult = {
        totalBoxes: {
          Small: 10, Medium: 10, Large: 10, Wardrobe: 0,
          "Dish Pack": 0, "Mattress Bag": 0, "TV Box": 0
        },
        roomBreakdown: {},
        packingIntensityApplied: 1.0,
        roomCount: { "Living Room": 1 },
        estimationType: "Dynamic"
      };

      const normalTime = calculateTimeEstimation(boxEstimation, 3, false);
      const whiteGloveTime = calculateTimeEstimation(boxEstimation, 3, true);

      expect(whiteGloveTime.packingTime.whiteGloveModifier).toBe(0.20);
      expect(whiteGloveTime.packingTime.totalMinutes).toBeGreaterThan(normalTime.packingTime.totalMinutes);
      expect(whiteGloveTime.unpackingTime.totalMinutes).toBeGreaterThan(normalTime.unpackingTime.totalMinutes);
    });

    test('should include room penalty in time calculations', () => {
      const singleRoomEstimation: BoxEstimationResult = {
        totalBoxes: {
          Small: 10, Medium: 0, Large: 0, Wardrobe: 0,
          "Dish Pack": 0, "Mattress Bag": 0, "TV Box": 0
        },
        roomBreakdown: {},
        packingIntensityApplied: 1.0,
        roomCount: { "Living Room": 1 },
        estimationType: "Dynamic"
      };

      const multiRoomEstimation: BoxEstimationResult = {
        totalBoxes: {
          Small: 10, Medium: 0, Large: 0, Wardrobe: 0,
          "Dish Pack": 0, "Mattress Bag": 0, "TV Box": 0
        },
        roomBreakdown: {},
        packingIntensityApplied: 1.0,
        roomCount: { "Living Room": 1, "Kitchen": 1, "Bedroom": 2 }, // 4 rooms total
        estimationType: "Dynamic"
      };

      const singleTime = calculateTimeEstimation(singleRoomEstimation, 2, false);
      const multiTime = calculateTimeEstimation(multiRoomEstimation, 2, false);

      // Multi-room should take longer due to room penalties
      expect(multiTime.packingTime.roomPenalty).toBeGreaterThan(singleTime.packingTime.roomPenalty);
      expect(multiTime.packingTime.totalMinutes).toBeGreaterThan(singleTime.packingTime.totalMinutes);
    });
  });

  // Test Material Cost Calculations
  describe('calculateMaterialCosts', () => {
    
    test('should calculate material costs correctly', () => {
      const boxEstimation: BoxEstimationResult = {
        totalBoxes: {
          Small: 5,      // 5 * $1.85 = $9.25
          Medium: 3,     // 3 * $2.66 = $7.98
          Large: 2,      // 2 * $3.33 = $6.66
          Wardrobe: 1,   // 1 * $29.03 = $29.03
          "Dish Pack": 1, // 1 * $10.94 = $10.94
          "Mattress Bag": 1, // 1 * $12.49 = $12.49
          "TV Box": 1    // 1 * $40.49 = $40.49
        },
        roomBreakdown: {},
        packingIntensityApplied: 1.0,
        roomCount: {},
        estimationType: "Dynamic"
      };

      const costResult = calculateMaterialCosts(boxEstimation, true);
      
      expect(costResult.breakdown["Small"]).toBeDefined();
      expect(costResult.breakdown["Small"].quantity).toBe(5);
      expect(costResult.breakdown["Small"].unitCost).toBe(1.85);
      expect(costResult.breakdown["Small"].totalCost).toBe(9.25);
      
      // Should include rental options for TV boxes
      expect(costResult.rentalOptions).toBeDefined();
      expect(costResult.rentalOptions!["TV Box (Large) (Rental)"]).toBeDefined();
      
      // Total cost should sum all items
      const expectedTotal = 9.25 + 7.98 + 6.66 + 29.03 + 10.94 + 12.49 + 40.49;
      expect(costResult.totalCost).toBeCloseTo(expectedTotal, 2);
    });

    test('should handle zero quantities correctly', () => {
      const boxEstimation: BoxEstimationResult = {
        totalBoxes: {
          Small: 5,
          Medium: 0, // Zero quantity
          Large: 0,  // Zero quantity
          Wardrobe: 0,
          "Dish Pack": 0,
          "Mattress Bag": 0,
          "TV Box": 0
        },
        roomBreakdown: {},
        packingIntensityApplied: 1.0,
        roomCount: {},
        estimationType: "Dynamic"
      };

      const costResult = calculateMaterialCosts(boxEstimation, false);
      
      // Should only have Small boxes in breakdown
      expect(Object.keys(costResult.breakdown)).toHaveLength(1);
      expect(costResult.breakdown["Small"]).toBeDefined();
      expect(costResult.rentalOptions).toBeUndefined();
    });
  });

  // Test Crew Size Recommendations
  describe('getRecommendedCrewSize', () => {
    
    test('should recommend appropriate crew sizes', () => {
      // Small job (30 boxes or less)
      const smallJob: BoxEstimationResult = {
        totalBoxes: {
          Small: 20, Medium: 5, Large: 3, Wardrobe: 0,
          "Dish Pack": 1, "Mattress Bag": 1, "TV Box": 0
        },
        roomBreakdown: {},
        packingIntensityApplied: 1.0,
        roomCount: {},
        estimationType: "Dynamic"
      };

      // Large job (over 90 boxes)
      const largeJob: BoxEstimationResult = {
        totalBoxes: {
          Small: 50, Medium: 30, Large: 15, Wardrobe: 5,
          "Dish Pack": 8, "Mattress Bag": 3, "TV Box": 2
        },
        roomBreakdown: {},
        packingIntensityApplied: 1.0,
        roomCount: {},
        estimationType: "Dynamic"
      };

      expect(getRecommendedCrewSize(smallJob)).toBe(2);
      expect(getRecommendedCrewSize(largeJob)).toBeGreaterThanOrEqual(4);
    });
  });

  // Test Input Validation
  describe('validateEstimationInputs', () => {
    
    test('should reject invalid inputs', () => {
      const invalidInputs: EstimationInputs = {
        // Missing both propertyType and fixedEstimateType
        packingIntensity: "Normal"
      };

      const errors = validateEstimationInputs(invalidInputs);
      expect(errors).toHaveLength(1);
      expect(errors[0].code).toBe("MISSING_REQUIRED_INPUTS");
    });

    test('should reject conflicting inputs', () => {
      const conflictingInputs: EstimationInputs = {
        propertyType: "Apartment",
        fixedEstimateType: "Studio Apartment", // Cannot have both
        packingIntensity: "Normal"
      };

      const errors = validateEstimationInputs(conflictingInputs);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.code === "INVALID_PROPERTY_TYPE")).toBe(true);
    });

    test('should validate custom room counts', () => {
      const invalidRoomInputs: EstimationInputs = {
        propertyType: "Normal Home",
        bedrooms: 2,
        packingIntensity: "Normal",
        customRooms: {
          "Office": -1, // Invalid negative count
          "Garage": 15  // Invalid too high count
        }
      };

      const errors = validateEstimationInputs(invalidRoomInputs);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.code === "INVALID_CUSTOM_ROOMS")).toBe(true);
    });
  });

  // Test Comprehensive Engine
  describe('calculateComprehensiveEstimation', () => {
    
    test('should return complete estimation for valid inputs', () => {
      const inputs: EstimationInputs = {
        propertyType: "Normal Home",
        bedrooms: 3,
        packingIntensity: "Normal",
        whiteGloveService: true
      };

      const result = calculateComprehensiveEstimation(inputs);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.boxes).toBeDefined();
      expect(result.data!.time).toBeDefined();
      expect(result.data!.materials).toBeDefined();
      expect(result.data!.generatedAt).toBeInstanceOf(Date);
    });

    test('should generate appropriate warnings', () => {
      const inputs: EstimationInputs = {
        propertyType: "Large Home",
        bedrooms: 5,
        packingIntensity: "More than Normal",
        whiteGloveService: true,
        customRooms: {
          "Office": 3
        }
      };

      const result = calculateComprehensiveEstimation(inputs);
      
      expect(result.success).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings!.length).toBeGreaterThan(0);
      
      // Should warn about packing intensity
      expect(result.warnings!.some(w => w.includes("150%"))).toBe(true);
      // Should warn about custom rooms
      expect(result.warnings!.some(w => w.includes("Custom room"))).toBe(true);
      // Should warn about white glove service
      expect(result.warnings!.some(w => w.includes("White Glove"))).toBe(true);
    });
  });

  // Test Quick Estimation
  describe('calculateQuickEstimation', () => {
    
    test('should provide quick results', () => {
      const result = calculateQuickEstimation("Apartment", 2, "Normal");
      
      expect(result.success).toBe(true);
      expect(result.totalBoxes).toBeGreaterThan(0);
      expect(result.estimatedHours).toBeGreaterThan(0);
      expect(result.materialCost).toBeGreaterThan(0);
      expect(result.crewSize).toBeGreaterThanOrEqual(2);
    });
  });

  // Test Estimation Breakdown
  describe('getEstimationBreakdown', () => {
    
    test('should provide customer-friendly breakdown', () => {
      const inputs: EstimationInputs = {
        propertyType: "Normal Home",
        bedrooms: 2,
        packingIntensity: "Normal"
      };

      const result = getEstimationBreakdown(inputs);
      
      expect(result.success).toBe(true);
      expect(result.breakdown).toBeDefined();
      expect(result.breakdown!.packingSupplies).toBeGreaterThan(0);
      expect(result.breakdown!.crewSize).toBeGreaterThanOrEqual(2);
      expect(result.breakdown!.boxTypes).toBeDefined();
      expect(Object.keys(result.breakdown!.boxTypes).length).toBeGreaterThan(0);
    });
  });

  // Test Pricing Integration
  describe('EstimationPricingAdapter', () => {
    
    test('should convert estimation to pricing inputs', () => {
      const estimation: ComprehensiveEstimationResult = {
        boxes: {
          totalBoxes: {
            Small: 10, Medium: 15, Large: 5, Wardrobe: 2,
            "Dish Pack": 3, "Mattress Bag": 1, "TV Box": 1
          },
          roomBreakdown: {},
          packingIntensityApplied: 1.0,
          roomCount: { "Bedroom": 2 },
          estimationType: "Dynamic"
        },
        time: {
          packingTime: {
            totalMinutes: 240,
            totalHours: 4,
            breakdown: {} as any,
            roomPenalty: 30,
            whiteGloveModifier: 0
          },
          unpackingTime: {
            totalMinutes: 180,
            totalHours: 3,
            breakdown: {} as any,
            roomPenalty: 30,
            whiteGloveModifier: 0
          },
          workersRequired: 3
        },
        materials: {
          totalCost: 150.50,
          breakdown: {}
        },
        inputs: {
          propertyType: "Normal Home",
          bedrooms: 2,
          packingIntensity: "Normal"
        },
        generatedAt: new Date()
      };

      const adapter = new EstimationPricingAdapter();
      const pricingInputs = adapter.convertToPricingInputs(estimation);
      
      expect(pricingInputs.materialCosts).toBe(150.50);
      expect(pricingInputs.packingServiceHours).toBe(7); // 4 + 3 hours
      expect(pricingInputs.crewSizeOverride).toBe(3);
      expect(pricingInputs.serviceComplexityModifier).toBeGreaterThan(0);
    });

    test('should calculate appropriate service modifiers', () => {
      const normalEstimation: ComprehensiveEstimationResult = {
        boxes: {
          totalBoxes: { Small: 20, Medium: 10, Large: 5, Wardrobe: 0, "Dish Pack": 2, "Mattress Bag": 1, "TV Box": 0 },
          roomBreakdown: {},
          packingIntensityApplied: 1.0,
          roomCount: {},
          estimationType: "Dynamic"
        },
        time: { packingTime: { totalMinutes: 120, totalHours: 2, breakdown: {} as any, roomPenalty: 0, whiteGloveModifier: 0 }, 
               unpackingTime: { totalMinutes: 90, totalHours: 1.5, breakdown: {} as any, roomPenalty: 0, whiteGloveModifier: 0 },
               workersRequired: 2 },
        materials: { totalCost: 100, breakdown: {} },
        inputs: { propertyType: "Apartment", bedrooms: 1, packingIntensity: "Normal" },
        generatedAt: new Date()
      };

      const complexEstimation: ComprehensiveEstimationResult = {
        ...normalEstimation,
        boxes: {
          ...normalEstimation.boxes,
          totalBoxes: { Small: 80, Medium: 60, Large: 30, Wardrobe: 10, "Dish Pack": 15, "Mattress Bag": 5, "TV Box": 3 } // 203 total boxes
        },
        inputs: {
          propertyType: "Large Home",
          bedrooms: 5,
          packingIntensity: "More than Normal",
          whiteGloveService: true
        }
      };

      const adapter = new EstimationPricingAdapter();
      const normalModifier = adapter.calculateServiceModifiers(normalEstimation);
      const complexModifier = adapter.calculateServiceModifiers(complexEstimation);
      
      expect(complexModifier).toBeGreaterThan(normalModifier);
    });
  });

  // Test Configuration Validation
  describe('validateEstimationConfiguration', () => {
    
    test('should validate configuration successfully', () => {
      const validation = validateEstimationConfiguration();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  // Test System Metrics
  describe('getEstimationSystemMetrics', () => {
    
    test('should provide system metrics', () => {
      const metrics = getEstimationSystemMetrics();
      
      expect(metrics.configurationValid).toBe(true);
      expect(metrics.totalPropertyTypes).toBe(3);
      expect(metrics.totalRoomTypes).toBe(8);
      expect(metrics.totalFixedEstimates).toBe(9);
      expect(metrics.materialItemCount).toBeGreaterThan(0);
    });
  });

  // Test Edge Cases
  describe('Edge Cases', () => {
    
    test('should handle zero bedroom apartment', () => {
      const inputs: EstimationInputs = {
        propertyType: "Apartment",
        bedrooms: 0, // Studio-like apartment
        packingIntensity: "Normal"
      };

      const result = calculateComprehensiveEstimation(inputs);
      expect(result.success).toBe(true);
      expect(result.data!.boxes.roomCount["Bedroom"]).toBeUndefined();
    });

    test('should handle maximum bedroom count', () => {
      const inputs: EstimationInputs = {
        propertyType: "Large Home",
        bedrooms: 5, // Maximum
        packingIntensity: "More than Normal"
      };

      const result = calculateComprehensiveEstimation(inputs);
      expect(result.success).toBe(true);
      expect(result.data!.boxes.roomCount["Bedroom"]).toBe(5);
    });

    test('should handle very high packing intensity impact', () => {
      const inputs: EstimationInputs = {
        propertyType: "Large Home",
        bedrooms: 5,
        packingIntensity: "More than Normal"
      };

      const result = calculateComprehensiveEstimation(inputs);
      expect(result.success).toBe(true);
      
      const totalBoxes = getTotalBoxCount(result.data!.boxes.totalBoxes);
      expect(totalBoxes).toBeGreaterThan(100); // Should be quite high
    });
  });
});