/**
 * System Validation Script
 * Quick validation to ensure the estimation system works correctly
 */

// Import the main functions (adjust paths as needed for testing)
import {
  calculateComprehensiveEstimation,
  calculateQuickEstimation,
  getEstimationBreakdown,
  SystemDiagnostics,
  EstimationUtils,
  CommonEstimationScenarios
} from './index';

import type { EstimationInputs } from './types';

function runValidationTests() {
  console.log('🔍 Running Box Estimation System Validation Tests...\n');

  // Test 1: System Configuration
  console.log('1️⃣  Testing System Configuration...');
  try {
    const configCheck = SystemDiagnostics.validateConfig();
    console.log(`   ✅ Configuration valid: ${configCheck.valid}`);
    if (!configCheck.valid) {
      configCheck.errors.forEach(error => console.log(`   ❌ ${error}`));
    }

    const metrics = SystemDiagnostics.getMetrics();
    console.log(`   📊 Property Types: ${metrics.totalPropertyTypes}`);
    console.log(`   📊 Room Types: ${metrics.totalRoomTypes}`);
    console.log(`   📊 Fixed Estimates: ${metrics.totalFixedEstimates}`);
    console.log(`   📊 Material Items: ${metrics.materialItemCount}`);
  } catch (error) {
    console.log(`   ❌ Configuration test failed: ${error}`);
  }

  // Test 2: Basic Apartment Calculation
  console.log('\n2️⃣  Testing 2-Bedroom Apartment Calculation...');
  try {
    const inputs: EstimationInputs = {
      propertyType: "Apartment",
      bedrooms: 2,
      packingIntensity: "Normal"
    };

    const result = calculateComprehensiveEstimation(inputs);
    
    if (result.success && result.data) {
      const totalBoxes = EstimationUtils.getTotalBoxes(result.data.boxes.totalBoxes);
      const totalTime = result.data.time.packingTime.totalHours + result.data.time.unpackingTime.totalHours;
      
      console.log(`   ✅ Calculation successful`);
      console.log(`   📦 Total boxes: ${totalBoxes}`);
      console.log(`   ⏱️  Total time: ${totalTime.toFixed(1)} hours`);
      console.log(`   💰 Material cost: $${result.data.materials.totalCost.toFixed(2)}`);
      console.log(`   👥 Recommended crew: ${result.data.time.workersRequired} workers`);
      
      if (result.warnings?.length) {
        console.log(`   ⚠️  Warnings: ${result.warnings.length}`);
      }
    } else {
      console.log(`   ❌ Calculation failed`);
      result.errors?.forEach(error => console.log(`   ❌ ${error.message}`));
    }
  } catch (error) {
    console.log(`   ❌ Apartment test failed: ${error}`);
  }

  // Test 3: Large Home with White Glove
  console.log('\n3️⃣  Testing Large Home with White Glove Service...');
  try {
    const inputs: EstimationInputs = {
      propertyType: "Large Home",
      bedrooms: 4,
      packingIntensity: "More than Normal",
      whiteGloveService: true
    };

    const result = calculateComprehensiveEstimation(inputs);
    
    if (result.success && result.data) {
      const totalBoxes = EstimationUtils.getTotalBoxes(result.data.boxes.totalBoxes);
      const totalTime = result.data.time.packingTime.totalHours + result.data.time.unpackingTime.totalHours;
      
      console.log(`   ✅ Large home calculation successful`);
      console.log(`   📦 Total boxes: ${totalBoxes}`);
      console.log(`   ⏱️  Total time: ${totalTime.toFixed(1)} hours`);
      console.log(`   💰 Material cost: $${result.data.materials.totalCost.toFixed(2)}`);
      console.log(`   👥 Recommended crew: ${result.data.time.workersRequired} workers`);
      console.log(`   ⭐ White Glove modifier: ${(result.data.time.packingTime.whiteGloveModifier * 100).toFixed(0)}%`);
      console.log(`   📈 Intensity multiplier: ${result.data.boxes.packingIntensityApplied}x`);
    } else {
      console.log(`   ❌ Large home calculation failed`);
      result.errors?.forEach(error => console.log(`   ❌ ${error.message}`));
    }
  } catch (error) {
    console.log(`   ❌ Large home test failed: ${error}`);
  }

  // Test 4: Fixed Estimate (Office)
  console.log('\n4️⃣  Testing Fixed Estimate (Medium Office)...');
  try {
    const inputs: EstimationInputs = {
      fixedEstimateType: "Office (Medium)",
      packingIntensity: "Normal"
    };

    const result = calculateComprehensiveEstimation(inputs);
    
    if (result.success && result.data) {
      const totalBoxes = EstimationUtils.getTotalBoxes(result.data.boxes.totalBoxes);
      
      console.log(`   ✅ Fixed estimate successful`);
      console.log(`   📦 Total boxes: ${totalBoxes}`);
      console.log(`   🏢 Estimate type: ${result.data.boxes.estimationType}`);
      console.log(`   💰 Material cost: $${result.data.materials.totalCost.toFixed(2)}`);
    } else {
      console.log(`   ❌ Fixed estimate calculation failed`);
      result.errors?.forEach(error => console.log(`   ❌ ${error.message}`));
    }
  } catch (error) {
    console.log(`   ❌ Office test failed: ${error}`);
  }

  // Test 5: Quick Estimation
  console.log('\n5️⃣  Testing Quick Estimation API...');
  try {
    const quickResult = calculateQuickEstimation("Normal Home", 3, "Normal");
    
    if (quickResult.success) {
      console.log(`   ✅ Quick estimation successful`);
      console.log(`   📦 Total boxes: ${quickResult.totalBoxes}`);
      console.log(`   ⏱️  Estimated hours: ${quickResult.estimatedHours}`);
      console.log(`   💰 Material cost: $${quickResult.materialCost?.toFixed(2)}`);
      console.log(`   👥 Crew size: ${quickResult.crewSize}`);
    } else {
      console.log(`   ❌ Quick estimation failed: ${quickResult.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Quick estimation test failed: ${error}`);
  }

  // Test 6: Common Scenarios
  console.log('\n6️⃣  Testing Common Scenarios...');
  try {
    const scenarios = [
      CommonEstimationScenarios.studioApartment("Normal"),
      CommonEstimationScenarios.familyHome(3, "Normal"),
      CommonEstimationScenarios.smallOffice("Less than Normal")
    ];

    let successCount = 0;
    for (const scenario of scenarios) {
      const result = calculateComprehensiveEstimation(scenario);
      if (result.success) successCount++;
    }

    console.log(`   ✅ ${successCount}/${scenarios.length} scenarios successful`);
  } catch (error) {
    console.log(`   ❌ Scenarios test failed: ${error}`);
  }

  // Test 7: Input Validation
  console.log('\n7️⃣  Testing Input Validation...');
  try {
    const invalidInputs: EstimationInputs = {
      // Missing both property type and fixed estimate
      packingIntensity: "Normal"
    };

    const errors = EstimationUtils.validateInputs(invalidInputs);
    console.log(`   ✅ Validation working: ${errors.length} errors detected`);
    
    const validInputs: EstimationInputs = {
      propertyType: "Apartment",
      bedrooms: 1,
      packingIntensity: "Normal"
    };

    const validErrors = EstimationUtils.validateInputs(validInputs);
    console.log(`   ✅ Valid inputs: ${validErrors.length} errors detected`);
    
    if (errors.length > 0 && validErrors.length === 0) {
      console.log(`   ✅ Input validation working correctly`);
    }
  } catch (error) {
    console.log(`   ❌ Validation test failed: ${error}`);
  }

  // Test 8: System Smoke Test
  console.log('\n8️⃣  Running System Smoke Test...');
  try {
    const smokeTest = SystemDiagnostics.runSmokeTest();
    console.log(`   ✅ Smoke test result: ${smokeTest.success ? 'PASSED' : 'FAILED'}`);
    console.log(`   📊 Has data: ${smokeTest.hasData}`);
    console.log(`   ⚙️  Config valid: ${smokeTest.configValid}`);
  } catch (error) {
    console.log(`   ❌ Smoke test failed: ${error}`);
  }

  console.log('\n🎉 Box Estimation System Validation Complete!');
}

// Run the validation
if (require.main === module) {
  runValidationTests();
}

export { runValidationTests };