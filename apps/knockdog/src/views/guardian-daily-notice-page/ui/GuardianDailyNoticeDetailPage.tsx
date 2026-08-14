'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@knockdog/ui';

import { guardianDailyNoticeContent } from '@views/guardian-daily-notice-page/config/guardianDailyNoticeContent';
import {
  formatNoticeClockTime,
  formatNoticeUpdatedAt,
  parseDateQuery,
} from '@views/guardian-daily-notice-page/lib/formatGuardianDailyNotice';
import { useGuardianDailyNoticeDayAlbum } from '@views/guardian-daily-notice-page/model/useGuardianDailyNoticeDayAlbum';
import {
  GuardianDailyNoticeAlbumSection,
  GuardianDailyNoticeSection,
  GuardianDailyNoticeSpring,
  GuardianDailyNoticeStoolBadge,
} from '@views/guardian-daily-notice-page/ui/GuardianDailyNoticeSections';
import { useGuardianCalendarDay } from '@views/guardian-kindergarten-page/model/useGuardianCalendarDay';
import { useGuardianKindergartenHome } from '@views/guardian-kindergarten-page/model/useGuardianKindergartenHome';
import { GuardianKindergartenDateCalendar } from '@views/guardian-kindergarten-page/ui/GuardianKindergartenDateCalendar';
import { Header } from '@widgets/Header';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { formatDateKey, startOfDay } from '@shared/lib/calendar-date';
import { isStoolStatus } from '@shared/ui/stool-status';

function GuardianDailyNoticeDetailPage() {
  const content = guardianDailyNoticeContent;
  const searchParams = useSearchParams();
  const { push } = useStackNavigation();
  const { firstAttendedAt, linkedKindergarten } = useGuardianKindergartenHome();

  const [selectedDate, setSelectedDate] = useState(() => {
    return startOfDay(parseDateQuery(searchParams.get('date')) ?? new Date());
  });

  const selectedDateKey = formatDateKey(selectedDate);
  const { checkInAt, checkOutAt, dailyNotice, isPending } = useGuardianCalendarDay({
    selectedDate,
  });
  const {
    photos: albumPhotos,
    photoCount: albumPhotoCount,
    hasPhotos: hasAlbumPhotos,
  } = useGuardianDailyNoticeDayAlbum({
    schoolId: linkedKindergarten?.id,
    date: selectedDateKey,
  });

  const checkInLabel = checkInAt ? formatNoticeClockTime(checkInAt) : content.emptyTimeLabel;
  const checkOutLabel = checkOutAt ? formatNoticeClockTime(checkOutAt) : content.emptyTimeLabel;
  const updatedAtDate = dailyNotice?.updatedAt ? new Date(dailyNotice.updatedAt) : null;
  const updatedAtLabel =
    updatedAtDate && !Number.isNaN(updatedAtDate.getTime())
      ? formatNoticeUpdatedAt(updatedAtDate, content.updatedAtSuffix)
      : null;

  const stoolBody = dailyNotice?.poopMemo || null;
  const snackBody = dailyNotice?.snack || null;
  const noticeBody = dailyNotice?.body || null;

  const handleAlbumListClick = () => {
    push({ pathname: route.compare.album.root });
  };

  const handleAlbumViewClick = () => {
    push({ pathname: route.compare.album.root });
  };

  return (
    <div
      className='flex h-dvh flex-col'
      style={{
        background:
          'linear-gradient(180deg, var(--color-primitive-orange-400) 0%, var(--color-primitive-orange-500) 42.54%)',
      }}
    >
      <div className='relative z-20 shrink-0 pb-5'>
        <Header variant='transparent' className='border-none'>
          <Header.LeftSection>
            <Header.BackButton className='text-text-primary-inverse' />
          </Header.LeftSection>
          <Header.Title className='text-text-primary-inverse'>{content.pageTitle}</Header.Title>
          <Header.RightSection>
            <button
              type='button'
              className='inline-flex size-6 items-center justify-center'
              aria-label={content.albumListAriaLabel}
              onClick={handleAlbumListClick}
            >
              <Icon icon='List' className='text-text-primary-inverse size-6' />
            </button>
          </Header.RightSection>
        </Header>

        <GuardianDailyNoticeSpring />
      </div>

      <div className='bg-bg-0 relative min-h-0 flex-1 overflow-y-auto pt-5'>
        <GuardianKindergartenDateCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          firstAttendedAt={firstAttendedAt ?? undefined}
        />

        <div className='flex w-full flex-col gap-5 px-4 pb-16'>
          <div className='flex w-full items-start justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex flex-col gap-0.5'>
                <p className='label-medium text-text-secondary'>{content.checkInLabel}</p>
                <p className='h3-semibold text-text-primary'>{checkInLabel}</p>
              </div>
              <div className='flex w-11 flex-col gap-0.5'>
                <p className='label-medium text-text-secondary'>{content.checkOutLabel}</p>
                <p className='h3-semibold text-text-primary'>{checkOutLabel}</p>
              </div>
            </div>
            {updatedAtLabel ? (
              <p className='caption1-regular text-text-secondary text-right'>{updatedAtLabel}</p>
            ) : null}
          </div>

          {isPending ? null : dailyNotice ? (
            <>
              {dailyNotice.conditionLabel ? (
                <div className='bg-fill-primary-50 inline-flex w-fit items-center rounded-full px-3.5 py-2'>
                  <span className='label-semibold text-text-accent'>
                    {dailyNotice.conditionLabel}
                  </span>
                </div>
              ) : null}

              <div className='flex w-full flex-col gap-5'>
                <GuardianDailyNoticeSection
                  iconSrc={content.noticeIconSrc}
                  title={content.noticeSectionTitle}
                >
                  {noticeBody ? (
                    <p className='body1-regular text-text-primary'>{noticeBody}</p>
                  ) : null}
                </GuardianDailyNoticeSection>

                <div className='bg-line-200 h-px w-full' />

                <GuardianDailyNoticeSection
                  iconSrc={content.snackIconSrc}
                  title={content.snackSectionTitle}
                >
                  {snackBody ? (
                    <p className='body1-regular text-text-primary'>{snackBody}</p>
                  ) : null}
                </GuardianDailyNoticeSection>

                <div className='bg-line-200 h-px w-full' />

                <GuardianDailyNoticeSection
                  iconSrc={content.stoolIconSrc}
                  title={content.stoolSectionTitle}
                >
                  {dailyNotice.stoolLabel && isStoolStatus(dailyNotice.poop) ? (
                    <GuardianDailyNoticeStoolBadge
                      status={dailyNotice.poop}
                      label={dailyNotice.stoolLabel}
                    />
                  ) : null}
                  {stoolBody ? (
                    <p className='body1-regular text-text-primary'>{stoolBody}</p>
                  ) : null}
                </GuardianDailyNoticeSection>
              </div>
            </>
          ) : (
            <p className='body1-medium text-text-tertiary'>{content.emptyNoticeMessage}</p>
          )}

          {hasAlbumPhotos ? (
            <GuardianDailyNoticeAlbumSection
              photos={albumPhotos}
              photoCount={albumPhotoCount}
              onAlbumClick={handleAlbumViewClick}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export { GuardianDailyNoticeDetailPage };
