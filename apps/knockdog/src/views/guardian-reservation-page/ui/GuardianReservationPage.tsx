'use client';

import { useMemo, useState } from 'react';

import { ChevronRight, Notification, RsvHistory } from '@knockdog/icons';
import { MembershipCard, MembershipCardStatusBadge, SelectDogCard, UpcomingRsvCard } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

import { createReservationMainMock } from '@views/guardian-reservation-page/config/guardianReservationMainMock';
import { ReservationEmptyState } from '@views/guardian-reservation-page/ui/ReservationEmptyState';
import {
  formatDogAge,
  formatDogWeight,
  formatReservationWhen,
  formatTicketPeriod,
  getTicketBadge,
  listUsableTickets,
  resolveReservationEmpty,
  type ReservationDog,
} from '@views/guardian-reservation-page/lib/guardianReservationMain';

import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

const PROFILE_SURFACE = 'bg-bg-0 rounded-b-[24px] shadow-[0_11px_24px_rgba(235,213,189,0.1)]';

function ReservationEmptySchedule() {
  return (
    <div className='radius-r3 flex w-full items-center justify-center bg-[linear-gradient(-87deg,var(--color-primitive-orange-400)_12%,var(--color-primitive-orange-500)_93%)] px-x4 py-x5'>
      <p className='body1-bold text-text-primary-inverse'>아직 예정된 등원 일정이 없어요</p>
    </div>
  );
}

function ReservationTicketManageRow() {
  return (
    <button type='button' className='bg-bg-0 radius-r3 p-x4 flex w-full items-center justify-between text-left'>
      <span className='body1-bold text-text-primary'>이용권 관리</span>
      <ChevronRight className='text-text-primary shrink-0' />
    </button>
  );
}

function ReservationDogList({
  dogs,
  onSelect,
}: {
  dogs: ReservationDog[];
  onSelect: (dogId: string) => void;
}) {
  return (
    <div className='bg-bg-0 absolute inset-x-0 top-full z-20 flex flex-col overflow-hidden rounded-b-[24px] shadow-[0_11px_24px_rgba(235,213,189,0.1)]'>
      {dogs.map((dog) => (
        <SelectDogCard
          key={dog.id}
          variant='list'
          name={dog.name}
          breed={dog.breed}
          age={formatDogAge(dog.age)}
          weight={formatDogWeight(dog.weightKg)}
          onClick={() => onSelect(dog.id)}
        />
      ))}
    </div>
  );
}

function GuardianReservationPage() {
  const { push } = useStackNavigation();
  const today = useMemo(() => new Date(), []);
  const dogs = useMemo(() => createReservationMainMock(today), [today]);
  const [selectedDogId, setSelectedDogId] = useState(dogs[0]?.id ?? '');
  const [isDogListOpen, setIsDogListOpen] = useState(false);
  const selectedDog = dogs.find((dog) => dog.id === selectedDogId) ?? dogs[0];
  const usableTickets = selectedDog ? listUsableTickets(selectedDog.tickets) : [];
  const emptyKind = selectedDog
    ? resolveReservationEmpty(selectedDog.link, Boolean(selectedDog.upcoming), usableTickets.length)
    : null;

  const handleToggleDogList = () => {
    setIsDogListOpen((isOpen) => !isOpen);
  };

  const handleSelectDog = (dogId: string) => {
    setSelectedDogId(dogId);
    setIsDogListOpen(false);
  };

  const handleOpenNotification = () => {
    push({ pathname: route.notification.root }).catch(() => undefined);
  };

  if (!selectedDog) return null;

  return (
    <main className='bg-bg-50 flex min-h-0 flex-1 flex-col'>
      <div className='relative z-20'>
        <div className={cn('overflow-hidden', isDogListOpen ? 'bg-bg-0' : PROFILE_SURFACE)}>
          <header className='border-line-100 pl-x5 pr-x4 flex h-[66px] items-center justify-between border-b'>
            <h1 className='h2-extrabold text-text-primary px-x1'>예약</h1>
            <div className='gap-x3_5 flex items-center'>
              <button type='button' aria-label='내 예약' className='text-text-primary'>
                <RsvHistory />
              </button>
              <button type='button' aria-label='알림' className='text-text-primary' onClick={handleOpenNotification}>
                <Notification unread />
              </button>
            </div>
          </header>
          <SelectDogCard
            isExpanded={isDogListOpen}
            name={selectedDog.name}
            breed={selectedDog.breed}
            age={formatDogAge(selectedDog.age)}
            weight={formatDogWeight(selectedDog.weightKg)}
            className='rounded-none shadow-none'
            onClick={handleToggleDogList}
          />
        </div>
        {isDogListOpen ? <ReservationDogList dogs={dogs} onSelect={handleSelectDog} /> : null}
      </div>

      {isDogListOpen ? (
        <button
          type='button'
          aria-label='강아지 목록 닫기'
          className='fixed inset-0 z-10 bg-black/40'
          onClick={() => setIsDogListOpen(false)}
        />
      ) : null}

      {emptyKind ? (
        <ReservationEmptyState kind={emptyKind} kindergarten={selectedDog.kindergarten} />
      ) : (
        <div className='px-x4 py-x8 gap-x9 flex flex-col'>
          <section className='gap-x2_5 flex flex-col'>
            <h2 className='body1-bold text-text-primary'>다가오는 예약</h2>
            {selectedDog.upcoming ? (
              <UpcomingRsvCard
                title={formatReservationWhen(selectedDog.upcoming.startsAt)}
                place={selectedDog.upcoming.placeName}
              />
            ) : (
              <ReservationEmptySchedule />
            )}
          </section>

          <section className='gap-x2_5 flex flex-col'>
            <h2 className='body1-bold text-text-primary'>사용 가능 이용권</h2>
            {usableTickets.length === 0 ? (
              <MembershipCard state='empty' />
            ) : (
              usableTickets.map((ticket) => {
                const badge = getTicketBadge(ticket.endsOn, today);

                return (
                  <MembershipCard
                    key={ticket.id}
                    state='reservation'
                    title={`${ticket.totalCount}회권`}
                    remainingCount={ticket.remainingCount}
                    period={formatTicketPeriod(ticket.endsOn)}
                    badge={<MembershipCardStatusBadge status={badge.status}>{badge.label}</MembershipCardStatusBadge>}
                  />
                );
              })
            )}
            <ReservationTicketManageRow />
          </section>
        </div>
      )}
    </main>
  );
}

export { GuardianReservationPage };
