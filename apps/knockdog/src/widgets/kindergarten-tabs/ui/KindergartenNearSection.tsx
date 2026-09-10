'use client';

import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { KindergartenNearCard, useKindergartenNearQuery } from '@features/kindergarten-near';
import { useCurrentLocation } from '@shared/lib/geolocation';

interface KindergartenNearSectionProps {
  kindergartenId?: string;
}

const KindergartenNearSection = ({ kindergartenId }: KindergartenNearSectionProps) => {
  const params = useParams<{ id: string }>();
  const id = kindergartenId ?? params?.id;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{ pointerId: number; startX: number; startScrollLeft: number; hasDragged: boolean } | null>(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const dragState = dragStateRef.current;
      const scrollContainer = scrollContainerRef.current;
      if (!dragState || !scrollContainer || dragState.pointerId !== event.pointerId) return;

      const distance = event.clientX - dragState.startX;
      if (!dragState.hasDragged) {
        if (Math.abs(distance) <= 4) return;

        dragState.hasDragged = true;
      }

      event.preventDefault();
      scrollContainer.scrollLeft = dragState.startScrollLeft - distance;
    };

    const handlePointerEnd = (event: PointerEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState || dragState.pointerId !== event.pointerId) return;

      dragStateRef.current = null;
      if (!dragState.hasDragged) return;

      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerEnd);
    window.addEventListener('pointercancel', handlePointerEnd);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerEnd);
      window.removeEventListener('pointercancel', handlePointerEnd);
    };
  }, []);

  if (!id) throw new Error('Company ID is required for near section');

  const { position } = useCurrentLocation();
  const { lng, lat } = position || { lng: 126.883439, lat: 37.511281 };

  const { data: nearKindergartens = [] } = useKindergartenNearQuery(id, lng, lat);

  return (
    <div className='mb-6 px-4'>
      <div className='mb-3'>
        <span className='body1-bold'>이 근처 다른 유치원은 어때요?</span>
      </div>

      <div
        ref={scrollContainerRef}
        className='scrollbar-hide flex cursor-grab gap-5 overflow-x-auto select-none active:cursor-grabbing'
        onPointerDown={(event) => {
          if (event.pointerType !== 'mouse' || event.button !== 0) return;

          dragStateRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startScrollLeft: event.currentTarget.scrollLeft,
            hasDragged: false,
          };
        }}
        onClickCapture={(event) => {
          if (!suppressClickRef.current) return;

          event.preventDefault();
          event.stopPropagation();
        }}
      >
        {nearKindergartens.map((dogSchool) => (
          <KindergartenNearCard key={dogSchool.id} {...dogSchool} />
        ))}
      </div>
    </div>
  );
};

export { KindergartenNearSection };
