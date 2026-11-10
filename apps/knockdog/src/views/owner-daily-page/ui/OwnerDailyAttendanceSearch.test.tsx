// @vitest-environment jsdom
import { cleanup, screen, waitFor } from '@testing-library/react';
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

const findSearchBox = () => screen.findByRole('searchbox', { name: '원생 검색' });
const getLateToggle = () => screen.getByRole('button', { name: '지각' });
const getPetCount = () => Number(screen.getByText(/강아지수/).textContent?.replace(/\D/g, ''));
const getCardNames = () => screen.queryAllByRole('listitem').map((item) => item.textContent ?? '');

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  // 현재 시각 10:00 → 09:00 예약은 지각, 11:00 예약은 지각이 아니다
  vi.setSystemTime(new Date('2026-06-18T10:00:00+09:00'));
  user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  fakeAttendanceServer.reset();
  fakeAttendanceServer.seedDay(TODAY_KEY, [
    createFakePet({ name: '콩이', breed: '말티즈', reservedTime: '09:00' }),
    createFakePet({ name: '보리', breed: '푸들', reservedTime: '11:00' }),
    createFakePet({ name: '초코', breed: '말티즈', reservedTime: '11:30' }),
  ]);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('등원처리 탭 검색', () => {
  test('검색어를 입력할 때마다 목록과 `강아지수`가 바로 바뀐다', async () => {
    renderOwnerDaily(<OwnerDailyPage />);
    const searchBox = await findSearchBox();
    expect(getPetCount()).toBe(3);

    await user.type(searchBox, '말');
    expect(getPetCount()).toBe(2);
    expect(getCardNames().some((text) => text.includes('보리'))).toBe(false);

    await user.type(searchBox, '티즈 ');
    expect(getPetCount()).toBe(2);

    await user.clear(searchBox);
    await user.type(searchBox, '콩');
    expect(getPetCount()).toBe(1);
    expect(getCardNames()[0]).toContain('콩이');
  });

  test('검색어를 지우면 전체 목록과 `강아지수`로 돌아온다', async () => {
    renderOwnerDaily(<OwnerDailyPage />);
    await user.type(await findSearchBox(), '보리');
    expect(getPetCount()).toBe(1);

    await user.click(screen.getByRole('button', { name: '검색어 지우기' }));

    expect(getPetCount()).toBe(3);
    expect(getCardNames()).toHaveLength(3);
  });

  test('검색 결과가 없으면 카드와 처리 버튼 대신 검색 결과 없음 안내가 보이고 검색어와 탭은 그대로 유지된다', async () => {
    renderOwnerDaily(<OwnerDailyPage />);
    const searchBox = (await findSearchBox()) as HTMLInputElement;

    await user.type(searchBox, '없는이름');

    expect(await screen.findByText('검색된 원생이 없어요')).toBeTruthy();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: '등원처리' })).toBeNull();
    expect(screen.queryByRole('button', { name: '결석처리' })).toBeNull();
    expect(searchBox.value).toBe('없는이름');
    expect(screen.getByRole('tab', { name: '등원처리' }).getAttribute('aria-selected')).toBe('true');
  });
});

describe('지각 토글', () => {
  test('토글은 기본으로 꺼져 있고, 켜면 지각 원생만 보이며 `강아지수`도 바뀐다', async () => {
    renderOwnerDaily(<OwnerDailyPage />);
    await findSearchBox();
    expect(getLateToggle().getAttribute('aria-pressed')).toBe('false');
    expect(getPetCount()).toBe(3);

    await user.click(getLateToggle());

    expect(getLateToggle().getAttribute('aria-pressed')).toBe('true');
    expect(getPetCount()).toBe(1);
    expect(getCardNames()[0]).toContain('콩이');
  });

  test('토글을 끄면 전체 목록과 `강아지수`로 돌아온다', async () => {
    renderOwnerDaily(<OwnerDailyPage />);
    await findSearchBox();
    await user.click(getLateToggle());
    expect(getPetCount()).toBe(1);

    await user.click(getLateToggle());

    expect(getPetCount()).toBe(3);
    expect(getCardNames()).toHaveLength(3);
  });

  test('토글을 켠 상태에서 지각 조건에 맞는 원생이 없으면 검색 결과 없음 안내가 보이고 토글은 켜진 채로 유지된다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [createFakePet({ name: '보리', reservedTime: '11:00' })]);
    renderOwnerDaily(<OwnerDailyPage />);
    await findSearchBox();

    await user.click(getLateToggle());

    expect(await screen.findByText('검색된 원생이 없어요')).toBeTruthy();
    expect(getLateToggle().getAttribute('aria-pressed')).toBe('true');
    await waitFor(() => expect(screen.queryAllByRole('listitem')).toHaveLength(0));
  });
});
