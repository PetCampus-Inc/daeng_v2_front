// @vitest-environment jsdom
import { cleanup, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
  createFakePet,
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
/** 한국 시간 오전 9시, 오후 6시 */
const CHECK_IN_AT = '2026-06-18T00:00:00.000Z';
const CHECK_OUT_AT = '2026-06-18T09:00:00.000Z';
const TAG_LABELS = ['등원완료', '발송완료', '하원완료', '일과 완료', '연결해제'];

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

/** 오늘 일과를 열고 `등원목록` 탭으로 이동한다. */
const openListTab = async () => {
  renderOwnerDaily(<OwnerDailyPage />);
  await user.click(await screen.findByRole('tab', { name: '등원목록' }));
};

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date('2026-06-18T10:00:00+09:00'));
  user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  fakeAttendanceServer.reset();
  pushMock.mockReset();
  pushMock.mockResolvedValue(undefined);
});
afterEach(() => {
  toast.clear();
  cleanup();
  vi.useRealTimers();
});

describe('등원목록 탭 — 상태 태그와 버튼', () => {
  test('카드 하나에는 태그가 하나만 보인다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT }),
      createFakePet({ name: '보리', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT, attendanceRecordSent: true }),
      createFakePet({
        name: '초코',
        status: 'CHECKED_OUT',
        checkInAt: CHECK_IN_AT,
        checkOutAt: CHECK_OUT_AT,
      }),
      createFakePet({
        name: '두부',
        status: 'CHECKED_OUT',
        checkInAt: CHECK_IN_AT,
        checkOutAt: CHECK_OUT_AT,
        attendanceRecordSent: true,
      }),
      createFakePet({ name: '별이', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT, disconnected: true }),
    ]);
    await openListTab();

    await findCard('콩이');
    const cards = getCards();
    expect(cards).toHaveLength(5);
    cards.forEach((card) => {
      const tagCount = TAG_LABELS.filter((label) => within(card).queryByText(label)).length;
      expect(tagCount).toBe(1);
    });
  });

  test('오늘 등원목록에는 결석 카드와 `결석` 필터 칩이 없다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT }),
      createFakePet({ name: '보리', status: 'ABSENT' }),
    ]);
    await openListTab();

    await findCard('콩이');
    expect(getCards()).toHaveLength(1);
    expect(screen.queryByRole('button', { name: /결석/ })).toBeNull();
  });

  test('등원 시간은 `등원 오전 9:00` 형식으로 보이고 하원 전이면 하원 시간은 보이지 않는다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT }),
    ]);
    await openListTab();

    const card = await findCard('콩이');
    expect(within(card).getByText('등원 오전 9:00')).toBeTruthy();
    expect(within(card).queryByText(/^하원 (오전|오후)/)).toBeNull();
  });
});

describe('등원목록 탭 — 필터', () => {
  const seedFourPets = () =>
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT }),
      createFakePet({ name: '보리', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT, attendanceRecordSent: true }),
      createFakePet({
        name: '초코',
        status: 'CHECKED_OUT',
        checkInAt: CHECK_IN_AT,
        checkOutAt: CHECK_OUT_AT,
      }),
      createFakePet({
        name: '두부',
        status: 'CHECKED_OUT',
        checkInAt: CHECK_IN_AT,
        checkOutAt: CHECK_OUT_AT,
        attendanceRecordSent: true,
      }),
    ]);

  const getCardNames = () => getCards().map((card) => ['콩이', '보리', '초코', '두부'].find((name) => card.textContent?.includes(name)));

  test('`전체`·`재원중`·`발송전` 칩에 각 원생 수가 보이고 `전체`가 기본 선택이다', async () => {
    seedFourPets();
    await openListTab();

    const allChip = await screen.findByRole('button', { name: '전체 4' });
    expect(allChip.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: '재원중 2' }).getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByRole('button', { name: '발송전 2' }).getAttribute('aria-pressed')).toBe('false');
  });

  test('`재원중` 칩을 누르면 등원했고 아직 하원하지 않은 원생만 보인다', async () => {
    seedFourPets();
    await openListTab();

    await user.click(await screen.findByRole('button', { name: '재원중 2' }));

    await waitFor(() => expect(getCardNames()).toEqual(['보리', '콩이']));
    expect(screen.getByRole('button', { name: '재원중 2' }).getAttribute('aria-pressed')).toBe('true');
  });

  test('`발송전` 칩을 누르면 하원 여부와 상관없이 알림장을 보내지 않은 원생만 보인다', async () => {
    seedFourPets();
    await openListTab();

    await user.click(await screen.findByRole('button', { name: '발송전 2' }));

    await waitFor(() => expect(getCardNames()).toEqual(['초코', '콩이']));
  });

  test('선택한 필터에 맞는 원생이 없으면 카드와 처리 버튼 대신 필터 결과 없음 안내가 보이고 선택한 칩은 유지된다. 다른 칩을 누르면 목록이 바뀐다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT, attendanceRecordSent: true }),
    ]);
    await openListTab();

    await user.click(await screen.findByRole('button', { name: '발송전 0' }));

    expect(await screen.findByText('선택한 조건에 맞는 원생이 없어요')).toBeTruthy();
    expect(getCards()).toHaveLength(0);
    expect(screen.queryByRole('button', { name: '하원처리' })).toBeNull();
    expect(screen.getByRole('button', { name: '발송전 0' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('tab', { name: '등원목록' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '전체 1' }));

    await waitFor(() => expect(getCardNames()).toEqual(['콩이']));
    expect(screen.queryByText('선택한 조건에 맞는 원생이 없어요')).toBeNull();
  });
});

describe('연결 해제된 원생', () => {
  test('당일 연결이 해제된 원생은 등원처리 탭에 보이지 않는다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', status: 'NOT_CHECKED_IN' }),
      createFakePet({ name: '별이', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT, disconnected: true }),
    ]);
    renderOwnerDaily(<OwnerDailyPage />);

    await findCard('콩이');
    expect(getCards()).toHaveLength(1);
    expect(getCards().some((card) => card.textContent?.includes('별이'))).toBe(false);
  });

  test('당일 등원 이력이 있는 연결 해제 원생은 등원목록에 보이지만 카드를 눌러도 이동하지 않고 하단 버튼이 없다', async () => {
    const connectedPet = createFakePet({ name: '콩이', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT });
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      connectedPet,
      createFakePet({ name: '별이', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT, disconnected: true }),
    ]);
    await openListTab();

    const disconnectedCard = await findCard('별이');
    expect(within(disconnectedCard).getByText('연결해제')).toBeTruthy();
    expect(within(disconnectedCard).queryByRole('button', { name: '하원처리' })).toBeNull();
    expect(within(disconnectedCard).queryByRole('button', { name: '알림장 작성하기' })).toBeNull();

    await user.click(within(disconnectedCard).getByText('별이'));
    expect(pushMock).not.toHaveBeenCalled();

    // 연결된 원생의 카드는 눌렀을 때 이동한다.
    await user.click(within(await findCard('콩이')).getByText('콩이'));
    expect(pushMock).toHaveBeenCalledTimes(1);
  });
});
