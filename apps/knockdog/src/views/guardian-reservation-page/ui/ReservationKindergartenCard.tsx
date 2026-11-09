'use client';

import { ChevronRight, Paw } from '@knockdog/icons';

import { type ReservationKindergarten } from '@views/guardian-reservation-page/lib/guardianReservationMain';

import { useStackNavigation } from '@shared/lib/bridge';

function ReservationKindergartenCard({ kindergarten }: { kindergarten: ReservationKindergarten }) {
  const { push } = useStackNavigation();

  const handleOpenKindergarten = () => {
    push({
      pathname: `/kindergarten/${kindergarten.placeId}`,
      params: { entrySource: 'kindergarten-list' },
    }).catch(() => undefined);
  };

  return (
    <button
      type='button'
      onClick={handleOpenKindergarten}
      className='border-line-200 radius-r3 bg-bg-0 flex h-[74px] w-full shrink-0 items-center justify-between border p-x4 text-left'
    >
      <span className='gap-x2 flex min-w-0 items-center'>
        <span className='bg-fill-secondary-50 flex size-11 shrink-0 items-center justify-center rounded-lg'>
          <Paw className='text-fill-secondary-300 size-5' aria-hidden />
        </span>
        <span className='flex min-w-0 flex-col items-start'>
          <span className='body1-bold text-text-primary w-full truncate'>{kindergarten.name}</span>
          <span className='body2-regular text-text-secondary w-full truncate'>{kindergarten.address}</span>
        </span>
      </span>
      <ChevronRight className='text-fill-secondary-500 size-6 shrink-0' />
    </button>
  );
}

export { ReservationKindergartenCard };
