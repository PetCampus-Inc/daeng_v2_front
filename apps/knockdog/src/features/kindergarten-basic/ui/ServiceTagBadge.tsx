import { Icon } from '@knockdog/ui';
import {
  DOG_BREED_MAP,
  DOG_SERVICE_MAP,
  DOG_SAFETY_FACILITY_MAP,
  VISITOR_AMENITY_MAP,
  SERVICE_ICON_MAP,
  type DogBreed,
  type DogService,
  type DogSafetyFacility,
  type VisitorAmenity,
} from '@entities/kindergarten';

const TOTAL_SERVICE_MAP = {
  ...DOG_BREED_MAP,
  ...DOG_SERVICE_MAP,
  ...DOG_SAFETY_FACILITY_MAP,
  ...VISITOR_AMENITY_MAP,
};

interface ServiceTagBadgeProps {
  code: DogBreed | DogService | DogSafetyFacility | VisitorAmenity;
}

function ServiceTagBadge({ code }: ServiceTagBadgeProps) {
  return (
    <div className='flex flex-col items-center'>
      <Icon icon={SERVICE_ICON_MAP[code]} className='h-8 w-8' />
      <span className='text-size-caption1 text-text-secondary'>{TOTAL_SERVICE_MAP[code]}</span>
    </div>
  );
}

export { ServiceTagBadge };
