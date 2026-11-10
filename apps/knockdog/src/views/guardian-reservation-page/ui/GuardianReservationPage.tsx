'use client';

import { useState } from 'react';
import Image from 'next/image';

import { ChevronRight, Notification, RsvHistory } from '@knockdog/icons';
import { ActionButton, MembershipCard, MembershipCardStatusBadge, SelectDogCard, UpcomingRsvCard } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

import { useGuardianSelectedPet } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPet';
import { formatReservationWhen } from '@views/guardian-reservation-page/lib/guardianReservationMain';

import { RESERVATION_SCOPE, useGuardianReservationQuery } from '@entities/guardian-reservation';
import { useGuardianTicketCardQuery, type GuardianTicket } from '@entities/guardian-ticket';
import { formatAge, type Pet } from '@entities/pet';

import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { DogProfileAvatar } from '@shared/ui/dog-profile-avatar';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';

const PROFILE_SURFACE = 'bg-bg-0 rounded-b-[24px] shadow-[0_11px_24px_rgba(235,213,189,0.1)]';

const RESERVATION_NO_PET = {
  imageSrc: '/images/img_empty_no_pet.svg',
  imageAlt: '등록된 강아지 없음',
  prompt: '강아지를 등록해 주세요',
  title: '아직 등록된 강아지가 없어요',
  description: '우리 집 강아지를 등록하고,\n다니는 유치원과 연결해 보세요.',
  ctaLabel: '강아지 등록하기',
} as const;

function ReservationNoPetState() {
  const { push } = useStackNavigation();

  const handleRegisterClick = () => {
    push({ pathname: route.mypage.pet.add.root }).catch(() => undefined);
  };

  return (
    <div className='px-x5 pt-x5 pb-[calc(var(--bottom-bar-height)+20px)] webview:pb-x5 flex min-h-0 w-full flex-1 flex-col items-center justify-between'>
      <div className='flex w-full flex-1 flex-col items-center justify-center gap-1'>
        <Image
          src={RESERVATION_NO_PET.imageSrc}
          alt={RESERVATION_NO_PET.imageAlt}
          width={200}
          height={200}
          priority
          unoptimized
        />
        <div className='flex w-full flex-col items-center gap-1 text-center'>
          <p className='h2-extrabold text-text-primary'>{RESERVATION_NO_PET.title}</p>
          <p className='body1-regular text-text-tertiary whitespace-pre-line'>{RESERVATION_NO_PET.description}</p>
        </div>
      </div>
      <ActionButton type='button' variant='primaryFill' size='large' className='w-full' onClick={handleRegisterClick}>
        {RESERVATION_NO_PET.ctaLabel}
      </ActionButton>
    </div>
  );
}

function ReservationEmptySchedule() {
  return (
    <div className='radius-r3 px-x4 py-x5 flex w-full items-center justify-center bg-[linear-gradient(-87deg,var(--color-primitive-orange-400)_12%,var(--color-primitive-orange-500)_93%)]'>
      <p className='body1-bold text-text-primary-inverse'>아직 예정된 등원 일정이 없어요</p>
    </div>
  );
}

function ticketPeriod(ticket: GuardianTicket) {
  const startsOn = ticket.startsOn.replaceAll('-', '.');
  if (!ticket.endsOn) return '이용 기간 무제한';
  return `${startsOn} ~ ${ticket.endsOn.replaceAll('-', '.')}`;
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
  const { pets, selectedPet, setSelectedPetId, isPetsReady, isPetsError, hasNoPet } = useGuardianSelectedPet();
  const [isChevronOpen, setIsChevronOpen] = useState(false);
  const petId = selectedPet?.id ?? '';
  const upcomingQuery = useGuardianReservationQuery(petId, RESERVATION_SCOPE.upcoming);
  const ticketQuery = useGuardianTicketCardQuery(petId);
  const upcoming = upcomingQuery.data?.[0];
  const tickets = ticketQuery.data?.tickets ?? [];
  const canOpenDogList = pets.length > 1;
  const isDogListOpen = isChevronOpen && canOpenDogList;

  const handleToggleDogList = () => {
    setIsChevronOpen((isOpen) => !isOpen);
  };

  const handleSelectDog = (nextPetId: string) => {
    setSelectedPetId(nextPetId);
    setIsChevronOpen(false);
  };

  const handleOpenNotification = () => {
    push({ pathname: route.notification.root }).catch(() => undefined);
  };

  const handleOpenTickets = () => {
    if (!selectedPet) return;
    push({ pathname: route.reservation.tickets.root, query: { dogId: selectedPet.id } }).catch(() => undefined);
  };

  const handleReserve = (ticketId: string) => {
    if (!selectedPet) return;
    push({
      pathname: route.reservation.time.root,
      query: { dogId: selectedPet.id, ticketId },
    }).catch(() => undefined);
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

  if (hasNoPet || !selectedPet) {
    return (
      <main className='bg-bg-50 flex min-h-0 flex-1 flex-col'>
        <div className={PROFILE_SURFACE}>
          <header className='border-line-100 pl-x5 pr-x4 flex h-[66px] items-center justify-between border-b'>
            <h1 className='h2-extrabold text-text-primary px-x1'>예약</h1>
            <div className='gap-x3_5 flex items-center'>
              <button type='button' aria-label='내 예약' className='text-text-primary' onClick={handleOpenList}>
                <RsvHistory />
              </button>
              <button type='button' aria-label='알림' className='text-text-primary' onClick={handleOpenNotification}>
                <Notification unread className='translate-y-[3px]' />
              </button>
            </div>
          </header>
          <div className='gap-x4 px-x6 py-x5 flex items-center'>
            <DogProfileAvatar name='강아지' className='size-[52px] border-line-100' />
            <p className='h3-extrabold text-text-primary'>{RESERVATION_NO_PET.prompt}</p>
          </div>
        </div>
        <ReservationNoPetState />
      </main>
    );
  }

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
                <Notification unread className='translate-y-[3px]' />
              </button>
            </div>
          </header>
          <SelectDogCard
            isExpanded={isChevronOpen}
            name={selectedPet.name}
            breed={selectedPet.breed}
            age={petAgeLabel(selectedPet.birthYear)}
            weight={petWeightLabel(selectedPet.weight)}
            className='rounded-none shadow-none'
            onClick={handleToggleDogList}
          >
            <PetAvatar pet={selectedPet} />
          </SelectDogCard>
        </div>
        {isDogListOpen ? <ReservationDogList pets={pets} onSelect={handleSelectDog} /> : null}
      </div>

      {isDogListOpen ? (
        <button
          type='button'
          aria-label='강아지 목록 닫기'
          className='fixed inset-0 z-10 bg-black/40'
          onClick={() => setIsChevronOpen(false)}
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
          {ticketQuery.isLoading ? (
            <DelayedLoadingSpinner isLoading layout='content' className='py-6' />
          ) : ticketQuery.isError ? (
            <p className='body2-regular text-text-secondary py-6 text-center'>이용권을 불러오지 못했어요</p>
          ) : tickets.length === 0 ? (
            <MembershipCard state='empty' />
          ) : (
            tickets.map((ticket) => (
              <MembershipCard
                key={ticket.id}
                state='reservation'
                title={ticket.name}
                period={ticketPeriod(ticket)}
                remainingCount={ticket.remainingCount}
                badge={
                  <MembershipCardStatusBadge status={ticket.showDDay ? 'soon' : 'active'}>
                    {ticket.showDDay && ticket.daysLeft != null ? `D-${ticket.daysLeft}` : '사용 중'}
                  </MembershipCardStatusBadge>
                }
                onReserve={ticket.reservable ? () => handleReserve(ticket.id) : undefined}
              />
            ))
          )}
          <ReservationTicketManageRow onClick={handleOpenTickets} />
        </section>
      </div>
    </main>
  );
}

export { GuardianReservationPage };
