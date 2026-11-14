'use client';

import { useSearchParams } from 'next/navigation';

import { ActionButton } from '@knockdog/ui';

import { RESERVATION_HOURS_COPY } from '@views/guardian-reservation-page/config/guardianReservationHours';
import { leaveReservationTab } from '@views/guardian-reservation-page/lib/leaveReservationTab';
import { type ReservationKindergarten } from '@views/guardian-reservation-page/lib/guardianReservationMain';
import { useReservationDogs } from '@views/guardian-reservation-page/model/useReservationDogs';
import { ReservationKindergartenCard } from '@views/guardian-reservation-page/ui/ReservationKindergartenCard';

import { Header } from '@widgets/Header';

import { useNativeBackHandler, useStackNavigation, useTabNavigation } from '@shared/lib/bridge';

function GuardianReservationHoursPage({
  kindergarten: kindergartenFromParent,
}: {
  kindergarten?: ReservationKindergarten | null;
}) {
  const copy = RESERVATION_HOURS_COPY;
  const searchParams = useSearchParams();
  const dogId = searchParams.get('dogId') ?? '';
  const { back } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const { dogs } = useReservationDogs();
  const kindergarten =
    kindergartenFromParent !== undefined
      ? kindergartenFromParent
      : (dogs.find((dog) => dog.id === dogId)?.kindergarten ?? null);

  const handleBack = () => {
    leaveReservationTab(back, navigateToTab);
  };

  useNativeBackHandler(handleBack);

  return (
    <div className='bg-bg-0 flex h-full min-h-0 flex-1 flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>{copy.title}</Header.Title>
      </Header>

      <div className='px-x5 py-x4 gap-x5 flex min-h-0 flex-1 flex-col items-center justify-center'>
        <div className='gap-x1 flex flex-col items-center text-center'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={copy.imageSrc} alt='' className='size-[200px] object-contain' />
          <p className='h2-extrabold text-text-primary'>{copy.heading}</p>
          <p className='body1-regular text-text-tertiary'>{copy.body}</p>
        </div>
        {kindergarten ? <ReservationKindergartenCard kindergarten={kindergarten} /> : null}
      </div>

      <div className='bg-bg-0 p-x4 shrink-0'>
        <ActionButton type='button' variant='primaryFill' size='large' className='body1-bold' disabled>
          {copy.action}
        </ActionButton>
      </div>
    </div>
  );
}

export { GuardianReservationHoursPage };
