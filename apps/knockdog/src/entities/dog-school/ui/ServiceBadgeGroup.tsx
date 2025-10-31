import { Icon } from '@knockdog/ui';
import { ServiceTag, PickupType } from '../model/mock';
// FIXME: fsd import 위반임..! serviceBadgeGroup을 shared로 빼야할지 논의 필요
import { ServiceBadge } from '@entities/kindergarten/ui/ServiceBadge';

interface ServiceBadgeGroupProps {
  serviceTags: (keyof typeof ServiceTag)[];
  pickupType: keyof typeof PickupType;
}

export function ServiceBadgeGroup({ serviceTags, pickupType }: ServiceBadgeGroupProps) {
  const allBadges = [];

  if (pickupType !== 'NONE') {
    allBadges.push(
      <ServiceBadge key={`pickup-${pickupType}`} variant='solid'>
        <Icon icon={pickupType === 'FREE' ? 'PickupFree' : 'PickupPaid'} className='size-x4' />
        {PickupType[pickupType]}
      </ServiceBadge>
    );
  }

  serviceTags.forEach((tag) => {
    allBadges.push(
      <ServiceBadge key={`service-${tag}`} variant='outline'>
        {ServiceTag[tag]}
      </ServiceBadge>
    );
  });

  return <BadgeGroup>{allBadges}</BadgeGroup>;
}

interface BadgeGroupProps {
  children: React.ReactNode[];
}

function BadgeGroup({ children }: BadgeGroupProps) {
  if (!children || children.length === 0) return null;

  return (
    <ul className='gap-x1 scrollbar-hide flex items-center overflow-x-auto whitespace-nowrap'>
      {children.map((child, index) => (
        <li key={index} className='flex shrink-0 items-center'>
          {child}
        </li>
      ))}
    </ul>
  );
}
