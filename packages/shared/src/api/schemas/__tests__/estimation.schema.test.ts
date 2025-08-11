import { EstimationRequestSchema } from '../../schemas/estimation';
import type { ZodIssue } from 'zod';

describe('EstimationRequestSchema', () => {
  it('parses a valid request', () => {
    const input = {
      config: {
        minutesPerBoxPack: 6,
        minutesPerBoxUnpack: 5,
      },
      input: {
        propertyType: 'apartment',
        rooms: { bedroom: 2, kitchen: 1, livingRoom: 1, misc: 2 },
        packingIntensity: 'normal',
        workers: 3,
      },
    } as const;
    const res = EstimationRequestSchema.safeParse(input);
    expect(res.success).toBe(true);
  });

  it('coerces numeric strings for counts and minutes', () => {
    const input = {
      config: {
        minutesPerBoxPack: '6',
        minutesPerBoxUnpack: '5',
      },
      input: {
        propertyType: 'apartment',
        rooms: { bedroom: '2' },
        packingIntensity: 'lessThanNormal',
        workers: '2',
      },
    } as any;
    const res = EstimationRequestSchema.safeParse(input);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.config.minutesPerBoxPack).toBe(6);
      expect(res.data.config.minutesPerBoxUnpack).toBe(5);
      expect(res.data.input.workers).toBe(2);
      expect(res.data.input.rooms.bedroom).toBe(2);
    }
  });

  it('rejects missing fields', () => {
    const res = EstimationRequestSchema.safeParse({});
    expect(res.success).toBe(false);
    if (!res.success) {
      const paths = res.error.issues.map((i: ZodIssue) => i.path.join('.'));
      expect(paths).toContain('config');
      expect(paths).toContain('input');
    }
  });
});
