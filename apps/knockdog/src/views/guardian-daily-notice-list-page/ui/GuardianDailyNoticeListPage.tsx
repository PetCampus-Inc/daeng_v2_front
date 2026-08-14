'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import { GuardianAlbumMonthPickerSheet } from '@views/guardian-album-page/ui/GuardianAlbumMonthPickerSheet';
import { guardianDailyNoticeListContent } from '@views/guardian-daily-notice-list-page/config/guardianDailyNoticeListContent';
import { GuardianDailyNoticeListMonthNav } from '@views/guardian-daily-notice-list-page/ui/GuardianDailyNoticeListMonthNav';
import { useGuardianKindergartenHome } from '@views/guardian-kindergarten-page/model/useGuardianKindergartenHome';
import { Header } from '@widgets/Header';
import { BOTTOM_BAR_HEIGHT } from '@shared/constants';
import { useTabNavigation } from '@shared/lib/bridge';
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
  const { firstAttendedAt, linkedKindergarten } = useGuardianKindergartenHome();

  const [selectedMonth, setSelectedMonth] = useState(
    () => parseMonthQuery(searchParams.get('month')) ?? startOfMonth(new Date())
  );

  const minMonth = useMemo(
    () => startOfMonth(firstAttendedAt ?? new Date(2020, 0, 1)),
    [firstAttendedAt]
  );
  const maxMonth = useMemo(() => startOfMonth(new Date()), []);
  const canGoPrevMonth = selectedMonth.getTime() > minMonth.getTime();
  const canGoNextMonth = selectedMonth.getTime() < maxMonth.getTime();

  const title = linkedKindergarten?.name ?? '';

  const handleBack = () => {
    navigateToTab('/compare');
  };

  const handlePrevMonth = () => {
    if (!canGoPrevMonth) return;
    setSelectedMonth((prev) => startOfMonth(addMonths(prev, -1)));
  };

  const handleNextMonth = () => {
    if (!canGoNextMonth) return;
    setSelectedMonth((prev) => startOfMonth(addMonths(prev, 1)));
  };

  const handleYearMonthClick = () => {
    overlay.open(({ isOpen, close }) => (
      <GuardianAlbumMonthPickerSheet
        isOpen={isOpen}
        close={close}
        currentMonth={selectedMonth}
        minMonth={minMonth}
        maxMonth={maxMonth}
        onConfirm={(month) => setSelectedMonth(startOfMonth(month))}
      />
    ));
  };

  return (
    <div
      className='bg-bg-50 relative flex min-h-dvh flex-col'
      style={{ paddingBottom: BOTTOM_BAR_HEIGHT }}
    >
      <div className='sticky top-0 z-10 shrink-0'>
        <div className='bg-bg-0'>
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

      <div className='bg-bg-50 min-h-0 flex-1' aria-label={content.listAriaLabel} />
    </div>
  );
}

export { GuardianDailyNoticeListPage };
