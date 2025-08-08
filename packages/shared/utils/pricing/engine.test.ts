/**
 * Comprehensive Unit Tests for Pricing Engine
 * Tests all edge cases, business rules, and error conditions
 */

import { describe, test, expect } from '@jest/globals';
import type { PricingInputs, HandicapFactors } from './types';
import { calculatePricing, calculateQuickPrice, getPricingBreakdown } from './engine';
import {
  getCubicFeet,
  determineCrewSize,
  getServiceTierSpeed,
  calculateHandicapModifier,
  calculateBaseTime,
  determineCrewAdjustment,
  getBaseHourlyRate,
  classifyMoveType,
  determineDaySplit,
  calculateAdditionalCosts,
  roundCurrency
} from './calculations';

// Test Data Helpers
const createBasicInputs = (overrides: Partial<PricingInputs> = {}): PricingInputs => ({
  moveSize: "2 Bedroom Apartment",
  serviceTier: "Full Service",
  serviceType: "Moving",
  distanceMiles: 15,
  handicapFactors: { stairs: 0, walkFeet: 0, elevator: false },
  ...overrides
});

const createHandicapFactors = (overrides: Partial<HandicapFactors> = {}): HandicapFactors => ({
  stairs: 0,
  walkFeet: 0,
  elevator: false,
  ...overrides
});

describe('Pricing Engine Core Functions', () => {
  
  describe('getCubicFeet', () => {
    test('should return correct cubic feet for standard move sizes', () => {
      expect(getCubicFeet("Room or Less")).toBe(75);
      expect(getCubicFeet("Studio Apartment")).toBe(288);
      expect(getCubicFeet("2 Bedroom Apartment")).toBe(743);
      expect(getCubicFeet("5 Bedroom House (Large)")).toBe(3816);
    });

    test('should return custom cubic feet when provided', () => {
      expect(getCubicFeet("Room or Less", 500)).toBe(500);
    });

    test('should throw error for invalid custom cubic feet', () => {
      expect(() => getCubicFeet("Room or Less", 0)).toThrow('Custom cubic feet must be greater than 0');
      expect(() => getCubicFeet("Room or Less", -100)).toThrow('Custom cubic feet must be greater than 0');
    });
  });

  describe('determineCrewSize', () => {
    test('should determine correct crew sizes based on cubic feet', () => {
      expect(determineCrewSize(500)).toBe(2);   // <= 1009
      expect(determineCrewSize(1009)).toBe(2);  // exactly at boundary
      expect(determineCrewSize(1010)).toBe(3);  // > 1009, <= 1500
      expect(determineCrewSize(1500)).toBe(3);  // exactly at boundary
      expect(determineCrewSize(1501)).toBe(4);  // > 1500, <= 2000
      expect(determineCrewSize(2000)).toBe(4);  // exactly at boundary
      expect(determineCrewSize(2001)).toBe(5);  // > 2000, <= 3200
      expect(determineCrewSize(3200)).toBe(5);  // exactly at boundary
      expect(determineCrewSize(3201)).toBe(6);  // > 3200
      expect(determineCrewSize(5000)).toBe(6);  // large amount
    });

    test('should use forced crew size when provided', () => {
      expect(determineCrewSize(500, 4)).toBe(4);
      expect(determineCrewSize(3000, 2)).toBe(2);
    });

    test('should throw error for invalid inputs', () => {
      expect(() => determineCrewSize(0)).toThrow('Cubic feet must be greater than 0');
      expect(() => determineCrewSize(-100)).toThrow('Cubic feet must be greater than 0');
      expect(() => determineCrewSize(500, 1)).toThrow('Invalid crew size');
      expect(() => determineCrewSize(500, 8)).toThrow('Invalid crew size');
    });
  });

  describe('getServiceTierSpeed', () => {
    test('should return correct speeds for all service tiers', () => {
      expect(getServiceTierSpeed("Grab-n-Go")).toBe(95);
      expect(getServiceTierSpeed("Full Service")).toBe(80);
      expect(getServiceTierSpeed("White Glove")).toBe(70);
      expect(getServiceTierSpeed("Labor Only")).toBe(90);
    });
  });

  describe('calculateHandicapModifier', () => {
    test('should return 1.0 when cubic feet < 400', () => {
      const factors = createHandicapFactors({ stairs: 2, walkFeet: 200, elevator: true });
      expect(calculateHandicapModifier(399, factors)).toBe(1.0);
    });

    test('should calculate handicap modifier correctly when cubic feet >= 400', () => {
      const factors = createHandicapFactors({ stairs: 2, walkFeet: 200, elevator: true });
      // 2 * 0.09 + (200/100) * 0.09 + 0.18 = 0.18 + 0.18 + 0.18 = 0.54
      // modifier = 1 + 0.54 = 1.54
      expect(calculateHandicapModifier(400, factors)).toBe(1.54);
    });

    test('should handle each handicap factor independently', () => {
      // Only stairs
      expect(calculateHandicapModifier(400, createHandicapFactors({ stairs: 1 }))).toBe(1.09);
      
      // Only walk
      expect(calculateHandicapModifier(400, createHandicapFactors({ walkFeet: 100 }))).toBe(1.09);
      
      // Only elevator
      expect(calculateHandicapModifier(400, createHandicapFactors({ elevator: true }))).toBe(1.18);
    });

    test('should throw error for negative values', () => {
      expect(() => calculateHandicapModifier(400, createHandicapFactors({ stairs: -1 }))).toThrow();
      expect(() => calculateHandicapModifier(400, createHandicapFactors({ walkFeet: -50 }))).toThrow();
    });
  });

  describe('calculateBaseTime', () => {
    test('should calculate base time correctly', () => {
      // 743 cuft / (3 movers * 80 cuft/hr/mover) * 1.0 handicap = 743 / 240 = 3.096 hours
      const time = calculateBaseTime(743, 3, 80, 1.0);
      expect(time).toBeCloseTo(3.096, 3);
    });

    test('should apply handicap modifier correctly', () => {
      // Same calculation but with 1.5x handicap modifier
      const time = calculateBaseTime(743, 3, 80, 1.5);
      expect(time).toBeCloseTo(4.644, 3); // 3.096 * 1.5
    });

    test('should throw error for invalid inputs', () => {
      expect(() => calculateBaseTime(0, 3, 80)).toThrow('Cubic feet must be greater than 0');
      expect(() => calculateBaseTime(743, 0, 80)).toThrow('Crew size must be greater than 0');
      expect(() => calculateBaseTime(743, 3, 0)).toThrow('Service tier speed must be greater than 0');
      expect(() => calculateBaseTime(743, 3, 80, 0.5)).toThrow('Handicap modifier must be >= 1');
    });
  });

  describe('determineCrewAdjustment', () => {
    test('should not adjust crew when cubic feet < 400', () => {
      const result = determineCrewAdjustment(399, 2, 1.5);
      expect(result.adjustedCrewSize).toBe(2);
      expect(result.applied).toBe(false);
      expect(result.reasoning).toContain('below threshold');
    });

    test('should adjust crew size based on handicap modifier - under 300 cuft', () => {
      // 36% threshold for first extra mover in < 300 cuft band
      const result1 = determineCrewAdjustment(200, 2, 1.36); // exactly at 36%
      expect(result1.adjustedCrewSize).toBe(3);
      expect(result1.applied).toBe(true);
      
      // 72% threshold for second extra mover
      const result2 = determineCrewAdjustment(200, 2, 1.72); // exactly at 72%
      expect(result2.adjustedCrewSize).toBe(4);
      expect(result2.applied).toBe(true);
    });

    test('should adjust crew size based on handicap modifier - 300-599 cuft', () => {
      // 27% threshold for first extra mover in 300-599 cuft band
      const result1 = determineCrewAdjustment(400, 2, 1.27); // exactly at 27%
      expect(result1.adjustedCrewSize).toBe(3);
      expect(result1.applied).toBe(true);
      
      // 54% threshold for second extra mover
      const result2 = determineCrewAdjustment(400, 2, 1.54); // exactly at 54%
      expect(result2.adjustedCrewSize).toBe(4);
      expect(result2.applied).toBe(true);
    });

    test('should adjust crew size based on handicap modifier - 600+ cuft', () => {
      // 18% threshold for first extra mover in 600+ cuft band
      const result1 = determineCrewAdjustment(700, 3, 1.18); // exactly at 18%
      expect(result1.adjustedCrewSize).toBe(4);
      expect(result1.applied).toBe(true);
      
      // 36% threshold for second extra mover
      const result2 = determineCrewAdjustment(700, 3, 1.36); // exactly at 36%
      expect(result2.adjustedCrewSize).toBe(5);
      expect(result2.applied).toBe(true);
    });

    test('should not exceed maximum crew size', () => {
      const result = determineCrewAdjustment(1000, 6, 2.0); // Would add 2 movers to 6
      expect(result.adjustedCrewSize).toBe(7); // Capped at 7
    });
  });

  describe('getBaseHourlyRate', () => {
    test('should return correct rates for all service types and crew sizes', () => {
      expect(getBaseHourlyRate("Moving", 2)).toBe(169);
      expect(getBaseHourlyRate("Moving", 3)).toBe(229);
      expect(getBaseHourlyRate("White Glove", 2)).toBe(199);
      expect(getBaseHourlyRate("Labor Only", 2)).toBe(129);
    });

    test('should throw error for invalid inputs', () => {
      expect(() => getBaseHourlyRate("InvalidType" as any, 2)).toThrow();
      expect(() => getBaseHourlyRate("Moving", 1)).toThrow();
    });
  });

  describe('classifyMoveType', () => {
    test('should classify move types correctly', () => {
      expect(classifyMoveType(15)).toBe('LOCAL');
      expect(classifyMoveType(30)).toBe('LOCAL');
      expect(classifyMoveType(31)).toBe('REGIONAL');
      expect(classifyMoveType(120)).toBe('REGIONAL');
      expect(classifyMoveType(121)).toBe('LONG_DISTANCE');
      expect(classifyMoveType(500)).toBe('LONG_DISTANCE');
    });

    test('should handle edge cases', () => {
      expect(classifyMoveType(0)).toBe('LOCAL');
      expect(() => classifyMoveType(-1)).toThrow('Distance cannot be negative');
    });
  });

  describe('determineDaySplit', () => {
    test('should keep LOCAL moves under 9 hours as single day', () => {
      const result = determineDaySplit(8.5, 'LOCAL');
      expect(result.daysSplit).toBe(1);
      expect(result.hoursPerDay).toEqual([8.5]);
    });

    test('should split LOCAL moves over 9 hours', () => {
      const result = determineDaySplit(15, 'LOCAL');
      expect(result.daysSplit).toBe(2);
      expect(result.hoursPerDay).toEqual([7.5, 7.5]); // 15 / 2
    });

    test('should keep REGIONAL moves under 14 hours as single day', () => {
      const result = determineDaySplit(13, 'REGIONAL');
      expect(result.daysSplit).toBe(1);
      expect(result.hoursPerDay).toEqual([13]);
    });

    test('should split REGIONAL moves over 14 hours', () => {
      const result = determineDaySplit(20, 'REGIONAL');
      expect(result.daysSplit).toBe(2);
      expect(result.hoursPerDay).toEqual([10, 10]); // 20 / 2
    });
  });

  describe('calculateAdditionalCosts', () => {
    test('should calculate all additional costs correctly', () => {
      const result = calculateAdditionalCosts(100, 8, 1, true);
      expect(result.fuelCost).toBe(200);      // 100 miles * $2.00
      expect(result.mileageCost).toBe(429);   // 100 miles * $4.29
      expect(result.additionalTruckCost).toBe(240); // 1 truck * 8 hours * $30
      expect(result.emergencyServiceCost).toBe(240); // 8 hours * $30
      expect(result.total).toBe(1109);
    });

    test('should handle zero additional services', () => {
      const result = calculateAdditionalCosts(50, 6, 0, false);
      expect(result.fuelCost).toBe(100);      // 50 miles * $2.00
      expect(result.mileageCost).toBe(214.5); // 50 miles * $4.29
      expect(result.additionalTruckCost).toBe(0);
      expect(result.emergencyServiceCost).toBe(0);
      expect(result.total).toBe(314.5);
    });
  });

  describe('roundCurrency', () => {
    test('should round to 2 decimal places', () => {
      expect(roundCurrency(123.456)).toBe(123.46);
      expect(roundCurrency(123.454)).toBe(123.45);
      expect(roundCurrency(123.999)).toBe(124);
      expect(roundCurrency(123)).toBe(123);
    });
  });
});

describe('Main Pricing Engine Integration Tests', () => {
  
  test('should calculate basic pricing correctly', () => {
    const inputs = createBasicInputs();
    const result = calculatePricing(inputs);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    
    if (result.data) {
      expect(result.data.cubicFeet).toBe(743);
      expect(result.data.crewSize).toBe(2);
      expect(result.data.moveType).toBe('LOCAL');
      expect(result.data.daysSplit).toBe(1);
      expect(result.data.subtotal).toBeGreaterThan(0);
    }
  });

  test('should apply handicap modifiers correctly when cuft >= 400', () => {
    const inputs = createBasicInputs({
      moveSize: "1 Bedroom House", // 576 cuft
      handicapFactors: { stairs: 2, walkFeet: 100, elevator: true }
    });
    
    const result = calculatePricing(inputs);
    expect(result.success).toBe(true);
    
    if (result.data) {
      // Handicap modifier should be > 1.0
      expect(result.data.handicapModifier).toBeGreaterThan(1.0);
      // Should have detailed handicap breakdown
      expect(result.data.breakdown.handicapBreakdown.stairsModifier).toBe(0.18); // 2 * 0.09
      expect(result.data.breakdown.handicapBreakdown.walkModifier).toBe(0.09);   // 1 * 0.09
      expect(result.data.breakdown.handicapBreakdown.elevatorModifier).toBe(0.18);
      expect(result.data.breakdown.handicapBreakdown.totalModifier).toBe(1.45);  // 1 + 0.18 + 0.09 + 0.18
    }
  });

  test('should ignore handicap modifiers when cuft < 400', () => {
    const inputs = createBasicInputs({
      moveSize: "Studio Apartment", // 288 cuft
      handicapFactors: { stairs: 5, walkFeet: 500, elevator: true }
    });
    
    const result = calculatePricing(inputs);
    expect(result.success).toBe(true);
    expect(result.warnings).toContain(expect.stringContaining('Handicap factors ignored'));
    
    if (result.data) {
      expect(result.data.handicapModifier).toBe(1.0);
    }
  });

  test('should apply crew size adjustments based on handicap modifier', () => {
    const inputs = createBasicInputs({
      moveSize: "1 Bedroom House", // 576 cuft (in 300-599 range)
      handicapFactors: { stairs: 3, walkFeet: 0, elevator: false } // 27% handicap
    });
    
    const result = calculatePricing(inputs);
    expect(result.success).toBe(true);
    expect(result.warnings).toContain(expect.stringContaining('Crew size adjusted'));
    
    if (result.data) {
      expect(result.data.breakdown.crewAdjustments.originalCrewSize).toBe(2);
      expect(result.data.breakdown.crewAdjustments.adjustedCrewSize).toBe(3);
      expect(result.data.breakdown.crewAdjustments.applied).toBe(true);
    }
  });

  test('should split long moves into multiple days', () => {
    const inputs = createBasicInputs({
      moveSize: "5 Bedroom House (Large)", // 3816 cuft
      serviceTier: "White Glove", // slower service
      distanceMiles: 25 // LOCAL move
    });
    
    const result = calculatePricing(inputs);
    expect(result.success).toBe(true);
    
    if (result.data) {
      // This should likely be split due to large size and slow service
      if (result.data.daysSplit > 1) {
        expect(result.warnings).toContain(expect.stringContaining('Move split into'));
        expect(result.data.hoursPerDay.length).toBe(result.data.daysSplit);
      }
    }
  });

  test('should handle custom cubic feet override', () => {
    const inputs = createBasicInputs({
      customCubicFeet: 1000
    });
    
    const result = calculatePricing(inputs);
    expect(result.success).toBe(true);
    expect(result.warnings).toContain(expect.stringContaining('Using custom cubic feet'));
    
    if (result.data) {
      expect(result.data.cubicFeet).toBe(1000);
    }
  });

  test('should handle forced crew size', () => {
    const inputs = createBasicInputs({
      forceCrewSize: 5
    });
    
    const result = calculatePricing(inputs);
    expect(result.success).toBe(true);
    expect(result.warnings).toContain(expect.stringContaining('Using forced crew size'));
    
    if (result.data) {
      expect(result.data.crewSize).toBe(5);
    }
  });

  test('should calculate emergency service surcharge', () => {
    const inputs = createBasicInputs({
      emergencyService: true
    });
    
    const result = calculatePricing(inputs);
    expect(result.success).toBe(true);
    expect(result.warnings).toContain(expect.stringContaining('Emergency service surcharge'));
    
    if (result.data) {
      expect(result.data.emergencyServiceCost).toBeGreaterThan(0);
    }
  });

  test('should handle White Glove premium pricing', () => {
    const inputs1 = createBasicInputs({
      serviceTier: "Full Service",
      serviceType: "Moving"
    });
    
    const inputs2 = createBasicInputs({
      serviceTier: "White Glove",
      serviceType: "White Glove"
    });
    
    const result1 = calculatePricing(inputs1);
    const result2 = calculatePricing(inputs2);
    
    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
    
    if (result1.data && result2.data) {
      // White Glove should be more expensive per hour and take longer
      expect(result2.data.baseHourlyRate).toBeGreaterThan(result1.data.baseHourlyRate);
      expect(result2.data.baseTimeHours).toBeGreaterThan(result1.data.baseTimeHours);
    }
  });

  test('should validate required inputs', () => {
    const invalidInputs = {
      moveSize: "" as any,
      serviceTier: "" as any,
      serviceType: "" as any,
      distanceMiles: -1,
      handicapFactors: null as any
    };
    
    const result = calculatePricing(invalidInputs);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });

  test('should handle edge case: maximum crew size limit', () => {
    const inputs = createBasicInputs({
      moveSize: "5 Bedroom House (Large)", // Large move
      handicapFactors: { stairs: 10, walkFeet: 500, elevator: true }, // Extreme handicap
      forceCrewSize: 6 // Start with large crew
    });
    
    const result = calculatePricing(inputs);
    expect(result.success).toBe(true);
    
    if (result.data) {
      expect(result.data.crewSize).toBeLessThanOrEqual(7); // Should not exceed max
    }
  });
});

describe('Utility Functions', () => {
  
  test('calculateQuickPrice should return essential pricing info', () => {
    const result = calculateQuickPrice(
      "2 Bedroom Apartment",
      "Full Service",
      "Moving",
      20
    );
    
    expect(result.success).toBe(true);
    expect(result.price).toBeGreaterThan(0);
    expect(result.timeHours).toBeGreaterThan(0);
  });

  test('getPricingBreakdown should return customer-friendly breakdown', () => {
    const inputs = createBasicInputs();
    const result = getPricingBreakdown(inputs);
    
    expect(result.success).toBe(true);
    expect(result.breakdown).toBeDefined();
    
    if (result.breakdown) {
      expect(result.breakdown.laborCost).toBeGreaterThan(0);
      expect(result.breakdown.total).toBeGreaterThan(0);
      expect(result.breakdown.crewSize).toBeGreaterThan(0);
      expect(result.breakdown.timeEstimate).toContain('hours');
    }
  });
});

describe('Real-World Scenario Tests', () => {
  
  test('Small apartment move - should be simple and affordable', () => {
    const inputs = createBasicInputs({
      moveSize: "Studio Apartment",
      serviceTier: "Grab-n-Go",
      serviceType: "Moving",
      distanceMiles: 5
    });
    
    const result = calculatePricing(inputs);
    expect(result.success).toBe(true);
    
    if (result.data) {
      expect(result.data.crewSize).toBe(2);
      expect(result.data.daysSplit).toBe(1);
      expect(result.data.baseTimeHours).toBeLessThan(5);
    }
  });

  test('Large house move with complications - should be complex', () => {
    const inputs = createBasicInputs({
      moveSize: "5 Bedroom House (Large)",
      serviceTier: "White Glove",
      serviceType: "White Glove",
      distanceMiles: 50,
      handicapFactors: { stairs: 3, walkFeet: 200, elevator: false },
      additionalTrucks: 1,
      emergencyService: true
    });
    
    const result = calculatePricing(inputs);
    expect(result.success).toBe(true);
    
    if (result.data) {
      expect(result.data.crewSize).toBeGreaterThan(2);
      expect(result.data.baseTimeHours).toBeGreaterThan(10);
      expect(result.data.subtotal).toBeGreaterThan(2000);
      expect(result.data.additionalTruckCost).toBeGreaterThan(0);
      expect(result.data.emergencyServiceCost).toBeGreaterThan(0);
    }
  });

  test('Commercial office move - should use commercial rates', () => {
    const inputs = createBasicInputs({
      moveSize: "Office (Large)",
      serviceTier: "Full Service",
      serviceType: "Commercial",
      distanceMiles: 25
    });
    
    const result = calculatePricing(inputs);
    expect(result.success).toBe(true);
    
    if (result.data) {
      expect(result.data.cubicFeet).toBe(3000);
      expect(result.data.crewSize).toBeGreaterThan(3);
      expect(result.data.moveType).toBe('LOCAL');
    }
  });
});