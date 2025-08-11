import type { BillingService, ServiceType } from '../../utils/pricing/constants';
import { calculatePricing, type PricingBreakdown, type RatesConfig } from '../../utils/pricing/engine';

export type PricingRequest = {
  serviceType: ServiceType;
  billingService: BillingService;
  distanceMiles: number;
  cubicFeet: number;
  movers?: number;
  trucks?: number;
  handicaps?: {
    stairsFlights?: number;
    walkDistanceFt?: number;
    hasElevator?: boolean;
  };
  emergencyWithin24h?: boolean;
  specialtyTiers?: (1 | 2 | 3)[];
  rates?: RatesConfig;
};

export type PricingResponse = PricingBreakdown;

export function calculatePricingFromRequest(req: PricingRequest): PricingResponse {
  const rates: RatesConfig = req.rates ?? {};
  return calculatePricing(
    {
      serviceType: req.serviceType,
      billingService: req.billingService,
      movers: req.movers,
      trucks: req.trucks,
      distanceMiles: req.distanceMiles,
      cubicFeet: req.cubicFeet,
      handicaps: req.handicaps,
      emergencyWithin24h: req.emergencyWithin24h,
      specialtyTiers: req.specialtyTiers,
    },
    rates
  );
}
