'use client';

import { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import { GuardianAlbumMonthPickerSheet } from '@views/guardian-album-page/ui/GuardianAlbumMonthPickerSheet';
import { GuardianAlbumScrollTopButton } from '@views/guardian-album-page/ui/GuardianAlbumScrollTopButton';
import { guardianDailyNoticeListContent } from '@views/guardian-daily-notice-list-page/config/guardianDailyNoticeListContent';
import { isDisconnectedListMock } from '@views/guardian-daily-notice-list-page/config/guardianDailyNoticeListMock';
import { useGuardianDailyNoticeMonthList } from '@views/guardian-daily-notice-list-page/model/useGuardianDailyNoticeMonthList';
import { GuardianDailyNoticeListMonthEmpty } from '@views/guardian-daily-notice-list-page/ui/GuardianDailyNoticeListMonthEmpty';
import { GuardianDailyNoticeListMonthList } from '@views/guardian-daily-notice-list-page/ui/GuardianDailyNoticeListMonthList';
import { GuardianDailyNoticeListMonthNav } from '@views/guardian-daily-notice-list-page/ui/GuardianDailyNoticeListMonthNav';
import { useGuardianSelectedPet } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPet';
import { useGuardianKindergartenHome } from '@views/guardian-kindergarten-page/model/useGuardianKindergartenHome';
import { pushGuardianDailyNoticeDetail } from '@views/guardian-kindergarten-page/lib/pushGuardianDailyNoticeDetail';
import { Header } from '@widgets/Header';
import { BOTTOM_BAR_HEIGHT } from '@shared/constants';
import { useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
import { addMonths, startOfDay } from '@shared/lib/calendar-date';

function startOfMonth(date: Date) {
  return startOfDay(new Date(date.getFullYear(), date.getMonth(), 1));
}

function parseMonthQuery(value: string | null) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return null;
  const [yearPart, monthPart] = value.split('-');
  const year = Number(yearPart);
  const month = Number(monthPart);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) return null;
  return startOfMonth(new Date(year, month - 1, 1));
}

function GuardianDailyNoticeListPage() {
  const content = guardianDailyNoticeListContent;
  const searchParams = useSearchParams();
  const { navigateToTab } = useTabNavigation();
  const { push } = useStackNavigation();
  const { selectedPetId } = useGuardianSelectedPet();
  const { firstAttendedAt, linkedKindergarten, status } = useGuardianKindergartenHome();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedMonth, setSelectedMonth] = useState(
    () => parseMonthQuery(searchParams.get('month')) ?? startOfMonth(new Date())
  );
  const [isScrollTopVisible, setIsScrollTopVisible] = useState(false);

  const isDisconnected =
    status === 'disconnected' || isDisconnectedListMock(searchParams.get('mock'));
  const minMonth = useMemo(
    () => startOfMonth(firstAttendedAt ?? new Date(2020, 0, 1)),
    [firstAttendedAt]
  );
  const maxMonth = useMemo(() => startOfMonth(new Date()), []);
  const canGoPrevMonth = selectedMonth.getTime() > minMonth.getTime();
  const canGoNextMonth = selectedMonth.getTime() < maxMonth.getTime();

  const title = linkedKindergarten?.name ?? '';

  const { items, firstAttendanceDate, attendedUntilDate, isPending } =
    useGuardianDailyNoticeMonthList({
      schoolId: linkedKindergarten?.id,
      petId: selectedPetId,
      selectedMonth,
      firstAttendedAt,
      isDisconnected,
    });

  const hasRows =
    items.length > 0 || firstAttendanceDate != null || attendedUntilDate != null;

  const handleBack = () => {
    navigateToTab('/compare');
  };

  const handleScroll = () => {
    const node = scrollRef.current;
    if (!node) return;
    setIsScrollTopVisible(node.scrollTop > 120);
  };

  const handleScrollTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevMonth = () => {
    if (!canGoPrevMonth) return;
    setSelectedMonth((prev) => startOfMonth(addMonths(prev, -1)));
    setIsScrollTopVisible(false);
  };

  const handleNextMonth = () => {
    if (!canGoNextMonth) return;
    setSelectedMonth((prev) => startOfMonth(addMonths(prev, 1)));
    setIsScrollTopVisible(false);
  };

  const handleYearMonthClick = () => {
    overlay.open(({ isOpen, close }) => (
      <GuardianAlbumMonthPickerSheet
        isOpen={isOpen}
        close={close}
        currentMonth={selectedMonth}
        minMonth={minMonth}
        maxMonth={maxMonth}
        onConfirm={(month) => {
          setSelectedMonth(startOfMonth(month));
          setIsScrollTopVisible(false);
        }}
      />
    ));
  };

  return (
    <div
      className='bg-bg-50 relative flex h-dvh flex-col'
      style={{ paddingBottom: BOTTOM_BAR_HEIGHT }}
    >
      <div className='sticky top-0 z-10 shrink-0'>
        <div className='bg-bg-0 pt-(--safe-area-inset-top,0px)'>
          <Header className='border-b-0'>
            <Header.LeftSection>
              <Header.BackButton onClick={handleBack} />
            </Header.LeftSection>
            <Header.CenterSection>
              <div className='h3-extrabold text-text-primary gap-x1 flex max-w-[200px] items-center'>
                <span className='truncate'>{title}</span>
                <Icon
                  icon='ChevronBottom'
                  className='text-text-primary size-5 shrink-0'
                  aria-hidden='true'
                />
              </div>
            </Header.CenterSection>
          </Header>
        </div>

        <GuardianDailyNoticeListMonthNav
          month={selectedMonth}
          canGoPrevMonth={canGoPrevMonth}
          canGoNextMonth={canGoNextMonth}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onYearMonthClick={handleYearMonthClick}
        />
      </div>

      <div className='relative min-h-0 flex-1'>
        <div
          ref={scrollRef}
          className='bg-bg-50 flex h-full flex-col overflow-y-auto'
          onScroll={handleScroll}
          aria-label={content.listAriaLabel}
        >
          {isPending && !hasRows ? null : hasRows ? (
            <GuardianDailyNoticeListMonthList
              items={items}
              attendedUntilDate={attendedUntilDate}
              firstAttendanceDate={firstAttendanceDate}
              onItemClick={(item) => pushGuardianDailyNoticeDetail(push, item.date)}
            />
          ) : (
            <GuardianDailyNoticeListMonthEmpty />
          )}
        </div>
        <GuardianAlbumScrollTopButton
          visible={isScrollTopVisible}
          onClick={handleScrollTop}
        />
      </div>
    </div>
  );
}

export { GuardianDailyNoticeListPage };
