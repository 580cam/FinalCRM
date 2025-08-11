import { z } from 'zod';
import { BILLING_SERVICES, SERVICE_TYPES, type BillingService, type ServiceType } from '../../utils/pricing/constants';

export const HandicapSchema = z.object({
  stairsFlights: z.coerce.number().int().min(0).optional(),
  walkDistanceFt: z.coerce.number().int().min(0).optional(),
  hasElevator: z.boolean().optional(),
});

export const PricingRequestSchema = z.object({
  serviceType: z.enum(SERVICE_TYPES as unknown as [ServiceType, ...ServiceType[]]),
  billingService: z.enum(BILLING_SERVICES as unknown as [BillingService, ...BillingService[]]),
  distanceMiles: z.coerce.number().min(0),
  cubicFeet: z.coerce.number().min(0),
  movers: z.coerce.number().int().min(1).optional(),
  trucks: z.coerce.number().int().min(1).optional(),
  handicaps: HandicapSchema.optional(),
  emergencyWithin24h: z.boolean().optional(),
  specialtyTiers: z.array(z.union([z.literal(1), z.literal(2), z.literal(3)])).optional(),
});

export type PricingRequestInput = z.infer<typeof PricingRequestSchema>;
