import { PricingRequestSchema } from '../../schemas/pricing';
import type { ZodIssue } from 'zod';

describe('PricingRequestSchema', () => {
  it('parses and coerces numeric strings', () => {
    const res = PricingRequestSchema.safeParse({
      serviceType: 'Full Service',
      billingService: 'Moving',
      distanceMiles: '12',
      cubicFeet: '900',
      movers: '3',
      trucks: '1',
      emergencyWithin24h: true,
      handicaps: { stairsFlights: '1', walkDistanceFt: '100', hasElevator: false } as any,
      specialtyTiers: [1, 2, 3],
    } as any);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.distanceMiles).toBe(12);
      expect(res.data.cubicFeet).toBe(900);
      expect(res.data.movers).toBe(3);
      expect(res.data.trucks).toBe(1);
      expect(res.data.handicaps?.stairsFlights).toBe(1);
    }
  });

  it('validates required fields', () => {
    const res = PricingRequestSchema.safeParse({});
    expect(res.success).toBe(false);
    if (!res.success) {
      const paths = res.error.issues.map((i: ZodIssue) => i.path.join('.'));
      expect(paths).toContain('serviceType');
      expect(paths).toContain('billingService');
      expect(paths).toContain('distanceMiles');
      expect(paths).toContain('cubicFeet');
    }
  });
});
