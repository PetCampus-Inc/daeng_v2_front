'use client';

import { useState } from 'react';

import { ChevronRight, Notification, RsvHistory } from '@knockdog/icons';
import { MembershipCard, SelectDogCard, UpcomingRsvCard } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

import { useGuardianSelectedPet } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPet';
import { formatReservationWhen } from '@views/guardian-reservation-page/lib/guardianReservationMain';

import { RESERVATION_SCOPE, useGuardianReservationQuery } from '@entities/guardian-reservation';
import { formatAge, type Pet } from '@entities/pet';

import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { DogProfileAvatar } from '@shared/ui/dog-profile-avatar';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';

const PROFILE_SURFACE = 'bg-bg-0 rounded-b-[24px] shadow-[0_11px_24px_rgba(235,213,189,0.1)]';

function ReservationEmptySchedule() {
  return (
    <div className='radius-r3 px-x4 py-x5 flex w-full items-center justify-center bg-[linear-gradient(-87deg,var(--color-primitive-orange-400)_12%,var(--color-primitive-orange-500)_93%)]'>
      <p className='body1-bold text-text-primary-inverse'>아직 예정된 등원 일정이 없어요</p>
    </div>
  );
}

function ReservationTicketManageRow({ onClick }: { onClick: () => void }) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='bg-bg-0 radius-r3 p-x4 flex w-full items-center justify-between text-left'
    >
      <span className='body1-bold text-text-primary'>이용권 관리</span>
      <ChevronRight className='text-text-primary shrink-0' />
    </button>
  );
}

function petAgeLabel(birthYear: number) {
  return formatAge(birthYear);
}

function petWeightLabel(weight: number) {
  if (!weight) return '';
  return `${weight}kg`;
}

function PetAvatar({ pet }: { pet: Pet }) {
  return (
    <DogProfileAvatar
      name={pet.name}
      imageUrl={pet.profileImage}
      className='size-full border-0'
      pawClassName='text-fill-secondary-400'
    />
  );
}

function ReservationDogList({ pets, onSelect }: { pets: Pet[]; onSelect: (petId: string) => void }) {
  return (
    <div className='bg-bg-0 absolute inset-x-0 top-full z-20 flex flex-col overflow-hidden rounded-b-[24px] shadow-[0_11px_24px_rgba(235,213,189,0.1)]'>
      {pets.map((pet) => (
        <SelectDogCard
          key={pet.id}
          variant='list'
          name={pet.name}
          breed={pet.breed}
          age={petAgeLabel(pet.birthYear)}
          weight={petWeightLabel(pet.weight)}
          onClick={() => onSelect(pet.id)}
        >
          <PetAvatar pet={pet} />
        </SelectDogCard>
      ))}
    </div>
  );
}

function GuardianReservationPage() {
  const { push } = useStackNavigation();
  const { pets, selectedPet, setSelectedPetId, isPetsReady, isPetsError } = useGuardianSelectedPet();
  const [isDogListOpen, setIsDogListOpen] = useState(false);
  const petId = selectedPet?.id ?? '';
  const upcomingQuery = useGuardianReservationQuery(petId, RESERVATION_SCOPE.upcoming);
  const upcoming = upcomingQuery.data?.[0];
  const canSelectPet = pets.length > 1;

  const handleToggleDogList = () => {
    if (!canSelectPet) return;
    setIsDogListOpen((isOpen) => !isOpen);
  };

  const handleSelectDog = (nextPetId: string) => {
    setSelectedPetId(nextPetId);
    setIsDogListOpen(false);
  };

  const handleOpenNotification = () => {
    push({ pathname: route.notification.root }).catch(() => undefined);
  };

  const handleOpenTickets = () => {
    if (!selectedPet) return;
    push({ pathname: route.reservation.tickets.root, query: { dogId: selectedPet.id } }).catch(() => undefined);
  };

  const handleOpenList = () => {
    if (!selectedPet) return;
    push({ pathname: route.reservation.list.root, query: { dogId: selectedPet.id } }).catch(() => undefined);
  };

  if (!isPetsReady) {
    return <DelayedLoadingSpinner isLoading layout='content' className='py-10' />;
  }

  if (isPetsError) {
    return <p className='body2-regular text-text-secondary py-10 text-center'>강아지를 불러오지 못했어요</p>;
  }

  if (!selectedPet) return null;

  return (
    <main className='bg-bg-50 flex min-h-0 flex-1 flex-col'>
      <div className='relative z-20'>
        <div className={cn('overflow-hidden', isDogListOpen ? 'bg-bg-0' : PROFILE_SURFACE)}>
          <header className='border-line-100 pl-x5 pr-x4 flex h-[66px] items-center justify-between border-b'>
            <h1 className='h2-extrabold text-text-primary px-x1'>예약</h1>
            <div className='gap-x3_5 flex items-center'>
              <button type='button' aria-label='내 예약' className='text-text-primary' onClick={handleOpenList}>
                <RsvHistory />
              </button>
              <button type='button' aria-label='알림' className='text-text-primary' onClick={handleOpenNotification}>
                <Notification unread />
              </button>
            </div>
          </header>
          <SelectDogCard
            isExpanded={isDogListOpen}
            showIcon={canSelectPet}
            name={selectedPet.name}
            breed={selectedPet.breed}
            age={petAgeLabel(selectedPet.birthYear)}
            weight={petWeightLabel(selectedPet.weight)}
            className='rounded-none shadow-none'
            onClick={canSelectPet ? handleToggleDogList : undefined}
          >
            <PetAvatar pet={selectedPet} />
          </SelectDogCard>
        </div>
        {isDogListOpen && canSelectPet ? <ReservationDogList pets={pets} onSelect={handleSelectDog} /> : null}
      </div>

      {isDogListOpen && canSelectPet ? (
        <button
          type='button'
          aria-label='강아지 목록 닫기'
          className='fixed inset-0 z-10 bg-black/40'
          onClick={() => setIsDogListOpen(false)}
        />
      ) : null}

      <div className='px-x4 py-x8 gap-x9 flex flex-col'>
        <section className='gap-x2_5 flex flex-col'>
          <h2 className='body1-bold text-text-primary'>다가오는 예약</h2>
          {upcomingQuery.isLoading ? (
            <DelayedLoadingSpinner isLoading layout='content' className='py-6' />
          ) : upcomingQuery.isError ? (
            <p className='body2-regular text-text-secondary py-6 text-center'>예약을 불러오지 못했어요</p>
          ) : upcoming ? (
            <UpcomingRsvCard
              title={formatReservationWhen(upcoming.startsAt)}
              place={upcoming.schoolName}
              onClick={handleOpenList}
            />
          ) : (
            <ReservationEmptySchedule />
          )}
        </section>

        <section className='gap-x2_5 flex flex-col'>
          <h2 className='body1-bold text-text-primary'>사용 가능 이용권</h2>
          <MembershipCard state='empty' />
          <ReservationTicketManageRow onClick={handleOpenTickets} />
        </section>
      </div>
    </main>
  );
}

export { GuardianReservationPage };
