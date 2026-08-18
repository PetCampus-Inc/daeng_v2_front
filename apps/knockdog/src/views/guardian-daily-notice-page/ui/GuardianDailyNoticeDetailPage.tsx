'use client';

import { useEffect, useState } from 'react';
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
import { useGuardianSelectedPet } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPet';
import { useGuardianSelectedPetStore } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPetStore';
import { GuardianKindergartenDateCalendar } from '@views/guardian-kindergarten-page/ui/GuardianKindergartenDateCalendar';
import { Header } from '@widgets/Header';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { formatDateKey, startOfDay } from '@shared/lib/calendar-date';
import { RingLoadingSpinner } from '@shared/ui/loading-spinner';
import { isStoolStatus } from '@shared/ui/stool-status';

interface VisibleCheckInState {
  isReady: boolean;
  hasCheckIn: boolean;
  isWeeklyView: boolean;
  isSelectedDateEnabled: boolean;
}

function parsePetIdQuery(value: string | null) {
  return value && /^\d+$/.test(value) ? value : null;
}

function GuardianDailyNoticeDetailPage() {
  const content = guardianDailyNoticeContent;
  const searchParams = useSearchParams();
  const { push, reset } = useStackNavigation();
  const petIdFromQuery = parsePetIdQuery(searchParams.get('petId'));
  const setSelectedPetId = useGuardianSelectedPetStore((state) => state.setSelectedPetId);
  const { firstAttendedAt, linkedKindergarten } = useGuardianKindergartenHome({
    petId: petIdFromQuery,
  });
  const { isPetsReady } = useGuardianSelectedPet();

  useEffect(() => {
    if (petIdFromQuery) setSelectedPetId(petIdFromQuery);
  }, [petIdFromQuery, setSelectedPetId]);

  const [selectedDate, setSelectedDate] = useState(() => {
    return startOfDay(parseDateQuery(searchParams.get('date')) ?? new Date());
  });
  const [visibleCheckInState, setVisibleCheckInState] = useState<VisibleCheckInState>({
    isReady: false,
    hasCheckIn: true,
    isWeeklyView: true,
    isSelectedDateEnabled: true,
  });

  const selectedDateKey = formatDateKey(selectedDate);
  const showEmptyWeekNoCheckIn =
    isPetsReady &&
    visibleCheckInState.isReady &&
    visibleCheckInState.isWeeklyView &&
    !visibleCheckInState.hasCheckIn;

  const { checkInAt, checkOutAt, dailyNotice, isPending } = useGuardianCalendarDay({
    selectedDate,
    petId: petIdFromQuery,
    enabled: !showEmptyWeekNoCheckIn,
  });
  const {
    photos: albumPhotos,
    photoCount: albumPhotoCount,
    hasPhotos: hasAlbumPhotos,
    isLoading: isAlbumLoading,
    isError: isAlbumError,
  } = useGuardianDailyNoticeDayAlbum({
    schoolId: linkedKindergarten?.id,
    date: selectedDateKey,
    enabled: !showEmptyWeekNoCheckIn,
  });

  const checkInLabel = checkInAt ? formatNoticeClockTime(checkInAt) : content.emptyTimeLabel;
  const checkOutLabel = checkOutAt ? formatNoticeClockTime(checkOutAt) : null;
  const updatedAtDate = dailyNotice?.updatedAt ? new Date(dailyNotice.updatedAt) : null;
  const updatedAtLabel =
    updatedAtDate && !Number.isNaN(updatedAtDate.getTime())
      ? formatNoticeUpdatedAt(updatedAtDate, content.updatedAtSuffix)
      : null;

  const stoolBody = dailyNotice?.poopMemo || null;
  const snackBody = dailyNotice?.snack || null;
  const noticeBody = dailyNotice?.body || null;
  const showCondition = Boolean(dailyNotice?.conditionLabel);
  const showNoticeSection = Boolean(noticeBody);
  const showSnackSection = Boolean(snackBody);
  const showStoolSection =
    Boolean(stoolBody) ||
    (Boolean(dailyNotice?.stoolLabel) && isStoolStatus(dailyNotice?.poop));
  const hasNoticeContentSections = showNoticeSection || showSnackSection || showStoolSection;

  const hasAttendanceTime = Boolean(checkInAt || checkOutAt);
  /**
   * 등원일 스냅 전까지는 조회 날짜가 확정되지 않는다.
   * 확정 전에 렌더하면 알림장 미작성 블록이 스쳐 지나간다.
   */
  const isContentLoading =
    !isPetsReady ||
    !visibleCheckInState.isReady ||
    !visibleCheckInState.isSelectedDateEnabled ||
    isPending;
  const showWritingInProgress = !isAlbumLoading && hasAttendanceTime && !dailyNotice;
  const hasAlbumSection = !showEmptyWeekNoCheckIn && (hasAlbumPhotos || isAlbumError);

  const handleAlbumListClick = () => {
    // 스택 상세 → 메인 탭 리스트 (하단 탭 유지)
    reset(route.compare.notice.list.root, { month: selectedDateKey.slice(0, 7) });
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
        <div className='flex min-h-full flex-col'>
          <GuardianKindergartenDateCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            petId={petIdFromQuery}
            firstAttendedAt={firstAttendedAt ?? undefined}
            onlyCheckInDatesSelectable
            onVisibleCheckInStateChange={setVisibleCheckInState}
          />

          <div className='flex min-h-0 flex-1 flex-col gap-5 px-4 pb-16'>
            {showEmptyWeekNoCheckIn ? (
              <div className='bg-bg-50 radius-r5 flex min-h-[282px] flex-1 items-center justify-center'>
                <div className='flex w-full flex-col items-center gap-1'>
                  <p className='body1-medium text-text-secondary text-center'>
                    {content.emptyWeekNoCheckInTitle}
                  </p>
                  <p className='body2-regular text-text-tertiary text-center'>
                    {content.emptyWeekNoCheckInDescription}
                  </p>
                </div>
              </div>
            ) : isContentLoading ? (
              /* --:--·미작성 블록이 먼저 스치지 않도록 날짜·응답 확정까지 로딩 */
              <div className='flex min-h-[282px] flex-1 items-center justify-center'>
                <RingLoadingSpinner />
              </div>
            ) : (
              <>
                <div className='flex w-full shrink-0 items-start justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='flex flex-col gap-0.5'>
                      <p className='label-medium text-text-secondary'>{content.checkInLabel}</p>
                      <p className='h3-semibold text-text-primary'>{checkInLabel}</p>
                    </div>
                    {checkOutLabel ? (
                      <div className='flex w-11 flex-col gap-0.5'>
                        <p className='label-medium text-text-secondary'>{content.checkOutLabel}</p>
                        <p className='h3-semibold text-text-primary'>{checkOutLabel}</p>
                      </div>
                    ) : null}
                  </div>
                  {updatedAtLabel ? (
                    <p className='caption1-regular text-text-secondary text-right'>
                      {updatedAtLabel}
                    </p>
                  ) : null}
                </div>

                {showWritingInProgress ? (
                  <div className='flex min-h-0 flex-1 flex-col gap-5'>
                    <div className='bg-bg-50 radius-r5 flex min-h-[282px] flex-1 items-center justify-center'>
                      <div className='flex w-full flex-col items-center gap-1'>
                        <p className='body1-medium text-text-secondary text-center'>
                          {content.writingInProgressTitle}
                        </p>
                        <p className='body2-regular text-text-tertiary text-center'>
                          {content.writingInProgressDescription}
                        </p>
                      </div>
                    </div>

                    {hasAlbumSection ? (
                      <div className='shrink-0'>
                        <GuardianDailyNoticeAlbumSection
                          photos={albumPhotos}
                          photoCount={albumPhotoCount}
                          hasError={isAlbumError}
                          onAlbumClick={handleAlbumViewClick}
                        />
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <>
                    {dailyNotice ? (
                      <>
                        {showCondition ? (
                          <div className='bg-fill-primary-50 inline-flex w-fit items-center rounded-full px-3.5 py-2'>
                            <span className='label-semibold text-text-accent'>
                              {dailyNotice.conditionLabel}
                            </span>
                          </div>
                        ) : null}

                        {hasNoticeContentSections ? (
                          <div className='flex w-full flex-col gap-5'>
                            {showNoticeSection ? (
                              <GuardianDailyNoticeSection
                                iconSrc={content.noticeIconSrc}
                                title={content.noticeSectionTitle}
                              >
                                <p className='body1-regular text-text-primary'>{noticeBody}</p>
                              </GuardianDailyNoticeSection>
                            ) : null}

                            {showNoticeSection && (showSnackSection || showStoolSection) ? (
                              <div className='bg-line-200 h-px w-full' />
                            ) : null}

                            {showSnackSection ? (
                              <GuardianDailyNoticeSection
                                iconSrc={content.snackIconSrc}
                                title={content.snackSectionTitle}
                              >
                                <p className='body1-regular text-text-primary'>{snackBody}</p>
                              </GuardianDailyNoticeSection>
                            ) : null}

                            {showSnackSection && showStoolSection ? (
                              <div className='bg-line-200 h-px w-full' />
                            ) : null}

                            {showStoolSection ? (
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
                            ) : null}
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <p className='body1-medium text-text-tertiary'>
                        {content.emptyNoticeMessage}
                      </p>
                    )}

                    {hasAlbumSection ? (
                      <GuardianDailyNoticeAlbumSection
                        photos={albumPhotos}
                        photoCount={albumPhotoCount}
                        hasError={isAlbumError}
                        onAlbumClick={handleAlbumViewClick}
                      />
                    ) : null}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { GuardianDailyNoticeDetailPage };
