/**
 * Quick JavaScript Demo of the Box Estimation System
 * Demonstrates key functionality without TypeScript compilation
 */

// Simulate the core functionality for demo purposes
const PACKING_INTENSITY_MULTIPLIERS = {
  "Less than Normal": 0.75,
  "Normal": 1.0,
  "More than Normal": 1.5
};

const ROOM_BOX_ALLOCATIONS = {
  "Bedroom": { "Small": 4, "Medium": 6, "Large": 2, "Wardrobe": 2, "Dish Pack": 1, "Mattress Bag": 1, "TV Box": 1 },
  "Living Room": { "Small": 3, "Medium": 5, "Large": 3, "Wardrobe": 1, "Dish Pack": 1, "Mattress Bag": 0, "TV Box": 1 },
  "Kitchen": { "Small": 4, "Medium": 6, "Large": 2, "Wardrobe": 0, "Dish Pack": 3, "Mattress Bag": 0, "TV Box": 0 },
  "Dining Room": { "Small": 2, "Medium": 3, "Large": 2, "Wardrobe": 0, "Dish Pack": 1, "Mattress Bag": 0, "TV Box": 0 },
  "Garage": { "Small": 5, "Medium": 7, "Large": 3, "Wardrobe": 0, "Dish Pack": 1, "Mattress Bag": 0, "TV Box": 0 }
};

const PROPERTY_CONFIGURATIONS = {
  "Apartment": { baseRooms: ["Living Room", "Kitchen"], minBedrooms: 0, maxBedrooms: 5 },
  "Normal Home": { baseRooms: ["Living Room", "Kitchen", "Dining Room", "Garage"], minBedrooms: 1, maxBedrooms: 5 }
};

const PACKING_TIMES = {
  "Small": 5, "Medium": 7, "Large": 9, "Wardrobe": 10, "Dish Pack": 14, "Mattress Bag": 5, "TV Box": 6
};

const MATERIAL_PRICING = {
  "Small": 1.85, "Medium": 2.66, "Large": 3.33, "Wardrobe": 29.03,
  "Dish Pack": 10.94, "Mattress Bag": 12.49, "TV Box": 40.49
};

function calculateBoxEstimation(propertyType, bedrooms, packingIntensity) {
  const config = PROPERTY_CONFIGURATIONS[propertyType];
  const multiplier = PACKING_INTENSITY_MULTIPLIERS[packingIntensity];
  
  const rooms = {};
  const totalBoxes = { "Small": 0, "Medium": 0, "Large": 0, "Wardrobe": 0, "Dish Pack": 0, "Mattress Bag": 0, "TV Box": 0 };
  
  // Add base rooms
  config.baseRooms.forEach(room => {
    rooms[room] = 1;
  });
  
  // Add bedrooms
  if (bedrooms > 0) {
    rooms["Bedroom"] = bedrooms;
  }
  
  // Calculate total boxes
  Object.entries(rooms).forEach(([room, count]) => {
    const allocation = ROOM_BOX_ALLOCATIONS[room];
    if (allocation) {
      Object.entries(allocation).forEach(([boxType, boxCount]) => {
        totalBoxes[boxType] += boxCount * count;
      });
    }
  });
  
  // Apply intensity multiplier
  Object.keys(totalBoxes).forEach(boxType => {
    totalBoxes[boxType] = Math.ceil(totalBoxes[boxType] * multiplier);
  });
  
  return { totalBoxes, rooms, multiplier };
}

function calculateTimeEstimation(totalBoxes, crewSize) {
  let totalMinutes = 0;
  
  Object.entries(totalBoxes).forEach(([boxType, count]) => {
    const timePerBox = PACKING_TIMES[boxType];
    totalMinutes += (count * timePerBox) / crewSize;
  });
  
  return totalMinutes / 60; // Convert to hours
}

function calculateMaterialCosts(totalBoxes) {
  let totalCost = 0;
  const breakdown = {};
  
  Object.entries(totalBoxes).forEach(([boxType, count]) => {
    if (count > 0) {
      const unitCost = MATERIAL_PRICING[boxType];
      const itemCost = count * unitCost;
      totalCost += itemCost;
      breakdown[boxType] = { quantity: count, unitCost, totalCost: itemCost };
    }
  });
  
  return { totalCost, breakdown };
}

function runDemo() {
  console.log('🚀 Box Estimation System - JavaScript Demo');
  console.log('═'.repeat(60));
  
  // Demo 1: 2-Bedroom Apartment
  console.log('\n📋 Demo 1: 2-Bedroom Apartment (Normal Intensity)');
  const apartment = calculateBoxEstimation("Apartment", 2, "Normal");
  const aptTime = calculateTimeEstimation(apartment.totalBoxes, 3);
  const aptCosts = calculateMaterialCosts(apartment.totalBoxes);
  
  const aptTotalBoxes = Object.values(apartment.totalBoxes).reduce((sum, count) => sum + count, 0);
  
  console.log(`🏠 Property: Apartment with 2 bedrooms`);
  console.log(`📦 Total Boxes: ${aptTotalBoxes}`);
  console.log(`⏱️  Packing Time: ${aptTime.toFixed(1)} hours (3-person crew)`);
  console.log(`💰 Material Cost: $${aptCosts.totalCost.toFixed(2)}`);
  console.log(`📊 Intensity Multiplier: ${apartment.multiplier}x`);
  
  console.log('\n   Room Configuration:');
  Object.entries(apartment.rooms).forEach(([room, count]) => {
    console.log(`   • ${room}: ${count} room(s)`);
  });
  
  console.log('\n   Box Breakdown:');
  Object.entries(apartment.totalBoxes).forEach(([type, count]) => {
    if (count > 0) {
      console.log(`   • ${type}: ${count} boxes`);
    }
  });
  
  // Demo 2: Large Family Home
  console.log('\n📋 Demo 2: 4-Bedroom Normal Home (More than Normal Intensity)');
  const house = calculateBoxEstimation("Normal Home", 4, "More than Normal");
  const houseTime = calculateTimeEstimation(house.totalBoxes, 4);
  const houseCosts = calculateMaterialCosts(house.totalBoxes);
  
  const houseTotalBoxes = Object.values(house.totalBoxes).reduce((sum, count) => sum + count, 0);
  
  console.log(`🏠 Property: Normal Home with 4 bedrooms`);
  console.log(`📦 Total Boxes: ${houseTotalBoxes}`);
  console.log(`⏱️  Packing Time: ${houseTime.toFixed(1)} hours (4-person crew)`);
  console.log(`💰 Material Cost: $${houseCosts.totalCost.toFixed(2)}`);
  console.log(`📊 Intensity Multiplier: ${house.multiplier}x`);
  
  console.log('\n   Most Expensive Materials:');
  const sortedItems = Object.entries(houseCosts.breakdown)
    .sort(([,a], [,b]) => b.totalCost - a.totalCost)
    .slice(0, 3);
  
  sortedItems.forEach(([type, info]) => {
    console.log(`   • ${type}: ${info.quantity} × $${info.unitCost.toFixed(2)} = $${info.totalCost.toFixed(2)}`);
  });
  
  // Demo 3: Comparison Table
  console.log('\n📊 Demo 3: Intensity Comparison (2BR Apartment)');
  console.log('─'.repeat(70));
  console.log('Intensity Level'.padEnd(20) + 'Boxes'.padEnd(12) + 'Time (hrs)'.padEnd(15) + 'Cost'.padEnd(12) + 'Multiplier');
  console.log('─'.repeat(70));
  
  const intensities = ["Less than Normal", "Normal", "More than Normal"];
  intensities.forEach(intensity => {
    const result = calculateBoxEstimation("Apartment", 2, intensity);
    const time = calculateTimeEstimation(result.totalBoxes, 3);
    const costs = calculateMaterialCosts(result.totalBoxes);
    const totalBoxes = Object.values(result.totalBoxes).reduce((sum, count) => sum + count, 0);
    
    console.log(
      intensity.padEnd(20) +
      totalBoxes.toString().padEnd(12) +
      time.toFixed(1).padEnd(15) +
      `$${costs.totalCost.toFixed(0)}`.padEnd(12) +
      `${result.multiplier}x`
    );
  });
  
  console.log('─'.repeat(70));
  
  console.log('\n✅ Demo Complete!');
  console.log('\n💡 This demonstrates the core functionality of the Box Estimation System:');
  console.log('   • Property-based room calculations');
  console.log('   • Packing intensity multipliers');
  console.log('   • Time estimates based on crew size');
  console.log('   • Material cost calculations');
  console.log('   • Integration-ready data structures');
  console.log('\n🔗 Ready for integration with the pricing engine and all 4 applications!');
}

// Run the demo
runDemo();