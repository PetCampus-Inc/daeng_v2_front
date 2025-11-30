import { Icon } from '@knockdog/ui';
import { ServiceBadge } from './ServiceBadge';
import { SERVICE_TAGS, PICKUP_TYPE } from '../config/constant';

interface ServiceBadgeListProps {
  serviceTags: (keyof typeof SERVICE_TAGS)[];
  pickupType: keyof typeof PICKUP_TYPE;
}

function ServiceBadgeList({ serviceTags, pickupType }: ServiceBadgeListProps) {
  const allBadges = [];

  if (!!pickupType && pickupType !== 'NONE') {
    allBadges.push(
      <ServiceBadge key={`pickup-${pickupType}`} variant='solid'>
        <Icon icon={pickupType === 'FREE' ? 'PickupFree' : 'PickupPaid'} className='size-x4' />
        {PICKUP_TYPE[pickupType]}
      </ServiceBadge>
    );
  }

  serviceTags.forEach((tag) => {
    allBadges.push(
      <ServiceBadge key={`service-${tag}`} variant='outline'>
        {SERVICE_TAGS[tag]}
      </ServiceBadge>
    );
  });

  return <BadgeGroup>{allBadges}</BadgeGroup>;
}

export { ServiceBadgeList };

interface BadgeGroupProps {
  children: React.ReactNode[];
}

function BadgeGroup({ children }: BadgeGroupProps) {
  if (!children || children.length === 0) return null;

  return (
    <ul className='gap-x1 scrollbar-hide flex flex-nowrap items-center overflow-x-auto overflow-y-hidden'>
      {children.map((child, index) => (
        <li key={index} className='flex shrink-0 items-center'>
          {child}
        </li>
      ))}
    </ul>
  );
}
