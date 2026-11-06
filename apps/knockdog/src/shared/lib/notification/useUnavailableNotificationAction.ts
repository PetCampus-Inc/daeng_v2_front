'use client';

import { useCallback, useRef } from 'react';

import { useMypageRoleViewStore } from '@features/role-conversion';

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
        // '/compare'는 보호자 전용 탭이라, 다른 탭으로 이동해도 원장으로
        // 되돌아가지 않도록 선호도를 같이 맞춘다.
        useMypageRoleViewStore.getState().setPrefersGuardianView(true);
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
