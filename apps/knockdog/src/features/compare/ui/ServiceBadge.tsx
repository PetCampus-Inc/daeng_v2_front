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

type ServiceCode = DogBreed | DogService | DogSafetyFacility | VisitorAmenity;

interface ServiceTagBadgeProps {
  code: string;
}

function ServiceTagBadge({ code }: ServiceTagBadgeProps) {
  if (!SERVICE_ICON_MAP[code as ServiceCode]) {
    return null;
  }

  return (
    <div className='flex flex-col items-center'>
      <Icon icon={SERVICE_ICON_MAP[code as ServiceCode]} className='h-8 w-8' />
      <span className='caption1-semibold text-neutral-900'>{TOTAL_SERVICE_MAP[code as ServiceCode]}</span>
    </div>
  );
}

export { type ServiceCode, ServiceTagBadge };
