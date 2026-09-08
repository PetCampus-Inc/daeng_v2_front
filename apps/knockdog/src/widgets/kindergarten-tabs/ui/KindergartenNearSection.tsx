'use client';

import { useRef } from 'react';
import { useParams } from 'next/navigation';
import { KindergartenNearCard, useKindergartenNearQuery } from '@features/kindergarten-near';
import { useCurrentLocation } from '@shared/lib/geolocation';

interface KindergartenNearSectionProps {
  kindergartenId?: string;
}

const KindergartenNearSection = ({ kindergartenId }: KindergartenNearSectionProps) => {
  const params = useParams<{ id: string }>();
  const id = kindergartenId ?? params?.id;
  const dragStateRef = useRef<{ pointerId: number; startX: number; startScrollLeft: number; hasDragged: boolean } | null>(null);
  const suppressClickRef = useRef(false);

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
        className='scrollbar-hide flex cursor-grab gap-5 overflow-x-auto select-none active:cursor-grabbing'
        onPointerDown={(event) => {
          if (event.pointerType !== 'mouse' || event.button !== 0) return;

          dragStateRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startScrollLeft: event.currentTarget.scrollLeft,
            hasDragged: false,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const dragState = dragStateRef.current;
          if (!dragState || dragState.pointerId !== event.pointerId) return;

          const distance = event.clientX - dragState.startX;
          if (Math.abs(distance) > 4) {
            dragState.hasDragged = true;
            event.preventDefault();
          }
          event.currentTarget.scrollLeft = dragState.startScrollLeft - distance;
        }}
        onPointerUp={(event) => {
          const dragState = dragStateRef.current;
          if (!dragState || dragState.pointerId !== event.pointerId) return;

          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
          dragStateRef.current = null;

          if (!dragState.hasDragged) return;
          suppressClickRef.current = true;
          window.setTimeout(() => {
            suppressClickRef.current = false;
          }, 0);
        }}
        onPointerCancel={() => {
          dragStateRef.current = null;
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
