'use client';

import { useCallback, useRef } from 'react';

import { useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
import {
  UNAVAILABLE_NOTIFICATION_TOAST,
  type NotificationEntrySource,
} from '@shared/lib/notification/unavailableNotification';
import { toast } from '@shared/ui/toast';

/**
 * 대상 데이터 삭제 / 접근 불가 알림.
 * 푸시 → 보호자 홈(토스트 없음). 알림함 → 토스트 + 스택이면 뒤로가기.
 */
function useUnavailableNotificationAction() {
  const { back } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const didLeaveStackRef = useRef(false);

  const leaveUnavailableStackPage = useCallback(
    (source: NotificationEntrySource | null) => {
      if (didLeaveStackRef.current) return;
      didLeaveStackRef.current = true;

      if (source === 'push') {
        void navigateToTab('/compare');
        return;
      }

      toast(UNAVAILABLE_NOTIFICATION_TOAST);
      void back();
    },
    [back, navigateToTab]
  );

  const rejectUnavailableTabTarget = useCallback((source: NotificationEntrySource | null) => {
    if (source === 'inbox') toast(UNAVAILABLE_NOTIFICATION_TOAST);
  }, []);

  return { leaveUnavailableStackPage, rejectUnavailableTabTarget };
}

export { useUnavailableNotificationAction };
