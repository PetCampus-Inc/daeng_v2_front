// @vitest-environment jsdom
import { act, cleanup, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { createFakePet, fakeAttendanceServer } from '@views/owner-daily-page/lib/ownerDailyFakeServer';
import { renderOwnerDaily } from '@views/owner-daily-page/lib/renderOwnerDaily';
import { OwnerDailyPage } from '@views/owner-daily-page/ui/OwnerDailyPage';

import { route } from '@shared/constants/route';

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
const ACTION_BUTTON_NAME = /^(등원처리|결석처리|하원처리|등원 취소|결석 취소|하원 취소|취소하기)$/;

let user: ReturnType<typeof userEvent.setup>;

const getCards = () => {
  const tabPanel = screen.queryByRole('tabpanel');
  return tabPanel ? within(tabPanel).queryAllByRole('listitem') : [];
};

/** 등원 현황 배너·집계·탭·목록·처리 버튼이 하나도 없는지 확인한다. */
const expectNoDailyContent = () => {
  expect(screen.queryByRole('region', { name: '등원 현황' })).toBeNull();
  expect(screen.queryByRole('group', { name: '등원 완료' })).toBeNull();
  expect(screen.queryByRole('tablist')).toBeNull();
  expect(getCards()).toHaveLength(0);
  expect(screen.queryAllByRole('button', { name: ACTION_BUTTON_NAME })).toHaveLength(0);
};

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

describe('등원 가능 시간 미설정과 예약 없음', () => {
  test('등원 가능 시간이 설정되지 않았으면 일과 화면 대신 안내 화면이 보이고 배너·집계·탭·목록·처리 버튼은 보이지 않는다', async () => {
    fakeAttendanceServer.setSettings({ reservationSettingConfigured: false });
    renderOwnerDaily(<OwnerDailyPage />);

    expect(await screen.findByRole('button', { name: '설정하기' })).toBeTruthy();
    expectNoDailyContent();
  });

  test('미설정 안내에서도 타이틀·알림 아이콘·날짜 선택은 유지된다', async () => {
    fakeAttendanceServer.setSettings({ reservationSettingConfigured: false });
    renderOwnerDaily(<OwnerDailyPage />);
    await screen.findByRole('button', { name: '설정하기' });

    expect(screen.getByText('일과')).toBeTruthy();
    expect(screen.getByRole('button', { name: '알림함' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /6월 18일 목요일/ })).toBeTruthy();
  });

  test('`설정하기`를 누르면 예약 설정 화면으로 이동한다', async () => {
    fakeAttendanceServer.setSettings({ reservationSettingConfigured: false });
    renderOwnerDaily(<OwnerDailyPage />);

    await user.click(await screen.findByRole('button', { name: '설정하기' }));

    expect(pushMock).toHaveBeenCalledWith({ pathname: route.mypage.kindergarten.reservation.root });
  });

  test('미설정이면 좌우 화살표는 비활성이고, 눌러도 날짜가 바뀌지 않으며 날짜를 눌러도 날짜 선택 시트가 열리지 않는다', async () => {
    fakeAttendanceServer.setSettings({ reservationSettingConfigured: false });
    renderOwnerDaily(<OwnerDailyPage />);
    await screen.findByRole('button', { name: '설정하기' });

    const prevButton = screen.getByRole('button', { name: '전날' });
    const nextButton = screen.getByRole('button', { name: '다음날' });
    expect((prevButton as HTMLButtonElement).disabled).toBe(true);
    expect((nextButton as HTMLButtonElement).disabled).toBe(true);

    await user.click(nextButton);
    await user.click(screen.getByRole('button', { name: /6월 18일 목요일/ }));

    expect(screen.getByRole('button', { name: /6월 18일 목요일/ })).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  test('설정을 마치고 일과 화면으로 돌아오면 기본 일과 화면이 보인다', async () => {
    fakeAttendanceServer.setSettings({ reservationSettingConfigured: false });
    renderOwnerDaily(<OwnerDailyPage />);
    await screen.findByRole('button', { name: '설정하기' });

    // 예약 설정 화면에서 설정을 마치고 돌아와 일과 화면이 다시 보이는 상황
    fakeAttendanceServer.setSettings({ reservationSettingConfigured: true });
    act(() => {
      document.dispatchEvent(new Event('visibilitychange', { bubbles: true }));
    });

    expect(await screen.findByRole('tab', { name: '등원처리', selected: true })).toBeTruthy();
    expect(screen.queryByRole('button', { name: '설정하기' })).toBeNull();
  });

  test('오늘 예약한 원생이 없으면 날짜 선택과 `오늘` 버튼만 남기고 배너·집계·탭·목록은 보이지 않는다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, []);
    renderOwnerDaily(<OwnerDailyPage />);

    expect(await screen.findByText('등원 예정인 강아지가 없어요')).toBeTruthy();
    expectNoDailyContent();
    expect(screen.getByRole('button', { name: /6월 18일 목요일/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: '오늘' })).toBeTruthy();
  });

  test('연결된 원생이 한 명도 없어도 같은 화면이고 `보호자 초대하기` 버튼은 없다', async () => {
    // 등원 가능 시간은 설정됐고 오늘 데이터가 아예 없는 유치원
    fakeAttendanceServer.reset();
    renderOwnerDaily(<OwnerDailyPage />);

    expect(await screen.findByText('등원 예정인 강아지가 없어요')).toBeTruthy();
    expect(screen.queryByRole('button', { name: '보호자 초대하기' })).toBeNull();
    expectNoDailyContent();
  });
});
