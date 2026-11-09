'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { ChevronRight, Plus } from '@knockdog/icons';
import { ActionButton, Divider, StatusFilterChip, Tabs, TabsList, TabsTrigger } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

import { RESERVATION_LIST_COPY } from '@views/guardian-reservation-page/config/guardianReservationList';
import { createReservationMainMock } from '@views/guardian-reservation-page/config/guardianReservationMainMock';
import {
  LIST_STATUS,
  LIST_TAB,
  collectReservations,
  formatListWhen,
  groupUpcoming,
  listPast,
  listUpcoming,
  pastListStatus,
  toVisitKey,
  type ListStatus,
  type ListTab,
  type PastRange,
  type ReservationSource,
} from '@views/guardian-reservation-page/lib/guardianReservationList';
import {
  takeCancelNotice,
  useBookedVisits,
  useCancelNotice,
  useCancelledIds,
} from '@views/guardian-reservation-page/model/bookedVisits';

import { Header } from '@widgets/Header';

import { route } from '@shared/constants/route';
import { useNativeBackHandler, useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
import { toast } from '@shared/ui/toast';

const PAST_FILTERS = [
  { id: 'one', label: RESERVATION_LIST_COPY.oneMonth },
  { id: 'three', label: RESERVATION_LIST_COPY.threeMonths },
  { id: 'six', label: RESERVATION_LIST_COPY.sixMonths },
] as const satisfies readonly { id: PastRange; label: string }[];

function statusLabel(status: ListStatus) {
  const copy = RESERVATION_LIST_COPY;
  if (status === LIST_STATUS.attended) return copy.attended;
  if (status === LIST_STATUS.absent) return copy.absent;
  return copy.confirmed;
}

function ReservationBadge({ status }: { status: ListStatus }) {
  return (
    <span
      className={cn(
        'caption1-semibold radius-full px-x2 py-x1 shrink-0',
        status === LIST_STATUS.confirmed && 'border-line-accent text-text-accent bg-bg-0 border border-solid',
        status === LIST_STATUS.attended && 'border-line-200 text-text-secondary bg-bg-0 border border-solid',
        status === LIST_STATUS.absent && 'bg-fill-secondary-100 text-text-tertiary'
      )}
    >
      {statusLabel(status)}
    </span>
  );
}

function UpcomingRow({ item, onOpen }: { item: ReservationSource; onOpen: () => void }) {
  return (
    <button
      type='button'
      className='border-line-200 radius-r3 bg-bg-0 py-x4 pl-x4 pr-x3 gap-x2 flex w-full items-center border border-solid text-left'
      onClick={onOpen}
    >
      <p className='body1-medium text-text-primary px-x1 min-w-0 flex-1'>{formatListWhen(item.startsAt)}</p>
      <ReservationBadge status={LIST_STATUS.confirmed} />
      <ChevronRight className='text-text-tertiary size-4 shrink-0' />
    </button>
  );
}

function showCancelToast(startsAt: string) {
  const when = formatListWhen(startsAt);
  const suffix = RESERVATION_LIST_COPY.cancelToastSuffix;
  toast({
    type: 'success',
    shape: 'rounded',
    position: 'bottom',
    nativeTitle: `${when} ${suffix}`,
    titleParts: [{ text: when, accent: true }, { text: ` ${suffix}` }],
    title: (
      <>
        <span className='body1-bold text-text-accent whitespace-pre'>{`${when} `}</span>
        <span className='body1-medium text-text-primary-inverse'>{suffix}</span>
      </>
    ),
  });
}

function PastRow({ item }: { item: ReservationSource }) {
  return (
    <div className='flex flex-col'>
      <div className='py-x5 flex items-center justify-between'>
        <p className='body1-medium text-text-primary'>{formatListWhen(item.startsAt)}</p>
        <ReservationBadge status={pastListStatus(item)} />
      </div>
      <Divider className='m-0' />
    </div>
  );
}

function GuardianReservationListPage() {
  const copy = RESERVATION_LIST_COPY;
  const searchParams = useSearchParams();
  const dogId = searchParams.get('dogId') ?? '';
  const { back, push } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const now = useMemo(() => new Date(), []);
  const nowKey = toVisitKey(now);
  const dogs = useMemo(() => createReservationMainMock(now), [now]);
  const visits = useBookedVisits();
  const cancelledIds = useCancelledIds();
  const cancelNotice = useCancelNotice();
  const dog = dogs.find((item) => item.id === dogId) ?? dogs[0];
  const activeDogId = dog?.id ?? '';
  const [tab, setTab] = useState<ListTab>(LIST_TAB.upcoming);
  const [pastRange, setPastRange] = useState<PastRange>('one');
  const items = collectReservations(activeDogId, now, dog?.upcoming?.startsAt ?? null, visits, cancelledIds);

  const upcomingGroups = groupUpcoming(listUpcoming(items, nowKey));
  const pastItems = listPast(items, now, nowKey, pastRange);

  const handleBack = () => {
    back()
      .then((wentBack) => {
        if (wentBack) return;
        return navigateToTab('/reservation');
      })
      .catch(() => navigateToTab('/reservation'))
      .catch(() => undefined);
  };

  useNativeBackHandler(handleBack);

  useEffect(() => {
    if (!cancelNotice) return;
    const startsAt = takeCancelNotice();
    if (!startsAt) return;
    showCancelToast(startsAt);
  }, [cancelNotice]);

  const handleTab = (value: string) => {
    setTab(value === LIST_TAB.past ? LIST_TAB.past : LIST_TAB.upcoming);
  };

  const handleNewReservation = () => {
    navigateToTab('/reservation').catch(() => undefined);
  };

  return (
    <div className='bg-bg-0 flex h-full min-h-0 flex-1 flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>{copy.title}</Header.Title>
      </Header>

      <Tabs value={tab} onValueChange={handleTab} className='flex min-h-0 flex-1 flex-col'>
        <TabsList>
          <TabsTrigger value={LIST_TAB.upcoming} className='body1-bold text-text-secondary py-x3'>
            {copy.upcoming}
          </TabsTrigger>
          <TabsTrigger value={LIST_TAB.past} className='body1-bold text-text-secondary py-x3'>
            {copy.past}
          </TabsTrigger>
        </TabsList>

        <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
          {tab === LIST_TAB.upcoming ? (
            <div className='gap-x5 flex flex-col'>
              {upcomingGroups.map((group) => (
                <section key={group.heading} className='px-x4 pt-x5 gap-x4 flex flex-col'>
                  <h2 className='body1-bold text-text-primary px-x1_5'>{group.heading}</h2>
                  <div className='gap-x3 flex flex-col'>
                    {group.items.map((item) => (
                      <UpcomingRow
                        key={item.id}
                        item={item}
                        onOpen={() => {
                          push({
                            pathname: route.reservation.detail.root,
                            query: { dogId: activeDogId, reservationId: item.id },
                          }).catch(() => undefined);
                        }}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className='px-x4 pt-x5 gap-x2 flex flex-col'>
              <div className='gap-x2 flex items-center'>
                {PAST_FILTERS.map((filter) => (
                  <StatusFilterChip
                    key={filter.id}
                    selected={pastRange === filter.id}
                    onClick={() => setPastRange(filter.id)}
                  >
                    {filter.label}
                  </StatusFilterChip>
                ))}
              </div>
              <div className='flex flex-col'>
                {pastItems.map((item) => (
                  <PastRow key={item.id} item={item} />
                ))}
              </div>
              <p className='body2-regular text-text-tertiary py-x8 text-center'>{copy.pastHint}</p>
            </div>
          )}
        </div>
      </Tabs>

      <div className='bg-bg-0 px-x4 py-x4 shrink-0'>
        <ActionButton
          type='button'
          variant='primaryFill'
          size='large'
          className='body1-bold'
          onClick={handleNewReservation}
        >
          <Plus className='size-5' />
          {copy.newReservation}
        </ActionButton>
      </div>
    </div>
  );
}

export { GuardianReservationListPage };
