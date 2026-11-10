// @vitest-environment jsdom
import { cleanup, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { createFakePet, fakeAttendanceServer } from '@views/owner-daily-page/lib/ownerDailyFakeServer';
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

let user: ReturnType<typeof userEvent.setup>;

/** 이름이 들어 있는 카드(목록 항목)를 찾는다. */
const findCard = async (name: string) => {
  const cards = await screen.findAllByRole('listitem');
  const card = cards.find((item) => item.textContent?.includes(name));
  if (!card) throw new Error(`${name} 카드를 찾지 못했어요`);

  return card;
};

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date('2026-06-18T10:00:00+09:00'));
  user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  fakeAttendanceServer.reset();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('등원처리 탭 카드 표시', () => {
  test('프로필 사진이 없으면 기본 이미지가 보인다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [createFakePet({ name: '콩이', profileImage: null })]);
    renderOwnerDaily(<OwnerDailyPage />);

    const card = await findCard('콩이');

    expect(within(card).getByRole('img', { name: /기본 프로필 이미지/ })).toBeTruthy();
  });

  test('첫 등원 원생에게만 `첫등원` 칩이 보인다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', firstAttendance: true }),
      createFakePet({ name: '보리', firstAttendance: false }),
    ]);
    renderOwnerDaily(<OwnerDailyPage />);

    expect(within(await findCard('콩이')).getByText('첫등원')).toBeTruthy();
    expect(within(await findCard('보리')).queryByText('첫등원')).toBeNull();
  });

  test('요청사항이 없으면 요청사항 영역이 보이지 않는다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', requestMemo: '알레르기가 있어요' }),
      createFakePet({ name: '보리', requestMemo: null }),
    ]);
    renderOwnerDaily(<OwnerDailyPage />);

    expect(within(await findCard('콩이')).getByRole('group', { name: '요청사항' })).toBeTruthy();
    expect(within(await findCard('보리')).queryByRole('group', { name: '요청사항' })).toBeNull();
  });

  test('요청사항이 길면 일부만 보이고, 화살표를 누르면 펼쳐지고 다시 누르면 접힌다', async () => {
    // jsdom에는 레이아웃이 없어서, 요청사항 글이 두 줄보다 길어 잘린 상태(내용 높이 > 보이는 높이)를 흉내 낸다.
    const scrollHeightSpy = vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(100);
    const clientHeightSpy = vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(40);
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', requestMemo: '아주 긴 요청사항 '.repeat(20) }),
    ]);
    renderOwnerDaily(<OwnerDailyPage />);

    const toggle = within(await findCard('콩이')).getByRole('button', { name: '요청사항 더보기' });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    await user.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    await user.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    scrollHeightSpy.mockRestore();
    clientHeightSpy.mockRestore();
  });

  test('등원 전 카드에는 `HH:MM 등원 예정` 시간과 결석처리·등원처리 버튼이, 등원 완료 카드에는 `HH:MM 등원 완료` 시간과 등원 취소 버튼이, 결석 카드에는 `HH:MM 등원 예정` 시간과 결석 취소 버튼이 보인다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', reservedTime: '11:00' }),
      createFakePet({
        name: '보리',
        reservedTime: '08:30',
        status: 'CHECKED_IN',
        // 한국 시간 09:05
        checkInAt: '2026-06-18T00:05:00.000Z',
      }),
      createFakePet({ name: '초코', reservedTime: '10:30', status: 'ABSENT' }),
    ]);
    renderOwnerDaily(<OwnerDailyPage />);

    const beforeCard = await findCard('콩이');
    expect(within(beforeCard).getByText('11:00 등원 예정')).toBeTruthy();
    expect(within(beforeCard).getByRole('button', { name: '결석처리' })).toBeTruthy();
    expect(within(beforeCard).getByRole('button', { name: '등원처리' })).toBeTruthy();

    const checkedInCard = await findCard('보리');
    expect(within(checkedInCard).getByText('09:05 등원 완료')).toBeTruthy();
    expect(within(checkedInCard).getByRole('button', { name: '등원 취소' })).toBeTruthy();
    expect(within(checkedInCard).queryByRole('button', { name: '등원처리' })).toBeNull();

    const absentCard = await findCard('초코');
    expect(within(absentCard).getByText('10:30 등원 예정')).toBeTruthy();
    expect(within(absentCard).getByRole('button', { name: '결석 취소' })).toBeTruthy();
    expect(within(absentCard).queryByRole('button', { name: '결석처리' })).toBeNull();
  });
});
