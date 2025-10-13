import type { IconType } from '@knockdog/ui';
import type { FilterItemCode } from '@entities/kindergarten';

export const FILTER_ICON_MAP: Record<FilterItemCode, IconType> = {
  DOG_FREE: 'Alldogs',
  SMALL_DOG_ONLY: 'Smalldog',
  MEDIUM_LARGE_DOG_ONLY: 'Largedog',

  DAYCARE: 'Daycare',
  HOTEL: 'Hotel',
  STAY_24H: 'Time',
  SPLIT_CLASS: 'Babydelivery',
  TEMPERAMENT: 'Personalitycheck',
  BATH_SERVICE: 'Bath',
  WALK: 'Walk',
  TRAINING: 'Training',
  GROOMING: 'Salon',
  REHABILITATION: 'Rehabilitation',

  NON_SLIP: 'Floor',
  CCTV: 'Cctv',
  PLAYGROUND: 'Playground',
  ROOFTOP: 'Rooftop',
  YARD: 'Field',

  PICK_DROP: 'PickdropLine',
  DIARY: 'Noticebook',
  DOG_CAFE: 'Toyshop',
  DOG_SHOP: 'Cafe',
  PARKING: 'Parking',
  VALET: 'Valet',
} as const;
