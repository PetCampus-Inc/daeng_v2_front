// @vitest-environment jsdom
import { cleanup, screen, waitFor, within } from '@testing-library/react';
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
const PAST_KEY = '2026-06-17';
/** 한국 시간 오전 9시, 오후 6시 */
const CHECK_IN_AT = '2026-06-17T00:00:00.000Z';
const CHECK_OUT_AT = '2026-06-17T09:00:00.000Z';
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

/** 전날(지난 날짜)로 이동한다. */
const openPastDay = async () => {
  renderOwnerDaily(<OwnerDailyPage />);
  await user.click(await screen.findByRole('button', { name: '전날' }));
};

const seedPastDay = () => {
  fakeAttendanceServer.seedDay(PAST_KEY, [
    createFakePet({ name: '콩이', status: 'CHECKED_OUT', checkInAt: CHECK_IN_AT, checkOutAt: CHECK_OUT_AT }),
    createFakePet({ name: '보리', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT }),
    createFakePet({
      name: '두부',
      status: 'CHECKED_OUT',
      checkInAt: CHECK_IN_AT,
      checkOutAt: CHECK_OUT_AT,
      attendanceRecordSent: true,
    }),
    createFakePet({ name: '초코', status: 'ABSENT', reservedTime: '10:30' }),
    createFakePet({ name: '별이', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT, disconnected: true }),
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

describe('지난 날짜 일과', () => {
  test('지난 날짜에서는 `등원목록` 탭이 기본으로 열린다', async () => {
    seedPastDay();
    await openPastDay();
    await findCard('콩이');

    expect(screen.getByRole('tab', { selected: true }).textContent).toBe('등원목록');
  });

  test('지난 날짜에서 `등원처리` 탭을 누르면 목록 대신 안내가 보인다', async () => {
    seedPastDay();
    await openPastDay();
    await findCard('콩이');

    await user.click(screen.getByRole('tab', { name: '등원처리' }));

    expect(await screen.findByText('지난 날짜의 일과는 확인할 수 없어요')).toBeTruthy();
    expect(getCards()).toHaveLength(0);
  });

  test('지난 날짜에는 등원처리·결석처리·하원처리·취소 버튼이 하나도 없다', async () => {
    seedPastDay();
    await openPastDay();
    await findCard('콩이');
    expect(screen.queryAllByRole('button', { name: ACTION_BUTTON_NAME })).toHaveLength(0);

    await user.click(screen.getByRole('tab', { name: '등원처리' }));
    await screen.findByText('지난 날짜의 일과는 확인할 수 없어요');
    expect(screen.queryAllByRole('button', { name: ACTION_BUTTON_NAME })).toHaveLength(0);
  });

  test('지난 날짜 배너에 `{등원 완료 원생 수} / {하루 정원 수}`가 보이고 집계에 등원 완료·결석 확정·하원 미처리가 보인다', async () => {
    fakeAttendanceServer.setSettings({ dailyCapacity: 10 });
    seedPastDay();
    await openPastDay();

    const banner = await screen.findByRole('region', { name: '등원 현황' });

    // 등원 완료 = 등원·하원 완료 4명(콩이·보리·두부·별이)
    expect(banner.textContent).toContain('4 / 10');
    expect(within(screen.getByRole('group', { name: '등원 완료' })).getByText('4')).toBeTruthy();
    expect(within(screen.getByRole('group', { name: '결석 확정' })).getByText('1')).toBeTruthy();
    expect(within(screen.getByRole('group', { name: '하원 미처리' })).getByText('2')).toBeTruthy();
  });

  test('지난 날짜 필터 칩은 `전체`·`재원중`·`발송전`·`결석` 네 개이고 각 원생 수가 보인다', async () => {
    seedPastDay();
    await openPastDay();
    await findCard('콩이');

    const chips = within(screen.getByRole('group', { name: '필터' })).getAllByRole('button');

    expect(chips).toHaveLength(4);
    expect(chips.map((chip) => chip.textContent?.split(' ')[0])).toEqual(['전체', '재원중', '발송전', '결석']);
    expect(screen.getByRole('button', { name: '전체 5' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: '재원중 2' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /^발송전 \d+$/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: '결석 1' })).toBeTruthy();
  });

  test('`결석` 칩을 누르면 결석한 원생만 보인다', async () => {
    seedPastDay();
    await openPastDay();
    await findCard('콩이');

    await user.click(screen.getByRole('button', { name: '결석 1' }));

    await waitFor(() => expect(getCards()).toHaveLength(1));
    expect(getCards()[0]?.textContent).toContain('초코');
  });

  test('결석 카드에는 등원·하원 시각 대신 `등원 예정 HH:MM`과 `결석` 태그가 보인다', async () => {
    seedPastDay();
    await openPastDay();

    const card = await findCard('초코');

    expect(within(card).getByText('등원 예정 10:30')).toBeTruthy();
    expect(within(card).getByText('결석')).toBeTruthy();
    expect(within(card).queryByText(/^등원 (오전|오후)/)).toBeNull();
    expect(within(card).queryByText(/^하원 (오전|오후)/)).toBeNull();
  });

  test('하원 처리를 하지 않은 원생은 하원 시각 없이 등원 시각만 보이고 `재원중` 필터에 포함된다', async () => {
    seedPastDay();
    await openPastDay();

    const card = await findCard('보리');
    expect(within(card).getByText('등원 오전 9:00')).toBeTruthy();
    expect(within(card).queryByText(/^하원 /)).toBeNull();
    expect(within(await findCard('콩이')).getByText('하원 오후 6:00')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '재원중 2' }));

    await waitFor(() => expect(getCards()).toHaveLength(2));
    expect(getCards().some((item) => item.textContent?.includes('보리'))).toBe(true);
  });

  test('지난 날짜 카드를 누르면 원생 프로필의 등하원 기록 탭으로 이동하고, 결석 카드도 같다', async () => {
    seedPastDay();
    await openPastDay();
    const pets = fakeAttendanceServer.getPets(PAST_KEY);
    const getPetId = (name: string) => String(pets.find((pet) => pet.name === name)?.petId);

    await user.click(within(await findCard('콩이')).getByText('콩이'));
    expect(pushMock).toHaveBeenLastCalledWith({
      pathname: route.owner.members.detail.root.replace('[id]', getPetId('콩이')),
      query: { tab: 'attendance' },
    });

    await user.click(within(await findCard('초코')).getByText('초코'));
    expect(pushMock).toHaveBeenLastCalledWith({
      pathname: route.owner.members.detail.root.replace('[id]', getPetId('초코')),
      query: { tab: 'attendance' },
    });
  });

  test('연결이 해제된 원생 카드는 지난 날짜에도 보이지만 눌러도 이동하지 않는다', async () => {
    seedPastDay();
    await openPastDay();

    const card = await findCard('별이');
    await user.click(within(card).getByText('별이'));

    expect(pushMock).not.toHaveBeenCalled();
  });

  test('그날 등원·결석한 원생이 없으면 날짜 선택과 `오늘` 버튼만 남기고 배너·집계·탭·필터 칩·목록은 보이지 않는다', async () => {
    await openPastDay();

    await screen.findByText('등원 기록이 없어요');

    expect(screen.getByRole('button', { name: /6월 17일/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: '오늘' })).toBeTruthy();
    expect(screen.queryByRole('region', { name: '등원 현황' })).toBeNull();
    expect(screen.queryByRole('group', { name: '등원 완료' })).toBeNull();
    expect(screen.queryAllByRole('tab')).toHaveLength(0);
    expect(screen.queryByRole('group', { name: '필터' })).toBeNull();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  test('지난 날짜에서 `오늘` 버튼을 누르면 오늘 일과로 돌아온다', async () => {
    seedPastDay();
    await openPastDay();
    await findCard('콩이');

    await user.click(screen.getByRole('button', { name: '오늘' }));

    expect(await screen.findByRole('button', { name: /^6월 18일 목요일$/ })).toBeTruthy();
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe('등원처리');
  });
});
