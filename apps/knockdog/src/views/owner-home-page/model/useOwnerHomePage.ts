import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  formatKstDateLabel,
  formatKstDayLabel,
  getNextKstMidnightDelay,
  getKstDateKey,
} from '@views/owner-home-page/model/ownerHomeDate';
import { showOwnerHomeRefreshedToast } from '@views/owner-home-page/model/ownerHomeToast';

import { useOwnerRole } from '@features/role-conversion';

import { useOwnerHomeQuery } from '@entities/owner-home';
import { useOwnerMembersQuery } from '@entities/owner-member';
import { useUserStore } from '@entities/user';

import { route } from '@shared/constants/route';
import { useStackNavigation, useTabNavigation } from '@shared/lib/bridge';

function useOwnerHomePage() {
  const { push } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const userId = useUserStore((state) => state.user?.userId);
  const { isOwner, isResolved, kindergarten, owner } = useOwnerRole();
  const [lastRefreshedAt, setLastRefreshedAt] = useState(() => new Date());

  const {
    data: ownerHome,
    isError: isOwnerHomeError,
    refetch: refetchOwnerHome,
  } = useOwnerHomeQuery({
    userId,
    enabled: isResolved && isOwner,
  });

  const { data: ownerMembers, refetch: refetchOwnerMembers } = useOwnerMembersQuery({
    userId,
    enabled: isResolved && isOwner,
  });

  const schoolName = ownerHome?.school.name || kindergarten?.name || '';
  const ownerDisplayName = owner?.name?.trim() || '';
  const totalMemberCount = ownerMembers?.totalMemberCount;
  const hasConnectedMembers =
    typeof totalMemberCount === 'number'
      ? totalMemberCount > 0
      : (ownerHome?.operationStatus.currentlyInCount ?? 0) > 0;
  const pendingConnectionCount = ownerHome?.pendingApprovalsCount ?? 0;

  const today = useMemo(
    () => ({
      isError: isOwnerHomeError,
      enrolledCount: ownerHome?.operationStatus.currentlyInCount ?? 0,
      arrivalCount: ownerHome?.operationStatus.checkedInCount ?? 0,
      departureCount: ownerHome?.operationStatus.checkedOutCount ?? 0,
      dateLabel: formatKstDateLabel(lastRefreshedAt),
      dayLabel: formatKstDayLabel(lastRefreshedAt),
    }),
    [isOwnerHomeError, lastRefreshedAt, ownerHome]
  );

  const noticebook = {
    shouldShow:
      hasConnectedMembers &&
      !isOwnerHomeError &&
      ((ownerHome?.operationStatus.checkedInCount ?? 0) > 0 ||
        (ownerHome?.operationStatus.unsentAttendanceRecordCount ?? 0) > 0),
    pendingCount: ownerHome?.operationStatus.unsentAttendanceRecordCount ?? 0,
    sentCount: ownerHome?.operationStatus.sentAttendanceRecordCount ?? 0,
  };

  const navigateToTodayAttendance = (todayFilter: 'checked-in' | 'noticebook-pending') => {
    navigateToTab('/owner/daily', {
      tab: 'today-attendance',
      todayFilter,
    }).catch(() => {
      push({
        pathname: route.owner.daily.root,
        query: {
          tab: 'today-attendance',
          todayFilter,
        },
      });
    });
  };

  const handleNoticebookStatusClick = () => {
    navigateToTodayAttendance('noticebook-pending');
  };

  const handleConnectionClick = () => {
    push({ pathname: route.owner.members.approval.root });
  };

  const handleAlbumClick = () => {
    void navigateToTab('/owner/album').catch(() => {
      push({ pathname: '/owner/album' });
    });
  };

  const handleNewsClick = () => {
    void push({ pathname: route.owner.news.root });
  };

  const handleRefresh = useCallback(
    (notify = false) => {
      if (!isResolved || !isOwner) {
        setLastRefreshedAt(new Date());
        return;
      }

      void Promise.all([refetchOwnerHome(), refetchOwnerMembers()]).finally(() => {
        setLastRefreshedAt(new Date());
        if (notify) showOwnerHomeRefreshedToast();
      });
    },
    [isOwner, isResolved, refetchOwnerHome, refetchOwnerMembers]
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      handleRefresh();
    }, getNextKstMidnightDelay(lastRefreshedAt));

    return () => window.clearTimeout(timeout);
  }, [handleRefresh, lastRefreshedAt]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      if (getKstDateKey(lastRefreshedAt) === getKstDateKey(new Date())) return;

      handleRefresh();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [handleRefresh, lastRefreshedAt]);

  return {
    displaySchoolName: schoolName,
    handleAlbumClick,
    handleConnectionClick,
    handleNewsClick,
    handleNoticebookStatusClick,
    handleRefresh,
    hasConnectedMembers,
    noticebook,
    ownerDisplayName,
    pendingConnectionCount,
    today,
  };
}

export { useOwnerHomePage };
