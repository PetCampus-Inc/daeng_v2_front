import { Icon } from '@knockdog/ui';
import {
  DogBreed,
  ServiceTag,
  type 견종,
  type 강아지_서비스,
  type 강아지_안전_시설,
  type 방문객_편의_시설,
} from '../model/mock';
import type { IconName } from '@knockdog/icons';

const iconMap: Record<견종 | 강아지_서비스 | 강아지_안전_시설 | 방문객_편의_시설, IconName> = {
  ALL_BREEDS: 'Alldogs',
  SMALL_DOGS_ONLY: 'Smalldog',
  MEDIUM_LARGE_DOGS_ONLY: 'Largedog',

  DAYCARE: 'Daycare',
  HOTEL: 'Hotel',
  STAY_24H: 'Time24',
  TEMPERAMENT: 'Personalitycheck',
  SPLIT_CLASS: 'Babydelivery',
  BATH_SERVICE: 'Bath',
  WALK: 'Walk',
  TRAINING: 'Training',
  GROOMING: 'Salon',
  REHABILITATION: 'Rehabilitation',

  NON_SLIP: 'Floor',
  CCTV: 'Cctv',
  PLAYGROUND: 'Playground',
  ROOFTOP: 'Rooftop',
  TERRACE: 'Terrace',
  TRAINING_GROUND: 'Field',
  YARD: 'Frontyard',

  PICK_DROP: 'PickdropLine',
  DIARY: 'Noticebook',
  DOG_SHOP: 'Toyshop',
  DOG_CAFE: 'Cafe',
  PARKING: 'Parking',
  VALET: 'Valet',
};

const labelMap: Record<견종 | 강아지_서비스 | 강아지_안전_시설 | 방문객_편의_시설, string> = {
  ...DogBreed,
  ...ServiceTag,
};
interface IconWithLabelProps {
  code: 견종 | 강아지_서비스 | 강아지_안전_시설 | 방문객_편의_시설;
}

export function IconWithLabel({ code }: IconWithLabelProps) {
  return (
    <div className='flex flex-col items-center'>
      <Icon icon={iconMap[code]} className='h-8 w-8' />
      <span className='text-size-caption1 text-text-secondary'>{labelMap[code]}</span>
    </div>
  );
}
