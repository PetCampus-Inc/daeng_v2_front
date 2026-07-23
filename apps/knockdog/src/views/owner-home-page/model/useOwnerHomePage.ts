import { useCallback, useEffect, useState } from 'react';
import { ownerHomeMock } from '@views/owner-home-page/model/ownerHomeMock';
import {
  formatKstDateLabel,
  formatKstDayLabel,
  formatKstTimeLabel,
  getKstDateKey,
  getNextKstMidnightDelay,
} from '@views/owner-home-page/model/ownerHomeDate';

import { useOwnerRole } from '@features/role-conversion';
import { useOwnerPendingMembersQuery } from '@entities/owner-member';
import { useUserStore } from '@entities/user';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

const SCHOOL_NAME_MAX_LENGTH = 15;

interface ApprovalBannerDismissal {
  count: number;
  isError: boolean;
  memberKey: string | null;
}

function formatSchoolName(name: string) {
  const characters = Array.from(name);

  if (characters.length <= SCHOOL_NAME_MAX_LENGTH) return name;

  return `${characters.slice(0, SCHOOL_NAME_MAX_LENGTH).join('')}···`;
}

function useOwnerHomePage() {
  const { push } = useStackNavigation();
  const userId = useUserStore((state) => state.user?.userId);
  const { isOwner, isResolved, kindergarten } = useOwnerRole();
  const schoolName = kindergarten?.name ?? '';
  const { today, noticebook } = ownerHomeMock;
  const [dismissedApprovalBanner, setDismissedApprovalBanner] = useState<ApprovalBannerDismissal | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(() => new Date());
  const {
    data: pendingMembers,
    isError: isPendingMembersError,
    refetch: refetchPendingMembers,
  } = useOwnerPendingMembersQuery({
    userId,
    enabled: isResolved && isOwner,
  });

  const approval = {
    isError: isPendingMembersError,
    pendingCount: pendingMembers?.totalMemberCount ?? 0,
  };

  const pendingMemberIds = pendingMembers?.members.map((member) => member.id).sort() ?? [];
  const approvalMemberKey = pendingMemberIds.length > 0 ? pendingMemberIds.join('|') : null;
  const isSameDismissedApprovalBanner =
    dismissedApprovalBanner?.isError === approval.isError &&
    dismissedApprovalBanner.count === approval.pendingCount &&
    (dismissedApprovalBanner.memberKey == null ||
      approvalMemberKey == null ||
      dismissedApprovalBanner.memberKey === approvalMemberKey);
  const shouldShowApprovalBanner =
    (approval.isError || approval.pendingCount > 0) && !isSameDismissedApprovalBanner;

  const handleApprovalBannerClick = () => {
    if (approval.isError) return;

    push({ pathname: route.owner.members.approval.root });
  };

  const handleFriendPreviewClick = () => {
    push({ pathname: route.owner.members.root });
  };

  const handleApprovalBannerClose = () => {
    setDismissedApprovalBanner({
      count: approval.pendingCount,
      isError: approval.isError,
      memberKey: approvalMemberKey,
    });
  };

  const handleRefresh = useCallback(() => {
    if (!isResolved || !isOwner) {
      setLastRefreshedAt(new Date());
      return;
    }

    // TODO: 오늘 요약/알림장 API가 추가되면 여기에서 함께 refetch
    refetchPendingMembers().finally(() => {
      setLastRefreshedAt(new Date());
    });
  }, [isOwner, isResolved, refetchPendingMembers]);

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
    handleRefresh,
    noticebook,
    shouldShowApprovalBanner,
    today: {
      ...today,
      currentTimeLabel: formatKstTimeLabel(lastRefreshedAt),
      dateLabel: formatKstDateLabel(lastRefreshedAt),
      dayLabel: formatKstDayLabel(lastRefreshedAt),
    },
  };
}

export { useOwnerHomePage };
