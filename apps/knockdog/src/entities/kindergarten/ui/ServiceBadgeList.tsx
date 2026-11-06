import { Icon } from '@knockdog/ui';
import { useRef } from 'react';
import { ServiceBadge } from './ServiceBadge';
import { SERVICE_TAGS, PICKUP } from '../config/enum';

interface ServiceBadgeListProps {
  serviceTags: (keyof typeof SERVICE_TAGS)[];
  pickupType: keyof typeof PICKUP;
}

function ServiceBadgeList({ serviceTags, pickupType }: ServiceBadgeListProps) {
  const allBadges = [];

  if (!!pickupType && pickupType !== 'NONE') {
    allBadges.push(
      <ServiceBadge key={`pickup-${pickupType}`} variant='solid'>
        <Icon icon={pickupType === 'FREE_PICKUP' ? 'PickupFree' : 'PickupPaid'} className='size-x4' />
        {PICKUP[pickupType]}
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
  const dragStateRef = useRef<{ pointerId: number; startX: number; startScrollLeft: number } | null>(null);

  if (!children || children.length === 0) return null;

  return (
    <ul
      className='gap-x1 scrollbar-hide flex cursor-grab flex-nowrap items-center overflow-x-auto overflow-y-hidden select-none active:cursor-grabbing'
      onPointerDown={(event) => {
        if (event.pointerType !== 'mouse' || event.button !== 0) return;

        dragStateRef.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startScrollLeft: event.currentTarget.scrollLeft,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const dragState = dragStateRef.current;
        if (!dragState || dragState.pointerId !== event.pointerId) return;

        event.preventDefault();
        event.currentTarget.scrollLeft = dragState.startScrollLeft - (event.clientX - dragState.startX);
      }}
      onPointerUp={(event) => {
        if (dragStateRef.current?.pointerId !== event.pointerId) return;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        dragStateRef.current = null;
      }}
      onPointerCancel={() => {
        dragStateRef.current = null;
      }}
    >
      {children.map((child, index) => (
        <li key={index} className='flex shrink-0 items-center'>
          {child}
        </li>
      ))}
    </ul>
  );
}
