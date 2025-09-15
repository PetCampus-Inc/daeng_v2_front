import { Icon } from '@knockdog/ui';
import { ServiceBadge } from './ServiceBadge';
import { PICKUP_TYPE_MAP, ALL_SERVICE_MAP } from '../model/constants/kindergarten';

interface ServiceBadgeListProps {
  serviceTags: (keyof typeof ALL_SERVICE_MAP)[];
  pickupType: keyof typeof PICKUP_TYPE_MAP;
}

function ServiceBadgeList({ serviceTags, pickupType }: ServiceBadgeListProps) {
  const allBadges = [];

  if (pickupType !== 'NONE') {
    allBadges.push(
      <ServiceBadge key={`pickup-${pickupType}`} variant='solid'>
        <Icon icon={pickupType === 'FREE' ? 'PickupFree' : 'PickupPaid'} className='size-x4' />
        {PICKUP_TYPE_MAP[pickupType]}
      </ServiceBadge>
    );
  }

  serviceTags.forEach((tag) => {
    allBadges.push(
      <ServiceBadge key={`service-${tag}`} variant='outline'>
        {ALL_SERVICE_MAP[tag]}
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
