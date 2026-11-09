// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { NotificationInboxItem } from '@views/notification-inbox-page/config/notificationInboxTypes';
import { useNotificationInboxDeepLink } from '@views/notification-inbox-page/model/useNotificationInboxDeepLink';

const push = vi.fn();

vi.mock('@shared/lib/bridge', () => ({
  useStackNavigation: () => ({ push }),
  useTabNavigation: () => ({ navigateToTab: vi.fn() }),
}));
vi.mock('@views/guardian-kindergarten-page/model/useGuardianSelectedPet', () => ({
  useGuardianSelectedPet: () => ({ pets: [], isPetsReady: false, isPetsError: false }),
}));
vi.mock('@views/guardian-kindergarten-page/model/useGuardianSelectedPetStore', () => ({
  useGuardianSelectedPetStore: () => vi.fn(),
}));
vi.mock('@features/role-conversion', () => ({
  useMypageRoleViewStore: { getState: () => ({ setPrefersGuardianView: vi.fn() }) },
}));
vi.mock('@shared/ui/toast', () => ({ toast: vi.fn() }));

const createItem = (type: string): NotificationInboxItem => ({
  id: '1',
  type,
  title: '',
  body: '',
  kindergartenName: '',
  petName: '',
  sentAt: '2026-11-09T00:00:00Z',
  isRead: false,
});

describe('승인 대기 진입점을 신청 탭으로 변경', () => {
  beforeEach(() => push.mockClear());

  it('보호자 연결 신청·신청 취소 알림을 누르면 구성원 화면의 `신청` 탭이 열린다', () => {
    const { result } = renderHook(() => useNotificationInboxDeepLink());

    for (const type of ['GUARDIAN_APPLICATION_REQUESTED', 'GUARDIAN_APPLICATION_CANCELLED']) {
      push.mockClear();
      result.current.openNotification(createItem(type));

      expect(push).toHaveBeenCalledWith({
        pathname: '/owner/members',
        query: { tab: 'pending' },
      });
    }
  });
});
