import { z } from 'zod';

export const RoomBoxCountsSchema = z
  .object({
    bedroom: z.coerce.number().int().min(0).optional(),
    livingRoom: z.coerce.number().int().min(0).optional(),
    kitchen: z.coerce.number().int().min(0).optional(),
    bathroom: z.coerce.number().int().min(0).optional(),
    diningRoom: z.coerce.number().int().min(0).optional(),
    office: z.coerce.number().int().min(0).optional(),
    garage: z.coerce.number().int().min(0).optional(),
    misc: z.coerce.number().int().min(0).optional(),
  })
  .partial();

export const EstimationConfigSchema = z.object({
  minutesPerBoxPack: z.coerce.number().int().min(0),
  minutesPerBoxUnpack: z.coerce.number().int().min(0),
});

export const EstimationInputSchema = z.object({
  propertyType: z.enum(['apartment', 'normalHome', 'largeHome']),
  rooms: RoomBoxCountsSchema,
  packingIntensity: z.enum(['lessThanNormal', 'normal', 'moreThanNormal']),
  workers: z.coerce.number().int().min(1),
});

export const EstimationRequestSchema = z.object({
  config: EstimationConfigSchema,
  input: EstimationInputSchema,
});

export type EstimationRequestInput = z.infer<typeof EstimationRequestSchema>;
