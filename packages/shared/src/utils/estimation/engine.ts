import { PACKING_INTENSITY_MULTIPLIER, PACKING_TIME_MIN_PER_BOX, UNPACKING_TIME_MIN_PER_BOX } from './constants';

export type PropertyType = 'apartment' | 'normalHome' | 'largeHome';
export type PackingIntensity = keyof typeof PACKING_INTENSITY_MULTIPLIER;
export type ServiceTypeForTime = 'Grab-n-Go' | 'Full Service' | 'White Glove' | 'Labor Only';

export type BoxCounts = {
  small: number;
  medium: number;
  large: number;
  wardrobe: number;
  dishPack: number;
  mattressBag: number;
  tvBox: number;
};

export type RoomType =
  | 'bedroom'
  | 'livingRoom'
  | 'kitchen'
  | 'diningRoom'
  | 'garage'
  | 'office'
  | 'patioShed'
  | 'atticBasement';

const ROOM_ALLOCATION: Record<RoomType, BoxCounts> = {
  bedroom: { small: 4, medium: 6, large: 2, wardrobe: 2, dishPack: 1, mattressBag: 1, tvBox: 1 },
  livingRoom: { small: 3, medium: 5, large: 3, wardrobe: 1, dishPack: 1, mattressBag: 0, tvBox: 1 },
  kitchen: { small: 4, medium: 6, large: 2, wardrobe: 0, dishPack: 3, mattressBag: 0, tvBox: 0 },
  diningRoom: { small: 2, medium: 3, large: 2, wardrobe: 0, dishPack: 1, mattressBag: 0, tvBox: 0 },
  garage: { small: 5, medium: 7, large: 3, wardrobe: 0, dishPack: 1, mattressBag: 0, tvBox: 0 },
  office: { small: 3, medium: 4, large: 2, wardrobe: 0, dishPack: 1, mattressBag: 0, tvBox: 1 },
  patioShed: { small: 2, medium: 3, large: 3, wardrobe: 0, dishPack: 1, mattressBag: 0, tvBox: 0 },
  atticBasement: { small: 3, medium: 5, large: 3, wardrobe: 0, dishPack: 1, mattressBag: 0, tvBox: 0 },
};

export type EstimateBoxesParams = {
  propertyType: PropertyType;
  bedrooms: number; // 0-5 for apartment, 1-5 for homes
  packingIntensity: PackingIntensity;
};

export type EstimateBoxesResult = {
  counts: BoxCounts;
  totalRooms: number;
};

function addCounts(a: BoxCounts, b: BoxCounts): BoxCounts {
  return {
    small: a.small + b.small,
    medium: a.medium + b.medium,
    large: a.large + b.large,
    wardrobe: a.wardrobe + b.wardrobe,
    dishPack: a.dishPack + b.dishPack,
    mattressBag: a.mattressBag + b.mattressBag,
    tvBox: a.tvBox + b.tvBox,
  };
}

function mulCounts(a: BoxCounts, m: number): BoxCounts {
  return {
    small: Math.round(a.small * m),
    medium: Math.round(a.medium * m),
    large: Math.round(a.large * m),
    wardrobe: Math.round(a.wardrobe * m),
    dishPack: Math.round(a.dishPack * m),
    mattressBag: Math.round(a.mattressBag * m),
    tvBox: Math.round(a.tvBox * m),
  };
}

export function estimateBoxes(params: EstimateBoxesParams): EstimateBoxesResult {
  const { propertyType, bedrooms, packingIntensity } = params;
  const rooms: Partial<Record<RoomType, number>> = {};

  if (propertyType === 'apartment') {
    rooms.livingRoom = 1;
    rooms.kitchen = 1;
    rooms.bedroom = Math.max(0, Math.min(5, Math.floor(bedrooms)));
  } else if (propertyType === 'normalHome') {
    rooms.livingRoom = 1;
    rooms.kitchen = 1;
    rooms.diningRoom = 1;
    rooms.garage = 1;
    rooms.bedroom = Math.max(1, Math.min(5, Math.floor(bedrooms)));
  } else if (propertyType === 'largeHome') {
    rooms.livingRoom = 1;
    rooms.kitchen = 1;
    rooms.diningRoom = 1;
    rooms.garage = 1;
    rooms.office = 1;
    rooms.patioShed = 1;
    rooms.atticBasement = 1;
    rooms.bedroom = Math.max(1, Math.min(5, Math.floor(bedrooms)));
  }

  let counts: BoxCounts = { small: 0, medium: 0, large: 0, wardrobe: 0, dishPack: 0, mattressBag: 0, tvBox: 0 };
  let totalRooms = 0;
  for (const [room, n] of Object.entries(rooms) as Array<[RoomType, number]>) {
    const c = ROOM_ALLOCATION[room];
    for (let i = 0; i < (n ?? 0); i++) {
      counts = addCounts(counts, c);
      totalRooms += 1;
    }
  }

  const mult = PACKING_INTENSITY_MULTIPLIER[packingIntensity];
  counts = mulCounts(counts, mult);

  return { counts, totalRooms };
}

export type EstimateTimeParams = {
  counts: BoxCounts;
  totalRooms: number;
  serviceType?: ServiceTypeForTime; // White Glove adds 20%
};

export type EstimateTimeResult = {
  packMinutes: number;
  unpackMinutes: number;
};

export function estimateTime({ counts, totalRooms, serviceType }: EstimateTimeParams): EstimateTimeResult {
  const pack =
    counts.small * PACKING_TIME_MIN_PER_BOX.small +
    counts.medium * PACKING_TIME_MIN_PER_BOX.medium +
    counts.large * PACKING_TIME_MIN_PER_BOX.large +
    counts.wardrobe * PACKING_TIME_MIN_PER_BOX.wardrobe +
    counts.dishPack * PACKING_TIME_MIN_PER_BOX.dishPack +
    counts.mattressBag * PACKING_TIME_MIN_PER_BOX.mattressBag +
    counts.tvBox * PACKING_TIME_MIN_PER_BOX.tvBox +
    totalRooms * PACKING_TIME_MIN_PER_BOX.extraPerRoom;

  const unpack =
    counts.small * UNPACKING_TIME_MIN_PER_BOX.small +
    counts.medium * UNPACKING_TIME_MIN_PER_BOX.medium +
    counts.large * UNPACKING_TIME_MIN_PER_BOX.large +
    counts.wardrobe * UNPACKING_TIME_MIN_PER_BOX.wardrobe +
    counts.dishPack * UNPACKING_TIME_MIN_PER_BOX.dishPack +
    counts.mattressBag * UNPACKING_TIME_MIN_PER_BOX.mattressBag +
    counts.tvBox * UNPACKING_TIME_MIN_PER_BOX.tvBox +
    totalRooms * UNPACKING_TIME_MIN_PER_BOX.extraPerRoom;

  const whiteGloveMultiplier = serviceType === 'White Glove' ? 1.2 : 1;

  return {
    packMinutes: Math.round(pack * whiteGloveMultiplier),
    unpackMinutes: Math.round(unpack * whiteGloveMultiplier),
  };
}

export type EstimateAllParams = EstimateBoxesParams & { serviceType?: ServiceTypeForTime };
export type EstimateAllResult = EstimateBoxesResult & EstimateTimeResult;

export function estimateAll(params: EstimateAllParams): EstimateAllResult {
  const boxRes = estimateBoxes(params);
  const timeRes = estimateTime({ ...boxRes, serviceType: params.serviceType });
  return { ...boxRes, ...timeRes };
}
