// @vitest-environment jsdom
import { act, cleanup, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
  createFakePet,
  fakeAttendanceApi,
  fakeAttendanceServer,
} from '@views/owner-daily-page/lib/ownerDailyFakeServer';
import { renderOwnerDaily } from '@views/owner-daily-page/lib/renderOwnerDaily';
import { OwnerDailyPage } from '@views/owner-daily-page/ui/OwnerDailyPage';

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
vi.mock('@shared/lib/bridge', () => ({
  useStackNavigation: () => ({ push: vi.fn(), back: vi.fn() }),
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
// 2026-06-18은 목요일이다.
const TODAY_LABEL = /^6월 18일 목요일$/;

const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

const findDateButton = (label: RegExp) => screen.findByRole('button', { name: label });

const openDatePickerSheet = async () => {
  await user.click(await findDateButton(/\d+월 \d+일/));
  return screen.findByRole('dialog');
};

const focusSpinbutton = (dialog: HTMLElement, name: string) => {
  const spinbutton = within(dialog).getByRole('spinbutton', { name });
  act(() => spinbutton.focus());
  return spinbutton;
};

describe('날짜 기준과 날짜 이동', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2026-06-18T10:00:00+09:00'));
    fakeAttendanceServer.reset();
    fakeAttendanceServer.seedDay(TODAY_KEY, [createFakePet({ name: '콩이' })]);
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  test('일과 화면에 들어가면 오늘 날짜로 열리고, 다른 화면에 갔다 돌아와도 오늘로 보인다', async () => {
    const { unmount } = renderOwnerDaily(<OwnerDailyPage />);

    expect(await findDateButton(TODAY_LABEL)).toBeTruthy();
    expect(fakeAttendanceApi.getAttendanceCheckinoutSummary).toHaveBeenCalledWith({ date: TODAY_KEY });

    await user.click(screen.getByRole('button', { name: '다음날' }));
    expect(await findDateButton(/^6월 19일 금요일$/)).toBeTruthy();

    unmount();
    renderOwnerDaily(<OwnerDailyPage />);

    expect(await findDateButton(TODAY_LABEL)).toBeTruthy();
  });

  test('오른쪽 화살표를 누르면 다음 날로, 왼쪽 화살표를 누르면 전날로 바뀌고 그 날짜의 현황과 목록을 다시 불러온다', async () => {
    renderOwnerDaily(<OwnerDailyPage />);
    await findDateButton(TODAY_LABEL);

    await user.click(screen.getByRole('button', { name: '다음날' }));
    expect(await findDateButton(/^6월 19일 금요일$/)).toBeTruthy();
    await waitFor(() => {
      expect(fakeAttendanceApi.getAttendanceCheckinoutSummary).toHaveBeenCalledWith({ date: '2026-06-19' });
      expect(fakeAttendanceApi.getAttendanceCheckinoutCandidates).toHaveBeenCalledWith({ date: '2026-06-19' });
    });

    await user.click(screen.getByRole('button', { name: '전날' }));
    await user.click(screen.getByRole('button', { name: '전날' }));
    expect(await findDateButton(/^6월 17일 수요일$/)).toBeTruthy();
    await waitFor(() => {
      expect(fakeAttendanceApi.getAttendanceCheckinoutSummary).toHaveBeenCalledWith({ date: '2026-06-17' });
      expect(fakeAttendanceApi.getAttendanceCheckinoutToday).toHaveBeenCalledWith({
        date: '2026-06-17',
        filter: undefined,
      });
    });
  });

  test('미래 날짜로도 이동할 수 있다', async () => {
    renderOwnerDaily(<OwnerDailyPage />);
    await findDateButton(TODAY_LABEL);

    for (let count = 0; count < 3; count += 1) {
      await user.click(screen.getByRole('button', { name: '다음날' }));
    }

    expect(await findDateButton(/^6월 21일 일요일$/)).toBeTruthy();
    expect((screen.getByRole('button', { name: '다음날' }) as HTMLButtonElement).disabled).toBe(false);
  });

  test('오늘이 아닌 날짜에서는 `오늘` 버튼이 활성화되고, 누르면 오늘로 돌아온다', async () => {
    renderOwnerDaily(<OwnerDailyPage />);
    await findDateButton(TODAY_LABEL);

    await user.click(screen.getByRole('button', { name: '전날' }));
    await findDateButton(/^6월 17일 수요일$/);
    const todayButton = screen.getByRole('button', { name: '오늘' }) as HTMLButtonElement;
    expect(todayButton.disabled).toBe(false);

    await user.click(todayButton);

    expect(await findDateButton(TODAY_LABEL)).toBeTruthy();
  });

  test('오늘을 보고 있을 때는 `오늘` 버튼이 비활성화된다', async () => {
    renderOwnerDaily(<OwnerDailyPage />);
    await findDateButton(TODAY_LABEL);

    expect((screen.getByRole('button', { name: '오늘' }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('날짜 선택 시트', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2026-06-18T10:00:00+09:00'));
    fakeAttendanceServer.reset();
    fakeAttendanceServer.seedDay(TODAY_KEY, [createFakePet({ name: '콩이' })]);
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  test('날짜 영역이나 캘린더 아이콘을 누르면 날짜 선택 시트가 열리고 지금 보고 있는 날짜가 선택되어 있다', async () => {
    renderOwnerDaily(<OwnerDailyPage />);
    await user.click(await findDateButton(TODAY_LABEL));

    const dialog = await screen.findByRole('dialog');

    expect(within(dialog).getByRole('spinbutton', { name: '연도 선택' }).getAttribute('aria-valuetext')).toBe('2026년');
    expect(within(dialog).getByRole('spinbutton', { name: '월 선택' }).getAttribute('aria-valuetext')).toBe('6월');
    expect(within(dialog).getByRole('spinbutton', { name: '일 선택' }).getAttribute('aria-valuetext')).toBe('18일');
  });

  test('시트 하단 버튼에 선택한 날짜가 `{YYYY}년 {M}월 {D}일 ({요일}) 검색`으로 실시간 바뀌고, 누르면 그 날짜로 이동한다', async () => {
    renderOwnerDaily(<OwnerDailyPage />);
    const dialog = await openDatePickerSheet();
    expect(within(dialog).getByRole('button', { name: /^2026년 6월 18일 \(목\) 검색$/ })).toBeTruthy();

    focusSpinbutton(dialog, '일 선택');
    await user.keyboard('{ArrowDown}');

    const searchButton = within(dialog).getByRole('button', { name: /^2026년 6월 19일 \(금\) 검색$/ });
    await user.click(searchButton);

    expect(await findDateButton(/^6월 19일 금요일$/)).toBeTruthy();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  test('지난 날짜와 미래 날짜를 모두 고를 수 있다', async () => {
    renderOwnerDaily(<OwnerDailyPage />);

    let dialog = await openDatePickerSheet();
    focusSpinbutton(dialog, '연도 선택');
    await user.keyboard('{ArrowUp}');
    await user.click(within(dialog).getByRole('button', { name: /^2025년 6월 18일 \(수\) 검색$/ }));
    expect(await findDateButton(/^2025년 6월 18일 수요일$/)).toBeTruthy();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    dialog = await openDatePickerSheet();
    focusSpinbutton(dialog, '연도 선택');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    await user.click(within(dialog).getByRole('button', { name: /^2027년 6월 18일 \(금\) 검색$/ }));
    expect(await findDateButton(/^2027년 6월 18일 금요일$/)).toBeTruthy();
  });

  test('딤 영역을 누르거나 시트를 내리면 날짜는 그대로 두고 닫힌다', async () => {
    renderOwnerDaily(<OwnerDailyPage />);

    let dialog = await openDatePickerSheet();
    focusSpinbutton(dialog, '일 선택');
    await user.keyboard('{ArrowDown}');
    const overlay = document.querySelector('[data-slot="bottom-sheet-overlay"]') as HTMLElement;
    await user.click(overlay);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('button', { name: TODAY_LABEL })).toBeTruthy();

    dialog = await openDatePickerSheet();
    focusSpinbutton(dialog, '일 선택');
    await user.keyboard('{ArrowDown}');
    await user.click(within(dialog).getByRole('button', { name: '닫기' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('button', { name: TODAY_LABEL })).toBeTruthy();
  });
});

describe('지각 판정', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2026-06-18T09:00:00+09:00'));
    fakeAttendanceServer.reset();
    fakeAttendanceServer.seedDay(TODAY_KEY, [createFakePet({ name: '콩이', reservedTime: '09:00' })]);
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  test('화면을 열어 둔 채 예정 시간 + 30분이 되면 새로 고침 없이 `지각` 칩이 나타난다', async () => {
    renderOwnerDaily(<OwnerDailyPage />);
    const card = await screen.findByRole('listitem');

    await act(async () => {
      vi.advanceTimersByTime(29 * 60 * 1000);
    });
    expect(within(card).queryByText('지각')).toBeNull();

    await act(async () => {
      vi.advanceTimersByTime(60 * 1000);
    });
    expect(within(card).getByText('지각')).toBeTruthy();
  });
});

describe('등원 현황 배너와 집계', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2026-06-18T10:00:00+09:00'));
    fakeAttendanceServer.reset();
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '가', status: 'NOT_CHECKED_IN' }),
      createFakePet({ name: '나', status: 'CHECKED_IN' }),
      createFakePet({ name: '다', status: 'CHECKED_OUT' }),
      createFakePet({ name: '라', status: 'ABSENT' }),
    ]);
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  test('하루 정원이 있으면 배너에 `{등원 예정 원생 수} / {하루 정원 수}` 숫자가 보인다', async () => {
    fakeAttendanceServer.setSettings({ dailyCapacity: 10 });
    renderOwnerDaily(<OwnerDailyPage />);

    const banner = await screen.findByRole('region', { name: '등원 현황' });

    expect(banner.textContent).toContain('4 / 10');
  });

  test('하루 정원이 없으면 배너에 분모 없이 등원 예정 원생 수만 보인다', async () => {
    fakeAttendanceServer.setSettings({ dailyCapacity: null });
    renderOwnerDaily(<OwnerDailyPage />);

    const banner = await screen.findByRole('region', { name: '등원 현황' });

    expect(banner.textContent).toContain('4');
    expect(banner.textContent).not.toContain('/');
  });

  test('집계에 등원 완료·결석 확정·하원 완료 수치가 보인다', async () => {
    renderOwnerDaily(<OwnerDailyPage />);
    await screen.findByRole('region', { name: '등원 현황' });

    // 등원 완료 = 등원 + 하원 완료(2), 결석 확정 = 1, 하원 완료 = 1
    expect(within(screen.getByRole('group', { name: '등원 완료' })).getByText('2')).toBeTruthy();
    expect(within(screen.getByRole('group', { name: '결석 확정' })).getByText('1')).toBeTruthy();
    expect(within(screen.getByRole('group', { name: '하원 완료' })).getByText('1')).toBeTruthy();
  });

  test('집계 항목을 눌러도 탭과 목록이 바뀌지 않는다', async () => {
    renderOwnerDaily(<OwnerDailyPage />);
    await screen.findByRole('region', { name: '등원 현황' });
    const selectedTabBefore = screen.getByRole('tab', { selected: true }).textContent;
    const cardCountBefore = (await screen.findAllByRole('listitem')).length;

    await user.click(screen.getByRole('group', { name: '등원 완료' }));
    await user.click(screen.getByRole('group', { name: '결석 확정' }));
    await user.click(screen.getByRole('group', { name: '하원 완료' }));

    expect(screen.getByRole('tab', { selected: true }).textContent).toBe(selectedTabBefore);
    expect(screen.getAllByRole('listitem')).toHaveLength(cardCountBefore);
  });
});

describe('등원처리·등원목록 탭', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2026-06-18T10:00:00+09:00'));
    fakeAttendanceServer.reset();
    fakeAttendanceServer.seedDay(TODAY_KEY, [createFakePet({ name: '콩이' })]);
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  test('오늘 일과에 들어가면 `등원처리` 탭이 선택되어 있고 `등원목록` 탭을 누르면 그 탭으로 바뀐다', async () => {
    renderOwnerDaily(<OwnerDailyPage />);

    const checkTab = await screen.findByRole('tab', { name: '등원처리' });
    const listTab = screen.getByRole('tab', { name: '등원목록' });
    expect(checkTab.getAttribute('aria-selected')).toBe('true');
    expect(listTab.getAttribute('aria-selected')).toBe('false');

    await user.click(listTab);

    expect(listTab.getAttribute('aria-selected')).toBe('true');
    expect(checkTab.getAttribute('aria-selected')).toBe('false');
  });
});
