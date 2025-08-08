/**
 * Box Estimation System Examples
 * Demonstrates various use cases and integration patterns
 */

import {
  calculateComprehensiveEstimation,
  calculateQuickEstimation,
  getEstimationBreakdown,
  EstimationUtils,
  CommonEstimationScenarios,
  PricingIntegration
} from './index';

import type { EstimationInputs, ComprehensiveEstimationResult } from './types';

// Example 1: Basic Residential Move Estimation
export function example1_BasicResidentialMove() {
  console.log('📋 Example 1: Basic 3-Bedroom House Move\n');
  
  const inputs: EstimationInputs = {
    propertyType: "Normal Home",
    bedrooms: 3,
    packingIntensity: "Normal"
  };

  const result = calculateComprehensiveEstimation(inputs);
  
  if (result.success && result.data) {
    const data = result.data;
    const totalBoxes = EstimationUtils.getTotalBoxes(data.boxes.totalBoxes);
    const totalTime = data.time.packingTime.totalHours + data.time.unpackingTime.totalHours;
    
    console.log(`🏠 Property: ${inputs.propertyType} with ${inputs.bedrooms} bedrooms`);
    console.log(`📦 Total Boxes: ${totalBoxes}`);
    console.log(`⏱️  Estimated Time: ${totalTime.toFixed(1)} hours`);
    console.log(`👥 Recommended Crew: ${data.time.workersRequired} workers`);
    console.log(`💰 Material Cost: $${data.materials.totalCost.toFixed(2)}\n`);
    
    // Show room breakdown
    console.log('📋 Room Breakdown:');
    Object.entries(data.boxes.roomCount).forEach(([room, count]) => {
      console.log(`   ${room}: ${count} room(s)`);
    });
    
    console.log('\n📦 Box Types Needed:');
    Object.entries(data.boxes.totalBoxes).forEach(([type, count]) => {
      if (count > 0) {
        console.log(`   ${type}: ${count} boxes`);
      }
    });
  }
  
  return result;
}

// Example 2: Luxury Move with White Glove Service
export function example2_LuxuryWhiteGloveMove() {
  console.log('\n✨ Example 2: Luxury 5-Bedroom Estate with White Glove Service\n');
  
  const inputs: EstimationInputs = {
    propertyType: "Large Home",
    bedrooms: 5,
    packingIntensity: "More than Normal",
    whiteGloveService: true,
    customRooms: {
      "Office": 2, // Home has 2 offices
      "Attic/Basement": 2 // Finished basement + attic storage
    }
  };

  const result = calculateComprehensiveEstimation(inputs);
  
  if (result.success && result.data) {
    const data = result.data;
    const totalBoxes = EstimationUtils.getTotalBoxes(data.boxes.totalBoxes);
    const totalTime = data.time.packingTime.totalHours + data.time.unpackingTime.totalHours;
    
    console.log(`🏰 Property: Luxury ${inputs.propertyType} with ${inputs.bedrooms} bedrooms`);
    console.log(`⭐ Service: White Glove (+${(data.time.packingTime.whiteGloveModifier * 100).toFixed(0)}% time)`);
    console.log(`📈 Intensity: ${inputs.packingIntensity} (${data.boxes.packingIntensityApplied}x multiplier)`);
    console.log(`📦 Total Boxes: ${totalBoxes}`);
    console.log(`⏱️  Estimated Time: ${totalTime.toFixed(1)} hours`);
    console.log(`👥 Recommended Crew: ${data.time.workersRequired} workers`);
    console.log(`💰 Material Cost: $${data.materials.totalCost.toFixed(2)}\n`);
    
    // Show custom rooms impact
    console.log('🏠 Custom Room Configuration:');
    Object.entries(data.boxes.roomCount).forEach(([room, count]) => {
      const isCustom = inputs.customRooms?.[room as any] !== undefined;
      console.log(`   ${room}: ${count} room(s)${isCustom ? ' (custom)' : ''}`);
    });
    
    // Show warnings
    if (result.warnings?.length) {
      console.log('\n⚠️  Warnings:');
      result.warnings.forEach(warning => console.log(`   • ${warning}`));
    }
  }
  
  return result;
}

// Example 3: Commercial Office Move
export function example3_CommercialOfficeMove() {
  console.log('\n🏢 Example 3: Medium Commercial Office Move\n');
  
  const inputs: EstimationInputs = {
    fixedEstimateType: "Office (Medium)",
    packingIntensity: "Less than Normal" // Well-organized office
  };

  const result = calculateComprehensiveEstimation(inputs);
  
  if (result.success && result.data) {
    const data = result.data;
    const totalBoxes = EstimationUtils.getTotalBoxes(data.boxes.totalBoxes);
    
    console.log(`🏢 Property: ${inputs.fixedEstimateType}`);
    console.log(`📊 Estimate Type: ${data.boxes.estimationType}`);
    console.log(`📈 Packing Intensity: ${inputs.packingIntensity} (${data.boxes.packingIntensityApplied}x)`);
    console.log(`📦 Total Boxes: ${totalBoxes}`);
    console.log(`💰 Material Cost: $${data.materials.totalCost.toFixed(2)}\n`);
    
    // Show material breakdown
    console.log('💳 Material Cost Breakdown:');
    Object.entries(data.materials.breakdown).forEach(([material, info]) => {
      console.log(`   ${material}: ${info.quantity} × $${info.unitCost.toFixed(2)} = $${info.totalCost.toFixed(2)}`);
    });
    
    // Show rental options if available
    if (data.materials.rentalOptions) {
      console.log('\n💡 Rental Options Available:');
      Object.entries(data.materials.rentalOptions).forEach(([material, info]) => {
        console.log(`   ${material}: ${info.quantity} × $${info.unitCost.toFixed(2)} = $${info.totalCost.toFixed(2)}`);
      });
    }
  }
  
  return result;
}

// Example 4: Quick Estimation for Lead Generation
export function example4_QuickEstimationForLeads() {
  console.log('\n⚡ Example 4: Quick Estimations for Multiple Lead Scenarios\n');
  
  const scenarios = [
    { type: "Apartment" as const, bedrooms: 1, intensity: "Normal" as const, label: "1BR Apartment" },
    { type: "Normal Home" as const, bedrooms: 2, intensity: "Normal" as const, label: "2BR House" },
    { type: "Normal Home" as const, bedrooms: 3, intensity: "More than Normal" as const, label: "3BR House (Lots of stuff)" },
    { type: "Large Home" as const, bedrooms: 4, intensity: "Normal" as const, label: "4BR Large Home" }
  ];
  
  console.log('🎯 Quick Lead Generation Estimates:');
  console.log('─'.repeat(70));
  console.log('Property Type'.padEnd(25) + 'Boxes'.padEnd(10) + 'Hours'.padEnd(10) + 'Cost'.padEnd(12) + 'Crew');
  console.log('─'.repeat(70));
  
  scenarios.forEach(scenario => {
    const result = calculateQuickEstimation(scenario.type, scenario.bedrooms, scenario.intensity);
    
    if (result.success) {
      const boxesStr = result.totalBoxes?.toString() || '0';
      const hoursStr = result.estimatedHours?.toFixed(1) || '0.0';
      const costStr = `$${result.materialCost?.toFixed(0) || '0'}`;
      const crewStr = result.crewSize?.toString() || '0';
      
      console.log(
        scenario.label.padEnd(25) + 
        boxesStr.padEnd(10) + 
        hoursStr.padEnd(10) + 
        costStr.padEnd(12) + 
        crewStr
      );
    }
  });
  
  console.log('─'.repeat(70));
}

// Example 5: Customer-Facing Breakdown
export function example5_CustomerFacingBreakdown() {
  console.log('\n👨‍👩‍👧‍👦 Example 5: Customer-Friendly Estimate Presentation\n');
  
  const inputs: EstimationInputs = {
    propertyType: "Normal Home",
    bedrooms: 3,
    packingIntensity: "Normal"
  };

  const breakdown = getEstimationBreakdown(inputs);
  
  if (breakdown.success && breakdown.breakdown) {
    const data = breakdown.breakdown;
    
    console.log('📋 YOUR MOVING ESTIMATE');
    console.log('═'.repeat(50));
    console.log(`🏠 Property: ${inputs.propertyType} (${inputs.bedrooms} bedrooms)`);
    console.log(`📦 Packing Supplies: $${data.packingSupplies.toFixed(2)}`);
    console.log(`⏱️  Packing Time: ${data.packingTime}`);
    console.log(`📤 Unpacking Time: ${data.unpackingTime}`);
    console.log(`🕐 Total Service Time: ${data.totalTime}`);
    console.log(`👥 Crew Size: ${data.crewSize} professional movers`);
    console.log(`📊 Packing Level: ${data.intensity}`);
    
    console.log('\n📦 PACKING SUPPLIES INCLUDED:');
    Object.entries(data.boxTypes).forEach(([type, count]) => {
      console.log(`   • ${count} ${type} boxes`);
    });
    
    console.log('\n💡 This estimate includes all packing materials and professional packing/unpacking services.');
  }
}

// Example 6: Integration with Pricing Engine
export function example6_PricingEngineIntegration() {
  console.log('\n🔗 Example 6: Integration with Pricing Engine\n');
  
  const inputs: EstimationInputs = {
    propertyType: "Normal Home",
    bedrooms: 3,
    packingIntensity: "Normal",
    whiteGloveService: true
  };

  const estimation = calculateComprehensiveEstimation(inputs);
  
  if (estimation.success && estimation.data) {
    // Get pricing integration data
    const pricingData = PricingIntegration.getPricingData(estimation.data);
    
    console.log('📊 Estimation Results:');
    console.log(`   Material Costs: $${pricingData.materialCosts.toFixed(2)}`);
    console.log(`   Packing Time: ${pricingData.packingTime.toFixed(1)} hours`);
    console.log(`   Unpacking Time: ${pricingData.unpackingTime.toFixed(1)} hours`);
    console.log(`   Total Boxes: ${pricingData.totalBoxes}`);
    console.log(`   Crew Recommendation: ${pricingData.crewSizeRecommendation} workers`);
    console.log(`   Service Complexity: ${pricingData.serviceComplexityModifier}x`);
    
    // Convert to pricing engine format (this would be used with the actual pricing engine)
    console.log('\n💰 Pricing Engine Integration:');
    console.log('   // Example integration with pricing engine:');
    console.log('   const pricingInputs = {');
    console.log('     moveSize: "3 Bedroom House",');
    console.log('     serviceTier: "White Glove",');
    console.log('     serviceType: "Full Service",');
    console.log('     distanceMiles: 15,');
    console.log(`     additionalCosts: ${pricingData.materialCosts.toFixed(2)}, // Material costs`);
    console.log(`     packingServiceHours: ${(pricingData.packingTime + pricingData.unpackingTime).toFixed(1)}, // Packing time`);
    console.log(`     forceCrewSize: ${pricingData.crewSizeRecommendation}, // Recommended crew`);
    console.log('     handicapFactors: { stairs: 0, walkFeet: 0, elevator: false }');
    console.log('   };');
    
    console.log('\n✅ This data can be directly fed into the pricing engine for complete job pricing.');
  }
}

// Example 7: Batch Processing for Multiple Properties
export function example7_BatchProcessing() {
  console.log('\n📊 Example 7: Batch Processing Multiple Properties\n');
  
  const properties = [
    { id: 'PROP001', type: 'Apartment' as const, bedrooms: 1, intensity: 'Normal' as const },
    { id: 'PROP002', type: 'Normal Home' as const, bedrooms: 3, intensity: 'Normal' as const },
    { id: 'PROP003', type: 'Large Home' as const, bedrooms: 4, intensity: 'More than Normal' as const },
    { id: 'PROP004', fixedType: 'Office (Small)' as const, intensity: 'Less than Normal' as const }
  ];
  
  console.log('🏭 Processing Multiple Property Estimates:');
  console.log('─'.repeat(80));
  console.log('Property ID'.padEnd(15) + 'Type'.padEnd(20) + 'Boxes'.padEnd(10) + 'Time'.padEnd(12) + 'Cost'.padEnd(12) + 'Status');
  console.log('─'.repeat(80));
  
  const results = properties.map(property => {
    const inputs: EstimationInputs = property.fixedType 
      ? { fixedEstimateType: property.fixedType, packingIntensity: property.intensity }
      : { propertyType: property.type, bedrooms: property.bedrooms, packingIntensity: property.intensity };
    
    const result = calculateComprehensiveEstimation(inputs);
    
    if (result.success && result.data) {
      const totalBoxes = EstimationUtils.getTotalBoxes(result.data.boxes.totalBoxes);
      const totalTime = result.data.time.packingTime.totalHours + result.data.time.unpackingTime.totalHours;
      
      const typeStr = property.fixedType || `${property.type} (${property.bedrooms}BR)`;
      const boxesStr = totalBoxes.toString();
      const timeStr = `${totalTime.toFixed(1)}h`;
      const costStr = `$${result.data.materials.totalCost.toFixed(0)}`;
      
      console.log(
        property.id.padEnd(15) +
        typeStr.padEnd(20) +
        boxesStr.padEnd(10) +
        timeStr.padEnd(12) +
        costStr.padEnd(12) +
        '✅ Success'
      );
      
      return { id: property.id, success: true, data: result.data };
    } else {
      console.log(
        property.id.padEnd(15) +
        'ERROR'.padEnd(20) +
        '-'.padEnd(10) +
        '-'.padEnd(12) +
        '-'.padEnd(12) +
        '❌ Failed'
      );
      
      return { id: property.id, success: false, errors: result.errors };
    }
  });
  
  console.log('─'.repeat(80));
  
  const successCount = results.filter(r => r.success).length;
  console.log(`\n📈 Batch Results: ${successCount}/${results.length} successful estimations`);
  
  return results;
}

// Main example runner
export function runAllExamples() {
  console.log('🚀 Box Estimation System - Comprehensive Examples\n');
  console.log('═'.repeat(80));
  
  try {
    example1_BasicResidentialMove();
    example2_LuxuryWhiteGloveMove();
    example3_CommercialOfficeMove();
    example4_QuickEstimationForLeads();
    example5_CustomerFacingBreakdown();
    example6_PricingEngineIntegration();
    example7_BatchProcessing();
    
    console.log('\n🎉 All examples completed successfully!');
    console.log('\n💡 These examples demonstrate the full capabilities of the Box Estimation System.');
    console.log('   Ready for integration across all 4 applications.');
    
  } catch (error) {
    console.error('❌ Example execution failed:', error);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
}