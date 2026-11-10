// @vitest-environment jsdom
import { cleanup, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { createFakePet, fakeAttendanceServer } from '@views/owner-daily-page/lib/ownerDailyFakeServer';
import { renderOwnerDaily } from '@views/owner-daily-page/lib/renderOwnerDaily';
import { OwnerDailyPage } from '@views/owner-daily-page/ui/OwnerDailyPage';

import { toast } from '@shared/ui/toast';

vi.mock('@entities/owner-attendance-checkinout/api/attendanceCheckinout', async () => {
  const { fakeAttendanceApi: api } = await import('@views/owner-daily-page/lib/ownerDailyFakeServer');
  return { ...api };
});
vi.mock('@shared/ui/bottom-sheet', async () => ({
  BottomSheet: await import('@views/owner-daily-page/lib/fakeBottomSheet'),
}));
const searchParamsMock = vi.hoisted(() => ({ current: new URLSearchParams() }));
vi.mock('next/navigation', () => ({
  useSearchParams: () => searchParamsMock.current,
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => '/owner/daily',
}));
const pushMock = vi.hoisted(() => vi.fn());
vi.mock('@shared/lib/bridge', () => ({
  useStackNavigation: () => ({ push: pushMock, back: vi.fn() }),
  useTabNavigation: () => ({ navigateToTab: vi.fn().mockResolvedValue(undefined) }),
  useNativeBackHandler: vi.fn(),
  useNativeBackToClose: vi.fn(),
  openConfirmDialog: vi.fn().mockResolvedValue({ status: 'unavailable' }),
}));
vi.mock('@entities/user', () => ({
  useUserStore: (selector: (state: { user: { userId: string } }) => unknown) =>
    selector({ user: { userId: 'owner-1' } }),
}));
vi.mock('@entities/notification', () => ({
  useHasUnreadNotificationQuery: () => ({ data: false }),
}));
vi.mock('@widgets/Header', () => {
  const Slot = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  const Header = Object.assign(Slot, {
    LeftSection: Slot,
    RightSection: Slot,
    Title: Slot,
    BackButton: () => <button type='button'>뒤로</button>,
  });
  return { Header };
});

const TODAY_KEY = '2026-06-18';

// 현재 시각 10:00 → 09:00 예약은 지각, 11:00 예약은 지각이 아니다.
beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date('2026-06-18T10:00:00+09:00'));
  fakeAttendanceServer.reset();
  fakeAttendanceServer.seedDay(TODAY_KEY, [
    createFakePet({ name: '콩이', reservedTime: '09:00' }),
    createFakePet({ name: '보리', reservedTime: '11:00' }),
  ]);
  searchParamsMock.current = new URLSearchParams();
  pushMock.mockReset();
  pushMock.mockResolvedValue(undefined);
});
afterEach(() => {
  toast.clear();
  cleanup();
  vi.useRealTimers();
});

describe('알림으로 일과 열기', () => {
  test('지각 토글이 켜진 상태로 이동하면 일과 화면이 `등원처리` 탭에서 지각 원생만 보여 준다', async () => {
    searchParamsMock.current = new URLSearchParams({ tab: 'attendance-check', lateOnly: 'true', source: 'inbox' });
    renderOwnerDaily(<OwnerDailyPage />);

    expect(await screen.findByRole('tab', { name: '등원처리', selected: true })).toBeTruthy();
    expect(screen.getByRole('button', { name: '지각' }).getAttribute('aria-pressed')).toBe('true');
    const cards = within(screen.getByRole('tabpanel')).getAllByRole('listitem');
    expect(cards).toHaveLength(1);
    expect(cards[0]?.textContent).toContain('콩이');
  });
});
