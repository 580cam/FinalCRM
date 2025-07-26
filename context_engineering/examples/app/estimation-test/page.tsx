"use client";

import { useState, useEffect } from "react";
import {
  calculateEstimate,
  EstimationParams,
  EstimateResult,
  ServiceType,
  MOVE_SIZE_CUFT,
} from "@/lib/estimationUtils";
import { PackingIntensity } from "@/lib/boxEstimator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Address {
  fullAddress: string;
  zip?: string;
  stairs?: number;
  elevator?: boolean;
  walkDistance?: number;
}

export default function EstimationTestPage() {
  // Service details state
  const [serviceType, setServiceType] = useState<ServiceType>("Moving");
  const [moveSize, setMoveSize] = useState<string>("2 Bedroom Apartment");
  const [packingIntensity, setPackingIntensity] = useState<PackingIntensity>("Normal");
  
  // Address state
  const [addresses, setAddresses] = useState<Address[]>([
    { fullAddress: "", zip: "", stairs: 0, elevator: false, walkDistance: 0 },
    { fullAddress: "", zip: "", stairs: 0, elevator: false, walkDistance: 0 },
  ]);
  
  // Result state
  const [estimateResult, setEstimateResult] = useState<EstimateResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Handle showing/hiding packing intensity based on service type
  const showPackingIntensity = [
    "Packing", 
    "Unpacking", 
    "Moving and Packing",
    "Full Service", 
    "White Glove"
  ].includes(serviceType);
  
  // Handle showing 1 or 2 addresses based on service type
  const isSingleLocationService = [
    "Packing", 
    "Unpacking", 
    "Labor Only", 
    "Staging"
  ].includes(serviceType);
  
  // The second address should be the destination for regular moves,
  // but for Unload Only and Unpacking, the first address is the destination
  const isDestinationFirst = ["Unload Only", "Unpacking"].includes(serviceType);
  
  // Update address fields
  const updateAddress = (index: number, field: keyof Address, value: string | number | boolean) => {
    const newAddresses = [...addresses];
    newAddresses[index] = { ...newAddresses[index], [field]: value };
    setAddresses(newAddresses);
  };
  
  // Calculate estimate
  const handleCalculate = async () => {
    setIsCalculating(true);
    
    // Create parameters for estimation
    const params: EstimationParams = {
      serviceType,
      moveSize,
      packingIntensity: showPackingIntensity ? packingIntensity : "Normal",
      addresses: isSingleLocationService ? [addresses[0]] : addresses,
    };
    
    // Calculate estimate
    try {
      const result = await calculateEstimate(params);
      setEstimateResult(result);
    } catch (error) {
      console.error("Estimation error:", error);
      alert("Error calculating estimate. See console for details.");
    }
    
    setIsCalculating(false);
  };
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Estimation Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Estimation Inputs</CardTitle>
            <CardDescription>Enter job details to calculate an estimate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Service Type */}
            <div className="space-y-2">
              <Label htmlFor="serviceType">Service Type</Label>
              <Select
                value={serviceType}
                onValueChange={(value) => setServiceType(value as ServiceType)}
              >
                <SelectTrigger id="serviceType">
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Moving">Moving</SelectItem>
                  <SelectItem value="Packing">Packing</SelectItem>
                  <SelectItem value="Unpacking">Unpacking</SelectItem>
                  <SelectItem value="Moving and Packing">Moving and Packing</SelectItem>
                  <SelectItem value="Full Service">Full Service</SelectItem>
                  <SelectItem value="White Glove">White Glove</SelectItem>
                  <SelectItem value="Load Only">Load Only</SelectItem>
                  <SelectItem value="Unload Only">Unload Only</SelectItem>
                  <SelectItem value="Labor Only">Labor Only</SelectItem>
                  <SelectItem value="Staging">Staging</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Move Size */}
            <div className="space-y-2">
              <Label htmlFor="moveSize">Move Size</Label>
              <Select
                value={moveSize}
                onValueChange={setMoveSize}
              >
                <SelectTrigger id="moveSize">
                  <SelectValue placeholder="Select move size" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(MOVE_SIZE_CUFT).map((size) => (
                    <SelectItem key={size} value={size}>
                      {size} ({MOVE_SIZE_CUFT[size]} cuft)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Packing Intensity - only show for relevant services */}
            {showPackingIntensity && (
              <div className="space-y-2">
                <Label htmlFor="packingIntensity">Packing Intensity</Label>
                <Select
                  value={packingIntensity}
                  onValueChange={(value) => setPackingIntensity(value as PackingIntensity)}
                >
                  <SelectTrigger id="packingIntensity">
                    <SelectValue placeholder="Select packing intensity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Less than Normal">Less than Normal</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="More than Normal">More than Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Origin Address */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium text-lg">
                {isDestinationFirst ? "Destination Address" : "Origin Address"}
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="address1">Full Address</Label>
                <Input
                  id="address1"
                  value={addresses[0].fullAddress}
                  onChange={(e) => updateAddress(0, "fullAddress", e.target.value)}
                  placeholder="Enter full address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zip1">ZIP Code</Label>
                <Input
                  id="zip1"
                  value={addresses[0].zip || ""}
                  onChange={(e) => updateAddress(0, "zip", e.target.value)}
                  placeholder="ZIP code"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stairs1">Flights of Stairs</Label>
                <Input
                  id="stairs1"
                  type="number"
                  min="0"
                  value={addresses[0].stairs || 0}
                  onChange={(e) => updateAddress(0, "stairs", parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="elevator1"
                  checked={addresses[0].elevator || false}
                  onCheckedChange={(checked) => updateAddress(0, "elevator", !!checked)}
                />
                <Label htmlFor="elevator1">Has Elevator</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="walkDistance1">Walk Distance (feet)</Label>
                <Input
                  id="walkDistance1"
                  type="number"
                  min="0"
                  value={addresses[0].walkDistance || 0}
                  onChange={(e) => updateAddress(0, "walkDistance", parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            
            {/* Destination Address - only show for services that need 2 locations */}
            {!isSingleLocationService && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium text-lg">
                  {isDestinationFirst ? "Origin Address" : "Destination Address"}
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="address2">Full Address</Label>
                  <Input
                    id="address2"
                    value={addresses[1].fullAddress}
                    onChange={(e) => updateAddress(1, "fullAddress", e.target.value)}
                    placeholder="Enter full address"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zip2">ZIP Code</Label>
                  <Input
                    id="zip2"
                    value={addresses[1].zip || ""}
                    onChange={(e) => updateAddress(1, "zip", e.target.value)}
                    placeholder="ZIP code"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stairs2">Flights of Stairs</Label>
                  <Input
                    id="stairs2"
                    type="number"
                    min="0"
                    value={addresses[1].stairs || 0}
                    onChange={(e) => updateAddress(1, "stairs", parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="elevator2"
                    checked={addresses[1].elevator || false}
                    onCheckedChange={(checked) => updateAddress(1, "elevator", !!checked)}
                  />
                  <Label htmlFor="elevator2">Has Elevator</Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="walkDistance2">Walk Distance (feet)</Label>
                  <Input
                    id="walkDistance2"
                    type="number"
                    min="0"
                    value={addresses[1].walkDistance || 0}
                    onChange={(e) => updateAddress(1, "walkDistance", parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleCalculate} 
              disabled={isCalculating}
              className="w-full"
            >
              {isCalculating ? "Calculating..." : "Calculate Estimate"}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Estimate Results</CardTitle>
            <CardDescription>Calculation results will appear here</CardDescription>
          </CardHeader>
          
          {estimateResult ? (
            <CardContent className="space-y-6">
              <Tabs defaultValue="time">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="time">Time</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                  <TabsTrigger value="costs">Costs</TabsTrigger>
                  <TabsTrigger value="materials">Materials</TabsTrigger>
                </TabsList>
                
                {/* Time Details */}
                <TabsContent value="time" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Moving Time</h4>
                      <p className="text-xl">{estimateResult.calculatedMovingTimeHours.toFixed(2)} hours</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Packing Time</h4>
                      <p className="text-xl">{estimateResult.calculatedPackingTimeHours.toFixed(2)} hours</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Unpacking Time</h4>
                      <p className="text-xl">{estimateResult.calculatedUnpackingTimeHours.toFixed(2)} hours</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Travel Time</h4>
                      <p className="text-xl">{estimateResult.travelTimeHours.toFixed(2)} hours</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Effective Base Time</h4>
                      <p className="text-xl font-bold">{estimateResult.effectiveBaseTimeHours.toFixed(2)} hours</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Total Billed Time</h4>
                      <p className="text-xl font-bold">{estimateResult.totalBilledTimeHours.toFixed(2)} hours</p>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Resources Details */}
                <TabsContent value="resources" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Required Movers</h4>
                      <p className="text-xl">{estimateResult.requiredMovers}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Required Trucks</h4>
                      <p className="text-xl">{estimateResult.requiredTrucks}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Base Hourly Rate</h4>
                      <p className="text-xl">${estimateResult.baseHourlyRate.toFixed(2)}</p>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Costs Details */}
                <TabsContent value="costs" className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Base Moving Cost</span>
                      <span>${estimateResult.baseMovingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Origin Handicap</span>
                      <span>${estimateResult.originHandicapCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Destination Handicap</span>
                      <span>${estimateResult.destinationHandicapCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Additional Movers</span>
                      <span>${estimateResult.additionalMoverCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Additional Trucks</span>
                      <span>${estimateResult.additionalTruckCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Travel Cost</span>
                      <span>${estimateResult.travelCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fuel Cost</span>
                      <span>${estimateResult.fuelCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Materials Cost</span>
                      <span>${estimateResult.materialsCost.toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Subtotal</span>
                      <span>${estimateResult.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>TOTAL</span>
                      <span>${estimateResult.total.toFixed(2)}</span>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Materials Details */}
                <TabsContent value="materials" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Small Boxes</h4>
                      <p className="text-xl">{estimateResult.estimatedBoxes.small}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Medium Boxes</h4>
                      <p className="text-xl">{estimateResult.estimatedBoxes.medium}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Large Boxes</h4>
                      <p className="text-xl">{estimateResult.estimatedBoxes.large}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Wardrobe Boxes</h4>
                      <p className="text-xl">{estimateResult.estimatedBoxes.wardrobe}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Dish-Pack Boxes</h4>
                      <p className="text-xl">{estimateResult.estimatedBoxes.dishPack}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Mattress Bags</h4>
                      <p className="text-xl">{estimateResult.estimatedBoxes.mattressBag}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">TV/Picture Boxes</h4>
                      <p className="text-xl">{estimateResult.estimatedBoxes.tvBox}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Total Materials Cost</h4>
                      <p className="text-xl font-bold">${estimateResult.materialsCost.toFixed(2)}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          ) : (
            <CardContent>
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No estimate calculated yet. Enter details and click Calculate Estimate.
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
