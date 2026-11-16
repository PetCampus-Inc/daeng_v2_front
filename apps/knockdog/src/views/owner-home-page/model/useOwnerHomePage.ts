import { useCallback, useEffect, useState } from 'react';
import { getNextKstMidnightDelay } from '@views/owner-home-page/model/ownerHomeDate';
import { useOwnerRole } from '@features/role-conversion';
import { useOwnerHomeQuery } from '@entities/owner-home';
import { OWNER_MEMBERS_TAB, OWNER_MEMBERS_TAB_QUERY_KEY, useOwnerMembersQuery } from '@entities/owner-member';
import { useUserStore } from '@entities/user';
import { route } from '@shared/constants/route';
import { useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
import type { Query } from '@shared/lib/bridge/queryUtils';
import { isNativeWebView } from '@shared/lib/device';

const HOME_DATE_FORMATTER = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
});

const useOwnerHomePage = () => {
  const { push } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const userId = useUserStore((state) => state.user?.userId);
  const { isOwner, isResolved, kindergarten } = useOwnerRole();
  const [lastRefreshedAt, setLastRefreshedAt] = useState(() => new Date());
  const homeQuery = useOwnerHomeQuery({ userId, enabled: isResolved && isOwner });
  const membersQuery = useOwnerMembersQuery({ userId, enabled: isResolved && isOwner });
  const ownerHome = homeQuery.data;
  const { refetch: refetchHome } = homeQuery;
  const { refetch: refetchMembers } = membersQuery;

  const navigateToOwnerDaily = (query: Query) => {
    const nextQuery = { ...query, from: 'home' };
    if (isNativeWebView()) {
      navigateToTab('/owner/daily', nextQuery).catch(() => {
        push({ pathname: route.owner.daily.root, query: nextQuery });
      });
      return;
    }
    push({ pathname: route.owner.daily.root, query: nextQuery });
  };
  const handleLatePetsClick = () => navigateToOwnerDaily({ tab: 'attendance-check', lateOnly: true });
  /**
   * 등원 현황 카드의 `등원 완료`·`결석 확정`을 누르면 오늘 일과 `등원처리` 탭을 열고 그 상태의 원생으로 스크롤한다.
   * 해당 원생이 0마리면 스크롤 없이 기본 목록만 보여 준다.
   */
  const handleCheckedInClick = () =>
    navigateToOwnerDaily({
      tab: 'attendance-check',
      focusStatus: (ownerHome?.operationStatus.checkedInCount ?? 0) > 0 ? 'checkedIn' : undefined,
    });
  const handleAbsentClick = () =>
    navigateToOwnerDaily({
      tab: 'attendance-check',
      focusStatus: (ownerHome?.operationStatus.absentCount ?? 0) > 0 ? 'absent' : undefined,
    });
  /** `하원 완료`를 누르면 오늘 일과 `등원목록` 탭을 열고 하원한 원생으로 스크롤한다. 0마리면 기본 목록만 보여 준다. */
  const handleCheckedOutClick = () =>
    navigateToOwnerDaily({
      tab: 'attendance-list',
      focusStatus: (ownerHome?.operationStatus.checkedOutCount ?? 0) > 0 ? 'checkedOut' : undefined,
    });
  const handleNoticebookStatusClick = () =>
    navigateToOwnerDaily({ tab: 'attendance-list', todayFilter: 'UNSENT_RECORD' });
  const handleConnectionClick = () =>
    push({ pathname: route.owner.members.root, query: { [OWNER_MEMBERS_TAB_QUERY_KEY]: OWNER_MEMBERS_TAB.pending } });
  const handleTicketsClick = () =>
    push({ pathname: route.owner.members.root, query: { tab: OWNER_MEMBERS_TAB.registered, filter: 'expiring' } });
  const handleNewsClick = () => push({ pathname: route.owner.news.root });

  const handleRefresh = useCallback(async () => {
    if (!isResolved || !isOwner) return;
    await Promise.all([refetchHome(), refetchMembers()]);
    setLastRefreshedAt(new Date());
  }, [isResolved, isOwner, refetchHome, refetchMembers]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      handleRefresh();
    }, getNextKstMidnightDelay(lastRefreshedAt));
    return () => window.clearTimeout(timeout);
  }, [handleRefresh, lastRefreshedAt]);

  useEffect(() => {
    const handleVisible = () => {
      if (document.visibilityState === 'visible') handleRefresh();
    };
    const handleActivate = () => {
      handleRefresh();
    };
    document.addEventListener('visibilitychange', handleVisible);
    window.addEventListener('appresume', handleActivate);
    window.addEventListener('knockdog:native-tab-focus', handleActivate);
    return () => {
      document.removeEventListener('visibilitychange', handleVisible);
      window.removeEventListener('appresume', handleActivate);
      window.removeEventListener('knockdog:native-tab-focus', handleActivate);
    };
  }, [handleRefresh]);

  return {
    displaySchoolName: ownerHome?.school.name || kindergarten?.name || '',
    homeDateLabel: HOME_DATE_FORMATTER.format(lastRefreshedAt),
    today: {
      isError: homeQuery.isError,
      enrolledCount: ownerHome?.operationStatus.currentlyInCount ?? 0,
      arrivalCount: ownerHome?.operationStatus.checkedInCount ?? 0,
      absentCount: ownerHome?.operationStatus.absentCount ?? 0,
      departureCount: ownerHome?.operationStatus.checkedOutCount ?? 0,
    },
    noticebook: { pendingCount: ownerHome?.operationStatus.unsentAttendanceRecordCount ?? 0 },
    latePets: ownerHome?.latePets ?? { count: 0, items: [] },
    pendingApprovals: ownerHome?.pendingApprovals,
    expiringCount: membersQuery.data?.counts.expiring ?? 0,
    isHomeLoading: !isResolved || homeQuery.isPending,
    isHomeFetching: homeQuery.isFetching,
    isMembersLoading: !isResolved || membersQuery.isPending,
    isMembersError: membersQuery.isError,
    isMembersFetching: membersQuery.isFetching,
    handleHomeRetry: () => {
      refetchHome();
    },
    handleMembersRetry: () => {
      refetchMembers();
    },
    handleLatePetsClick,
    handleCheckedInClick,
    handleAbsentClick,
    handleCheckedOutClick,
    handleNoticebookStatusClick,
    handleConnectionClick,
    handleTicketsClick,
    handleNewsClick,
    handleRefresh,
  };
};

export { useOwnerHomePage };
