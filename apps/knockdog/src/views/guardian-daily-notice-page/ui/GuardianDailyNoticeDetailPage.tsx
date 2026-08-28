'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@knockdog/ui';

import {
  useGuardianSchoolConnectionsQuery,
  type GuardianSchoolConnection,
} from '@entities/guardian-home';
import { useUserStore } from '@entities/user';
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
import {
  formatDateKey,
  isAfterDay,
  isBeforeDay,
  startOfDay,
} from '@shared/lib/calendar-date';
import {
  isPetIdInList,
  isUnavailableResourceError,
  parseNotificationEntrySource,
  useUnavailableNotificationAction,
} from '@shared/lib/notification';
import { RingLoadingSpinner } from '@shared/ui/loading-spinner';
import { isStoolStatus } from '@shared/ui/stool-status';

const SAFE_AREA_INSET_TOP = 'max(var(--safe-area-inset-top, 0px), env(safe-area-inset-top, 0px))';

interface VisibleCheckInState {
  isReady: boolean;
  hasCheckIn: boolean;
  isWeeklyView: boolean;
  isSelectedDateEnabled: boolean;
}

function parsePetIdQuery(value: string | null) {
  return value && /^\d+$/.test(value) ? value : null;
}

function parseSchoolIdQuery(value: string | null) {
  return value?.trim() ? value : null;
}

/** notice 일자가 membership 기간(connectedAt~disconnectedAt) 안인지 */
function isNoticeDateInMembership(connection: GuardianSchoolConnection, noticeDate: Date) {
  if (!connection.connectedAt) return false;
  const connectedAt = startOfDay(connection.connectedAt);
  if (isBeforeDay(noticeDate, connectedAt)) return false;
  if (connection.disconnectedAt) {
    const disconnectedAt = startOfDay(connection.disconnectedAt);
    if (isAfterDay(noticeDate, disconnectedAt)) return false;
  }
  return true;
}

/**
 * linked school + notice 일자에 해당하는 membership (해제 이력 포함).
 * 일자에 맞는 건이 없으면 해당 학교 활성 → 전역 활성 순으로 폴백.
 */
function resolveActiveConnection(
  connections: GuardianSchoolConnection[] | undefined,
  linkedSchoolId: string | null | undefined,
  noticeDate: Date
) {
  const list = connections ?? [];
  const schoolList = linkedSchoolId
    ? list.filter((connection) => connection.schoolId === linkedSchoolId)
    : list;

  const covering =
    schoolList.find((connection) => isNoticeDateInMembership(connection, noticeDate)) ?? null;
  if (covering) return covering;

  if (linkedSchoolId) {
    const activeForSchool = schoolList.find((connection) => connection.disconnectedAt == null);
    if (activeForSchool) return activeForSchool;
  }

  return list.find((connection) => connection.disconnectedAt == null) ?? null;
}

/** 같은 학교 재연결 이력을 합친 캘린더 선택 범위 */
function resolveSchoolDateRange(
  connections: GuardianSchoolConnection[] | undefined,
  schoolId: string | null
) {
  if (!schoolId) return { minDate: null as Date | null, maxDate: null as Date | null };

  const schoolList = (connections ?? []).filter((connection) => connection.schoolId === schoolId);
  if (schoolList.length === 0) return { minDate: null, maxDate: null };

  let minDate: Date | null = null;
  let maxDate: Date | null = null;
  let hasActive = false;

  for (const connection of schoolList) {
    if (connection.connectedAt) {
      const connectedAt = startOfDay(connection.connectedAt);
      if (!minDate || isBeforeDay(connectedAt, minDate)) minDate = connectedAt;
    }
    if (connection.disconnectedAt == null) {
      hasActive = true;
      continue;
    }
    const disconnectedAt = startOfDay(connection.disconnectedAt);
    if (!maxDate || isAfterDay(disconnectedAt, maxDate)) maxDate = disconnectedAt;
  }

  return {
    minDate,
    maxDate: hasActive ? null : maxDate,
  };
}

function GuardianDailyNoticeDetailPage() {
  const content = guardianDailyNoticeContent;
  const searchParams = useSearchParams();
  const { push } = useStackNavigation();
  const { leaveUnavailableStackPage } = useUnavailableNotificationAction();
  const petIdFromQuery = parsePetIdQuery(searchParams.get('petId'));
  const schoolIdFromQuery = parseSchoolIdQuery(searchParams.get('schoolId'));
  const entrySource = parseNotificationEntrySource(searchParams.get('source'));
  const setSelectedPetId = useGuardianSelectedPetStore((state) => state.setSelectedPetId);
  const userId = useUserStore((state) => state.user?.userId);
  const { pets, selectedPetId: storePetId, isPetsReady, isPetsError } = useGuardianSelectedPet();
  const canValidatePetList = isPetsReady && !isPetsError;
  const isQueryPetMissing =
    petIdFromQuery != null && canValidatePetList && !isPetIdInList(pets, petIdFromQuery);
  const { firstAttendedAt, linkedKindergarten } = useGuardianKindergartenHome({
    petId: petIdFromQuery,
    enabled: petIdFromQuery == null || (isPetsReady && !isQueryPetMissing),
  });
  const selectedPetId = petIdFromQuery || storePetId;

  const { data: connections, isPending: isConnectionsPending } = useGuardianSchoolConnectionsQuery({
    userId,
    petId: selectedPetId,
    enabled: Boolean(userId) && Boolean(selectedPetId) && !isQueryPetMissing,
  });

  useEffect(() => {
    if (!petIdFromQuery || !canValidatePetList) return;
    if (!isPetIdInList(pets, petIdFromQuery)) return;
    setSelectedPetId(petIdFromQuery);
  }, [canValidatePetList, petIdFromQuery, pets, setSelectedPetId]);

  const dateQueryValue = searchParams.get('date');
  const dateFromQuery = useMemo(() => {
    const parsed = parseDateQuery(dateQueryValue);
    return parsed ? startOfDay(parsed) : null;
  }, [dateQueryValue]);
  const dateFromQueryKey = dateQueryValue ?? '';

  /** URL date/schoolId가 있으면 membership 클램프·홈 firstAttendedAt보다 우선 */
  const [selectedDate, setSelectedDateState] = useState(
    () => dateFromQuery ?? startOfDay(new Date())
  );
  const [hasUserPickedDate, setHasUserPickedDate] = useState(false);
  const [syncedDateQueryKey, setSyncedDateQueryKey] = useState(dateFromQueryKey);

  if (syncedDateQueryKey !== dateFromQueryKey) {
    setSyncedDateQueryKey(dateFromQueryKey);
    setSelectedDateState(dateFromQuery ?? startOfDay(new Date()));
    setHasUserPickedDate(false);
  }

  const handleSelectDate = useCallback((date: Date) => {
    setHasUserPickedDate(true);
    setSelectedDateState(date);
  }, []);

  const activeConnection = useMemo(
    () =>
      resolveActiveConnection(
        connections,
        schoolIdFromQuery ?? linkedKindergarten?.id,
        selectedDate
      ),
    [connections, linkedKindergarten?.id, schoolIdFromQuery, selectedDate]
  );
  /** URL schoolId > 선택일 membership > 현재 연결(이력 없을 때) */
  const schoolId =
    schoolIdFromQuery ?? activeConnection?.schoolId ?? linkedKindergarten?.id ?? null;

  /** 해당 학교 전체 연결 이력 — 주간 캘린더 선택/점 범위 */
  const { minDate: membershipMinDate, maxDate: membershipMaxDate } = useMemo(
    () => resolveSchoolDateRange(connections, schoolId),
    [connections, schoolId]
  );

  /**
   * URL로 연 과거일(재연결 이전 사이클)이 membershipMin/홈 firstAttendedAt에
   * 잘려 오늘로 스냅되지 않도록 선택일을 하한에 포함한다.
   * schoolId가 쿼리에 있으면 홈(현재 유치원) firstAttendedAt은 쓰지 않는다.
   */
  const calendarMinDate = useMemo(() => {
    if (!membershipMinDate) return dateFromQuery ?? undefined;
    return isBeforeDay(selectedDate, membershipMinDate) ? selectedDate : membershipMinDate;
  }, [dateFromQuery, membershipMinDate, selectedDate]);

  const calendarMaxDate = useMemo(() => {
    if (!membershipMaxDate) return undefined;
    return isAfterDay(selectedDate, membershipMaxDate) ? selectedDate : membershipMaxDate;
  }, [membershipMaxDate, selectedDate]);

  const calendarFirstAttendedAt = useMemo(() => {
    if (membershipMinDate) {
      return isBeforeDay(selectedDate, membershipMinDate) ? selectedDate : membershipMinDate;
    }
    if (schoolIdFromQuery) return dateFromQuery ?? selectedDate;
    return firstAttendedAt ?? undefined;
  }, [
    dateFromQuery,
    firstAttendedAt,
    membershipMinDate,
    schoolIdFromQuery,
    selectedDate,
  ]);

  const lockSelectedDate = Boolean(dateFromQuery) && !hasUserPickedDate;

  const [visibleCheckInState, setVisibleCheckInState] = useState<VisibleCheckInState>({
    isReady: false,
    hasCheckIn: true,
    isWeeklyView: true,
    isSelectedDateEnabled: true,
  });

  const handleVisibleCheckInStateChange = useCallback((state: VisibleCheckInState) => {
    setVisibleCheckInState((prev) => {
      if (
        prev.isReady === state.isReady &&
        prev.hasCheckIn === state.hasCheckIn &&
        prev.isWeeklyView === state.isWeeklyView &&
        prev.isSelectedDateEnabled === state.isSelectedDateEnabled
      ) {
        return prev;
      }
      return state;
    });
  }, []);

  const selectedDateKey = formatDateKey(selectedDate);
  const isWaitingForMembership = isConnectionsPending && !schoolIdFromQuery;
  const showEmptyWeekNoCheckIn =
    !isQueryPetMissing &&
    isPetsReady &&
    !isWaitingForMembership &&
    visibleCheckInState.isReady &&
    visibleCheckInState.isWeeklyView &&
    !visibleCheckInState.hasCheckIn;

  const { checkInAt, checkOutAt, dailyNotice, error: calendarError, isPending } = useGuardianCalendarDay({
    selectedDate,
    petId: petIdFromQuery,
    schoolId,
    enabled: !showEmptyWeekNoCheckIn && !isQueryPetMissing && Boolean(schoolId),
  });
  const isTargetUnavailable = isQueryPetMissing || isUnavailableResourceError(calendarError);

  useEffect(() => {
    if (!isTargetUnavailable) return;
    leaveUnavailableStackPage(entrySource);
  }, [entrySource, isTargetUnavailable, leaveUnavailableStackPage]);
  const {
    photos: albumPhotos,
    photoCount: albumPhotoCount,
    hasPhotos: hasAlbumPhotos,
    isLoading: isAlbumLoading,
    isError: isAlbumError,
  } = useGuardianDailyNoticeDayAlbum({
    schoolId,
    date: selectedDateKey,
    enabled: !showEmptyWeekNoCheckIn && !isQueryPetMissing && Boolean(schoolId),
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
    isTargetUnavailable ||
    !isPetsReady ||
    isWaitingForMembership ||
    !visibleCheckInState.isReady ||
    (!lockSelectedDate && !visibleCheckInState.isSelectedDateEnabled) ||
    isPending;
  const showWritingInProgress = !isAlbumLoading && hasAttendanceTime && !dailyNotice;
  const hasAlbumSection = !showEmptyWeekNoCheckIn && (hasAlbumPhotos || isAlbumError);

  const handleAlbumListClick = () => {
    // 스택에 상세를 남기고 리스트 push — 뒤로가기 시 해당 알림장 상세로 복귀
    push({
      pathname: route.compare.notice.list.root,
      query: {
        from: 'notice',
        date: selectedDateKey,
        month: selectedDateKey.slice(0, 7),
        ...(schoolId ? { schoolId } : {}),
      },
    });
  };

  const handleAlbumViewClick = () => {
    push({
      pathname: route.compare.album.root,
      query: {
        ...(schoolId ? { schoolId } : {}),
      },
    });
  };

  if (isTargetUnavailable) {
    return (
      <div className='flex h-dvh items-center justify-center'>
        <RingLoadingSpinner />
      </div>
    );
  }

  return (
    <div
      className='flex h-dvh flex-col'
      style={{
        marginTop: `calc(-1 * ${SAFE_AREA_INSET_TOP})`,
        paddingTop: SAFE_AREA_INSET_TOP,
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
            onSelectDate={handleSelectDate}
            petId={petIdFromQuery}
            schoolId={schoolId}
            minDate={calendarMinDate}
            maxDate={calendarMaxDate}
            firstAttendedAt={calendarFirstAttendedAt}
            onlyCheckInDatesSelectable
            lockSelectedDate={lockSelectedDate}
            onVisibleCheckInStateChange={handleVisibleCheckInStateChange}
          />

          <div className='flex min-h-0 flex-1 flex-col gap-5 px-4 pb-[calc(5rem+var(--safe-area-inset-bottom,0px))]'>
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
                                <p className='body1-regular text-text-primary whitespace-pre-wrap'>
                                  {noticeBody}
                                </p>
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
                                <p className='body1-regular text-text-primary whitespace-pre-wrap'>
                                  {snackBody}
                                </p>
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
                                  <p className='body1-regular text-text-primary whitespace-pre-wrap'>
                                    {stoolBody}
                                  </p>
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
