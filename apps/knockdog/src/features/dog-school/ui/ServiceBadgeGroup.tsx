import { Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import { useRef, useEffect, useState, useCallback } from 'react';
import { ServiceBadge } from './ServiceBadge';
import { ServiceTag, PickupType } from '@entities/dog-school';

interface ServiceBadgeGroupProps {
  serviceTags: (keyof typeof ServiceTag)[];
  pickupType: keyof typeof PickupType;
}

export function ServiceBadgeGroup({
  serviceTags,
  pickupType,
}: ServiceBadgeGroupProps) {
  const allBadges = [];

  if (pickupType !== 'NONE') {
    allBadges.push(
      <ServiceBadge key={`pickup-${pickupType}`} variant='solid'>
        <Icon
          icon={pickupType === 'FREE' ? 'PickupFree' : 'PickupPaid'}
          className='size-x4'
        />
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

// Reference: https://primer.style/product/components/label-group/#truncated
function BadgeGroup({ children }: BadgeGroupProps) {
  const containerRef = useRef<HTMLUListElement>(null);
  const [visibilityMap, setVisibilityMap] = useState<Record<string, boolean>>(
    {}
  );
  const [buttonClientRect, setButtonClientRect] = useState<DOMRect>({
    width: 0,
    right: 0,
    height: 0,
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    bottom: 0,
    toJSON: () => undefined,
  });

  const moreButtonRef: React.RefCallback<HTMLButtonElement> = useCallback(
    (node) => {
      if (node !== null) {
        const nodeClientRect = node.getBoundingClientRect();

        if (
          nodeClientRect.width !== buttonClientRect.width ||
          nodeClientRect.right !== buttonClientRect.right
        ) {
          setButtonClientRect(nodeClientRect);
        }

        // @ts-expect-error you can set `.current` on ref objects or ref callbacks in React
        moreButtonRef.current = node;
      }
    },
    [buttonClientRect]
  );

  const hiddenItemIds = Object.keys(visibilityMap).filter(
    (key) => !visibilityMap[key]
  );

  useEffect(() => {
    if (!containerRef.current || !children || children.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        const updatedEntries: Record<string, boolean> = {};

        for (const entry of entries) {
          // Checks which children are intersecting the root container
          const targetId = entry.target.getAttribute('data-index');
          if (targetId) {
            updatedEntries[targetId] = entry.isIntersecting;
          }
        }

        // Updates the visibility map based on the intersection results.
        setVisibilityMap((prev) => ({
          ...prev,
          ...updatedEntries,
        }));
      },
      {
        root: containerRef.current,
        rootMargin: `0px -${buttonClientRect.width}px 0px 0px`,
        threshold: 0.999,
      }
    );

    // Start observing each badge element
    for (const item of containerRef.current?.children || []) {
      if (item.getAttribute('data-index')) {
        observer.observe(item);
      }
    }

    return () => observer.disconnect();
  }, [buttonClientRect, children]);

  if (!children || children.length === 0) return null;

  return (
    <ul
      ref={containerRef}
      className='gap-x1 flex flex-nowrap items-center overflow-hidden'
    >
      {children.map((child, index) => (
        <li
          key={index}
          data-index={index}
          className={cn(
            'flex shrink-0 items-center',
            hiddenItemIds.includes(index.toString()) &&
              'pointer-events-none invisible order-last'
          )}
        >
          {child}
        </li>
      ))}

      {/* 외+n 표시 */}
      {hiddenItemIds.length > 0 && (
        <span
          ref={moreButtonRef}
          className='caption1-semibold text-text-secondary shrink-0'
        >
          외+{hiddenItemIds.length}
        </span>
      )}
    </ul>
  );
}
