// @vitest-environment jsdom
import { cleanup, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
const FUTURE_KEY = '2026-06-19';
const ACTION_BUTTON_NAME = /^(등원처리|결석처리|하원처리|등원 취소|결석 취소|하원 취소|취소하기)$/;

let user: ReturnType<typeof userEvent.setup>;

/** 열려 있는 탭 안의 원생 카드들. 토스트도 목록 항목이라서 탭 안에서만 찾는다. */
const getCards = () => {
  const tabPanel = screen.queryByRole('tabpanel');
  return tabPanel ? within(tabPanel).queryAllByRole('listitem') : [];
};

const findCard = async (name: string) => {
  const cards = await waitFor(() => {
    const found = getCards();
    expect(found.length).toBeGreaterThan(0);
    return found;
  });
  const card = cards.find((item) => item.textContent?.includes(name));
  if (!card) throw new Error(`${name} 카드를 찾지 못했어요`);

  return card;
};

/** 다음날(미래 날짜)로 이동한다. */
const openFutureDay = async () => {
  renderOwnerDaily(<OwnerDailyPage />);
  await user.click(await screen.findByRole('button', { name: '다음날' }));
};

const seedFutureDay = () => {
  fakeAttendanceServer.seedDay(FUTURE_KEY, [
    createFakePet({ name: '콩이', reservedTime: '09:00', firstAttendance: true, requestMemo: '알레르기가 있어요' }),
    createFakePet({ name: '보리', reservedTime: '14:30' }),
  ]);
};

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date('2026-06-18T10:00:00+09:00'));
  user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  fakeAttendanceServer.reset();
  fakeAttendanceServer.seedDay(TODAY_KEY, [createFakePet({ name: '오늘원생' })]);
  pushMock.mockReset();
  pushMock.mockResolvedValue(undefined);
});
afterEach(() => {
  toast.clear();
  cleanup();
  vi.useRealTimers();
});

describe('미래 날짜 일과', () => {
  test('미래 날짜에서는 `등원목록` 탭이 기본으로 열리고 그날 예약한 원생이 조회 전용으로 보인다', async () => {
    seedFutureDay();
    await openFutureDay();

    await findCard('콩이');
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe('등원목록');
    expect(getCards().map((card) => card.textContent)).toEqual([
      expect.stringContaining('콩이'),
      expect.stringContaining('보리'),
    ]);
    expect(screen.queryAllByRole('button', { name: ACTION_BUTTON_NAME })).toHaveLength(0);
  });

  test('미래 날짜에는 처리 버튼, 집계, 검색창, 필터 칩이 없다', async () => {
    seedFutureDay();
    await openFutureDay();
    await findCard('콩이');

    expect(screen.queryAllByRole('button', { name: ACTION_BUTTON_NAME })).toHaveLength(0);
    expect(screen.queryByRole('group', { name: '등원 완료' })).toBeNull();
    expect(screen.queryByRole('group', { name: '결석 확정' })).toBeNull();
    expect(screen.queryByRole('group', { name: '하원 완료' })).toBeNull();
    expect(screen.queryByRole('searchbox')).toBeNull();
    expect(screen.queryByRole('group', { name: '필터' })).toBeNull();
  });

  test('미래 날짜 배너에도 하루 정원 유무와 무관하게 전체 등록 원생 수를 보여 준다', async () => {
    seedFutureDay();
    fakeAttendanceServer.setSettings({ dailyCapacity: 5, totalMemberCount: 10 });
    await openFutureDay();
    await findCard('콩이');

    expect(screen.getByRole('region', { name: '등원 현황' }).textContent).toContain('2 / 10 ');

    cleanup();
    fakeAttendanceServer.setSettings({ dailyCapacity: null });
    await openFutureDay();
    await findCard('콩이');

    expect(screen.getByRole('region', { name: '등원 현황' }).textContent).toContain('2 / 10 ');
  });

  test('미래 날짜에서 `등원처리` 탭을 누르면 목록 대신 안내가 보인다', async () => {
    seedFutureDay();
    await openFutureDay();
    await findCard('콩이');

    await user.click(screen.getByRole('tab', { name: '등원처리' }));

    expect(await screen.findByText('미래 날짜의 일과는 확인할 수 없어요')).toBeTruthy();
    expect(getCards()).toHaveLength(0);
  });

  test('미래 날짜 카드에 `첫등원` 칩과 요청사항(기본 접힘, 눌러서 펼침·접힘), `등원 예정 오전 9:00` 형식의 시간이 보인다', async () => {
    // jsdom에는 레이아웃이 없어서, 요청사항 글이 두 줄보다 길어 잘린 상태(내용 높이 > 보이는 높이)를 흉내 낸다.
    const scrollHeightSpy = vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(100);
    const clientHeightSpy = vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(40);
    seedFutureDay();
    await openFutureDay();

    const firstCard = within(await findCard('콩이'));
    expect(firstCard.getByText('첫등원')).toBeTruthy();
    expect(firstCard.getByText('등원 예정 오전 9:00')).toBeTruthy();
    const toggle = firstCard.getByRole('button', { name: '요청사항 더보기' });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    await user.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    await user.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    const secondCard = within(await findCard('보리'));
    expect(secondCard.queryByText('첫등원')).toBeNull();
    expect(secondCard.queryByRole('group', { name: '요청사항' })).toBeNull();
    expect(secondCard.getByText('등원 예정 오후 2:30')).toBeTruthy();

    scrollHeightSpy.mockRestore();
    clientHeightSpy.mockRestore();
  });

  test('그날 예약한 원생이 없으면 날짜 선택과 `오늘` 버튼만 남기고 배너·탭·목록은 보이지 않는다', async () => {
    await openFutureDay();

    expect(await screen.findByText('등원 예정인 강아지가 없어요')).toBeTruthy();
    expect(screen.queryByRole('region', { name: '등원 현황' })).toBeNull();
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(getCards()).toHaveLength(0);
    expect(screen.getByRole('button', { name: '오늘' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '다음날' })).toBeTruthy();
  });

  test('미래 날짜에서 `오늘` 버튼을 누르면 오늘 일과로 돌아와 처리할 수 있다', async () => {
    seedFutureDay();
    await openFutureDay();
    await findCard('콩이');

    await user.click(screen.getByRole('button', { name: '오늘' }));

    expect(screen.getByRole('tab', { selected: true }).textContent).toBe('등원처리');
    const todayCard = await findCard('오늘원생');
    expect(within(todayCard).getByRole('button', { name: '등원처리' })).toBeTruthy();
  });
});
