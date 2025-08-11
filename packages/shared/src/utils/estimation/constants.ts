export const MOVE_SIZE_CUFT: Record<string, number> = {
  'Room or Less': 75,
  'Studio Apartment': 288,
  '1 Bedroom Apartment': 432,
  '2 Bedroom Apartment': 743,
  '3 Bedroom Apartment': 1296,
  '1 Bedroom House': 576,
  '1 Bedroom House (Large)': 720,
  '2 Bedroom House': 1008,
  '2 Bedroom House (Large)': 1152,
  '3 Bedroom House': 1440,
  '3 Bedroom House (Large)': 1584,
  '4 Bedroom House': 1872,
  '4 Bedroom House (Large)': 2016,
  '5 Bedroom House': 3168,
  '5 Bedroom House (Large)': 3816,
  '5 x 10 Storage Unit': 400,
  '5 x 15 Storage Unit': 600,
  '10 x 10 Storage Unit': 800,
  '10 x 15 Storage Unit': 1200,
  '10 x 20 Storage Unit': 1600,
  'Office (Small)': 1000,
  'Office (Medium)': 2000,
  'Office (Large)': 3000,
};

export const PACKING_TIME_MIN_PER_BOX = {
  small: 5,
  medium: 7,
  large: 9,
  wardrobe: 10,
  dishPack: 14,
  mattressBag: 5,
  tvBox: 6,
  extraPerRoom: 15,
} as const;

export const UNPACKING_TIME_MIN_PER_BOX = {
  small: 4,
  medium: 6,
  large: 8,
  wardrobe: 8,
  dishPack: 12,
  mattressBag: 4,
  tvBox: 5,
  extraPerRoom: 15,
} as const;

export const PACKING_INTENSITY_MULTIPLIER = {
  lessThanNormal: 0.75,
  normal: 1.0,
  moreThanNormal: 1.5,
} as const;
