import { estimateBoxes, estimateTime, estimateAll } from '../engine';

describe('estimation engine - boxes and time', () => {
  it('apartment with 0 bedrooms has 2 rooms (living + kitchen)', () => {
    const res = estimateBoxes({ propertyType: 'apartment', bedrooms: 0, packingIntensity: 'normal' });
    expect(res.totalRooms).toBe(2);
    expect(res.counts.medium).toBeGreaterThan(0);
  });

  it('packing intensity multiplier increases counts for moreThanNormal', () => {
    const normal = estimateBoxes({ propertyType: 'apartment', bedrooms: 1, packingIntensity: 'normal' });
    const heavy = estimateBoxes({ propertyType: 'apartment', bedrooms: 1, packingIntensity: 'moreThanNormal' });
    expect(heavy.counts.small).toBeGreaterThanOrEqual(normal.counts.small);
    expect(heavy.counts.medium).toBeGreaterThanOrEqual(normal.counts.medium);
    expect(heavy.counts.large).toBeGreaterThanOrEqual(normal.counts.large);
  });

  it('white glove adds 20% to packing and unpacking minutes', () => {
    const counts = { small: 10, medium: 0, large: 0, wardrobe: 0, dishPack: 0, mattressBag: 0, tvBox: 0 };
    const base = estimateTime({ counts, totalRooms: 0 });
    const wg = estimateTime({ counts, totalRooms: 0, serviceType: 'White Glove' });
    // base: pack 10*5=50, unpack 10*4=40
    expect(base.packMinutes).toBe(50);
    expect(base.unpackMinutes).toBe(40);
    expect(wg.packMinutes).toBe(60); // 50 * 1.2
    expect(wg.unpackMinutes).toBe(48); // 40 * 1.2
  });

  it('estimateAll combines boxes and time consistently', () => {
    const all = estimateAll({ propertyType: 'normalHome', bedrooms: 3, packingIntensity: 'normal', serviceType: 'Full Service' });
    expect(all.totalRooms).toBeGreaterThan(0);
    expect(all.packMinutes).toBeGreaterThan(0);
    expect(all.unpackMinutes).toBeGreaterThan(0);
  });
});
