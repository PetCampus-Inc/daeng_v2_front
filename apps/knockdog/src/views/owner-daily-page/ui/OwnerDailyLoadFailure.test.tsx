// @vitest-environment jsdom
import { cleanup, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
  createFakePet,
  fakeAttendanceApi,
  fakeAttendanceServer,
} from '@views/owner-daily-page/lib/ownerDailyFakeServer';
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
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
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

let user: ReturnType<typeof userEvent.setup>;

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date('2026-06-18T10:00:00+09:00'));
  user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  fakeAttendanceServer.reset();
  fakeAttendanceServer.seedDay(TODAY_KEY, [createFakePet({ name: '콩이' })]);
  pushMock.mockReset();
  pushMock.mockResolvedValue(undefined);
});
afterEach(() => {
  toast.clear();
  cleanup();
  vi.useRealTimers();
});

describe('조회 실패와 부분 실패', () => {
  test('현황 조회가 실패하면 콘텐츠 영역 전체가 오류 화면으로 바뀌고 헤더와 하단 내비게이션은 유지된다', async () => {
    fakeAttendanceServer.failNextRead('summary');
    renderOwnerDaily(<OwnerDailyPage />);

    expect(await screen.findByRole('button', { name: '다시 시도하기' })).toBeTruthy();
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.queryByRole('region', { name: '등원 현황' })).toBeNull();
    expect(screen.queryByRole('listitem')).toBeNull();
    // 헤더(타이틀·알림 아이콘)와 날짜 영역은 그대로 있다. 하단 내비게이션은 레이아웃이 맡는다.
    expect(screen.getByText('일과')).toBeTruthy();
    expect(screen.getByRole('button', { name: '알림함' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /6월 18일 목요일/ })).toBeTruthy();
  });

  test('목록 조회가 실패하면 현황 조회가 성공했어도 콘텐츠 영역 전체가 오류 화면으로 바뀐다', async () => {
    fakeAttendanceServer.failNextRead('candidates');
    renderOwnerDaily(<OwnerDailyPage />);

    expect(await screen.findByRole('button', { name: '다시 시도하기' })).toBeTruthy();
    await waitFor(() => expect(fakeAttendanceApi.getAttendanceCheckinoutSummary).toHaveBeenCalled());
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.queryByRole('region', { name: '등원 현황' })).toBeNull();
    expect(screen.queryByRole('listitem')).toBeNull();
  });

  test.each(['candidates', 'members'] as const)('%s 조회 실패 후 재시도하면 일과 화면이 복구된다', async (read) => {
    fakeAttendanceServer.failNextRead(read);
    renderOwnerDaily(<OwnerDailyPage />);
    await user.click(await screen.findByRole('button', { name: '다시 시도하기' }));

    expect(await screen.findByRole('tab', { name: '등원처리', selected: true })).toBeTruthy();
    expect(within(screen.getByRole('tabpanel')).getByRole('listitem').textContent).toContain('콩이');
    expect(screen.queryByRole('button', { name: '다시 시도하기' })).toBeNull();
    // 성공한 현황 조회는 다시 요청하지 않는다.
    expect(fakeAttendanceApi.getAttendanceCheckinoutSummary).toHaveBeenCalledTimes(1);
  });
});
