import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  formatKstDateLabel,
  formatKstDayLabel,
  formatKstTimeLabel,
  getKstDateKey,
  getNextKstMidnightDelay,
} from '@views/owner-home-page/model/ownerHomeDate';

import { useOwnerRole } from '@features/role-conversion';

import { PET_PREVIEW_LIMIT, useOwnerHomeQuery } from '@entities/owner-home';
import { useUserStore } from '@entities/user';

import { route } from '@shared/constants/route';
import { useStackNavigation, useTabNavigation } from '@shared/lib/bridge';

const SCHOOL_NAME_MAX_LENGTH = 15;

interface ApprovalBannerDismissal {
  count: number;
}

function formatSchoolName(name: string) {
  const characters = Array.from(name);

  if (characters.length <= SCHOOL_NAME_MAX_LENGTH) return name;

  return `${characters.slice(0, SCHOOL_NAME_MAX_LENGTH).join('')}···`;
}

function useOwnerHomePage() {
  const { push } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const userId = useUserStore((state) => state.user?.userId);
  const { isOwner, isResolved, kindergarten } = useOwnerRole();
  const [dismissedApprovalBanner, setDismissedApprovalBanner] = useState<ApprovalBannerDismissal | null>(
    null
  );
  const [lastRefreshedAt, setLastRefreshedAt] = useState(() => new Date());

  const {
    data: ownerHome,
    isError: isOwnerHomeError,
    refetch: refetchOwnerHome,
  } = useOwnerHomeQuery({
    userId,
    enabled: isResolved && isOwner,
  });

  const schoolName = ownerHome?.school.name || kindergarten?.name || '';

  const approval = {
    pendingCount: ownerHome?.pendingApprovalsCount ?? 0,
  };

  const isSameDismissedApprovalBanner = dismissedApprovalBanner?.count === approval.pendingCount;
  const shouldShowApprovalBanner =
    !isOwnerHomeError && approval.pendingCount > 0 && !isSameDismissedApprovalBanner;

  const today = useMemo(() => {
    const friends = ownerHome?.currentlyInPetsPreview.items ?? [];
    const totalCount =
      ownerHome?.currentlyInPetsPreview.totalCount ??
      ownerHome?.operationStatus.currentlyInCount ??
      0;

    return {
      isError: isOwnerHomeError,
      enrolledCount: ownerHome?.operationStatus.currentlyInCount ?? 0,
      arrivalCount: ownerHome?.operationStatus.checkedInCount ?? 0,
      departureCount: ownerHome?.operationStatus.checkedOutCount ?? 0,
      friends,
      extraFriendCount: Math.max(0, totalCount - Math.min(friends.length, PET_PREVIEW_LIMIT)),
      currentTimeLabel: formatKstTimeLabel(lastRefreshedAt),
      dateLabel: formatKstDateLabel(lastRefreshedAt),
      dayLabel: formatKstDayLabel(lastRefreshedAt),
    };
  }, [isOwnerHomeError, lastRefreshedAt, ownerHome]);

  const noticebook = {
    shouldShow: !isOwnerHomeError,
    pendingCount: ownerHome?.operationStatus.unsentAttendanceRecordCount ?? 0,
    sentCount: ownerHome?.operationStatus.sentAttendanceRecordCount ?? 0,
  };

  const handleApprovalBannerClick = () => {
    push({ pathname: route.owner.members.approval.root });
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

  const handleFriendPreviewClick = () => {
    navigateToTodayAttendance('checked-in');
  };

  const handleNoticebookStatusClick = () => {
    navigateToTodayAttendance('noticebook-pending');
  };

  const handleApprovalBannerClose = () => {
    setDismissedApprovalBanner({
      count: approval.pendingCount,
    });
  };

  const handleRefresh = useCallback(() => {
    if (!isResolved || !isOwner) {
      setLastRefreshedAt(new Date());
      return;
    }

    refetchOwnerHome().finally(() => {
      setLastRefreshedAt(new Date());
    });
  }, [isOwner, isResolved, refetchOwnerHome]);

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
    approval,
    displaySchoolName: formatSchoolName(schoolName),
    handleApprovalBannerClick,
    handleApprovalBannerClose,
    handleFriendPreviewClick,
    handleNoticebookStatusClick,
    handleRefresh,
    noticebook,
    shouldShowApprovalBanner,
    today,
  };
}

export { useOwnerHomePage };
