'use client';

import { RESERVATION_EMPTY_COPY } from '@views/guardian-reservation-page/config/guardianReservationEmpty';
import {
  RESERVATION_EMPTY,
  type ReservationEmpty,
  type ReservationKindergarten,
} from '@views/guardian-reservation-page/lib/guardianReservationMain';
import { ReservationKindergartenCard } from '@views/guardian-reservation-page/ui/ReservationKindergartenCard';

function ReservationEmptyState({
  kind,
  kindergarten,
}: {
  kind: ReservationEmpty;
  kindergarten: ReservationKindergarten | null;
}) {
  const copy = RESERVATION_EMPTY_COPY[kind];
  const hasKindergartenCard = kind !== RESERVATION_EMPTY.unlinked && kindergarten !== null;

  return (
    <div className='px-x5 pt-x5 webview:pb-x5 gap-x5 flex min-h-0 flex-1 flex-col pb-[calc(var(--bottom-bar-height)+20px)]'>
      <div className='gap-x1 flex flex-1 flex-col items-center justify-center text-center'>
        {/* 이용권 일러스트만 svg라 next/image 최적화 대상에서 뺀다 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={copy.imageSrc} alt='' className='size-[200px] object-contain' />
        <p className='h2-extrabold text-text-primary'>{copy.title}</p>
        <p className='body1-regular text-text-tertiary whitespace-pre-line'>{copy.body}</p>
      </div>
      {hasKindergartenCard && kindergarten ? <ReservationKindergartenCard kindergarten={kindergarten} /> : null}
    </div>
  );
}

export { ReservationEmptyState };
