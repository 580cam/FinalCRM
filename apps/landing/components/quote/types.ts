export type ServiceTypeOption =
  | 'Moving'
  | 'Full Service'
  | 'Moving Labor'
  | 'White Glove'
  | 'Commercial'
  | 'Junk Removal';

export const SERVICE_TYPE_OPTIONS: ServiceTypeOption[] = [
  'Moving',
  'Full Service',
  'Moving Labor',
  'White Glove',
  'Commercial',
  'Junk Removal',
];

export type ResidentialPropertyType = 'Apartment-Condo' | 'House' | 'Townhouse' | 'Storage';
export type CommercialPropertyType = 'Office' | 'Retail' | 'Warehouse' | 'Medical';
export type JunkPropertyType = 'House' | 'Apartment' | 'Storage' | 'Commercial';
export type PropertyType = ResidentialPropertyType | CommercialPropertyType | JunkPropertyType;

export type CommercialSizeOption = 'Small Space' | 'Medium Space' | 'Large Space' | 'Few Items';
export const COMMERCIAL_SIZES: CommercialSizeOption[] = ['Small Space', 'Medium Space', 'Large Space', 'Few Items'];

export type LaborTypeOption = 'Load-Only' | 'Unload-Only' | 'Both' | 'Restaging / In-Home';
export const LABOR_TYPES: LaborTypeOption[] = ['Load-Only', 'Unload-Only', 'Both', 'Restaging / In-Home'];

export type JunkVolumeOption =
  | 'Single Item'
  | '¼ Truck'
  | '½ Truck'
  | '¾ Truck'
  | 'Full Truck'
  | '2+ Trucks';
export const JUNK_VOLUMES: JunkVolumeOption[] = [
  'Single Item',
  '¼ Truck',
  '½ Truck',
  '¾ Truck',
  'Full Truck',
  '2+ Trucks',
];

// Move size label lists (sourced from shared MOVE_SIZE_CUFT spec)
export const APARTMENT_CONDO_SIZES = [
  'Studio 1bed',
  '2 bed',
  '3 bed',
  '4 bed',
  'Few Items',
] as const;

export const HOUSE_TOWNHOUSE_SIZES = [
  '1bed',
  '2 bed',
  '3 bed',
  '4 bed',
  '5 bed',
  'Few Items',
] as const;

export const STORAGE_SIZES = [
  '5×5',
  '5×10',
  '10×10',
  '10×15',
  '10×20',
  'Few Items',
] as const;

// Property options per flow
export const RESIDENTIAL_PROPERTY_OPTIONS: ResidentialPropertyType[] = [
  'Apartment-Condo',
  'House',
  'Townhouse',
  'Storage',
];

export const COMMERCIAL_PROPERTY_OPTIONS: CommercialPropertyType[] = [
  'Office',
  'Retail',
  'Warehouse',
  'Medical',
];

export const JUNK_PROPERTY_OPTIONS: JunkPropertyType[] = [
  'House',
  'Apartment',
  'Storage',
  'Commercial',
];
