// @vitest-environment jsdom
import { act, cleanup, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { setFakeUrl } from '@views/owner-daily-page/lib/fakeNextNavigation';
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
vi.mock('next/navigation', () => import('@views/owner-daily-page/lib/fakeNextNavigation'));
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
const PAST_KEY = '2026-06-17';
const CHECK_IN_AT = '2026-06-17T00:00:00.000Z';

let user: ReturnType<typeof userEvent.setup>;

const getCurrentUrl = () => `${window.location.pathname}${window.location.search}`;
const getUrlParams = () => new URLSearchParams(window.location.search);
const getLateToggle = () => screen.getByRole('button', { name: '지각만 보기' });
const getCardNames = () =>
  within(screen.getByRole('tabpanel'))
    .queryAllByRole('listitem')
    .map((item) => ['콩이', '보리'].find((name) => item.textContent?.includes(name)));

/** 뒤로가기로 일과 화면에 돌아오는 것을 흉내 낸다. 화면을 지우고, 그때 주소 그대로 다시 그린다. */
const reopenWithCurrentUrl = () => {
  const url = getCurrentUrl();
  cleanup();
  renderOwnerDaily(<OwnerDailyPage />, { url });
};

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  // 현재 시각 10:00 → 09:00 예약은 지각, 11:00 예약은 지각이 아니다.
  vi.setSystemTime(new Date('2026-06-18T10:00:00+09:00'));
  user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  fakeAttendanceServer.reset();
  fakeAttendanceServer.seedDay(TODAY_KEY, [
    createFakePet({ name: '콩이', reservedTime: '09:00' }),
    createFakePet({ name: '보리', reservedTime: '11:00' }),
  ]);
  fakeAttendanceServer.seedDay(PAST_KEY, [
    createFakePet({ name: '콩이', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT }),
    createFakePet({ name: '보리', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT, attendanceRecordSent: true }),
  ]);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('일과 화면 상태를 주소로 유지', () => {
  test('탭을 바꾸고 뒤로가기로 돌아오면 그 탭이 그대로 열린다', async () => {
    renderOwnerDaily(<OwnerDailyPage />);
    await user.click(await screen.findByRole('tab', { name: '등원목록' }));
    expect(getUrlParams().get('tab')).toBe('attendance-list');

    reopenWithCurrentUrl();

    expect(await screen.findByRole('tab', { name: '등원목록', selected: true })).toBeTruthy();
  });

  test('지난 날짜와 등원목록 필터를 고르고 뒤로가기로 돌아오면 같은 날짜·필터로 열린다', async () => {
    renderOwnerDaily(<OwnerDailyPage />);
    await user.click(await screen.findByRole('button', { name: '전날' }));
    await user.click(await screen.findByRole('button', { name: /^재원중/ }));
    expect(getUrlParams().get('date')).toBe(PAST_KEY);
    expect(getUrlParams().get('todayFilter')).toBe('CURRENTLY_IN');

    reopenWithCurrentUrl();

    expect(await screen.findByRole('button', { name: /^재원중/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /^재원중/ }).getAttribute('aria-pressed')).toBe('true');
    expect(getUrlParams().get('date')).toBe(PAST_KEY);
  });

  test('날짜를 바꾸면 탭과 등원목록 필터는 주소에서 지워지고 그 날짜의 기본값으로 돌아간다', async () => {
    renderOwnerDaily(<OwnerDailyPage />, {
      url: `/owner/daily?date=${PAST_KEY}&tab=attendance-list&todayFilter=CURRENTLY_IN`,
    });

    await user.click(await screen.findByRole('button', { name: '전날' }));

    expect(getUrlParams().get('date')).toBe('2026-06-16');
    expect(getUrlParams().has('tab')).toBe(false);
    expect(getUrlParams().has('todayFilter')).toBe(false);
  });

  test('검색어와 지각 토글도 뒤로가기로 돌아오면 그대로 남아 있다', async () => {
    renderOwnerDaily(<OwnerDailyPage />);
    await user.type(await screen.findByRole('searchbox', { name: '원생 검색' }), '콩');
    await user.click(getLateToggle());
    expect(getUrlParams().get('q')).toBe('콩');
    expect(getUrlParams().get('lateOnly')).toBe('true');

    reopenWithCurrentUrl();

    expect((await screen.findByRole('searchbox', { name: '원생 검색' })).getAttribute('value')).toBe('콩');
    expect(getLateToggle().getAttribute('aria-pressed')).toBe('true');
  });

  test('검색어를 지우면 주소에서도 지워진다', async () => {
    renderOwnerDaily(<OwnerDailyPage />);
    await user.type(await screen.findByRole('searchbox', { name: '원생 검색' }), '보리');

    await user.click(screen.getByRole('button', { name: '검색어 지우기' }));

    expect(getUrlParams().has('q')).toBe(false);
  });

  test('홈에서 들어온 표시(`from=home`)는 화면 상태를 바꿔도 주소에 남는다', async () => {
    renderOwnerDaily(<OwnerDailyPage />, { url: '/owner/daily?from=home&homeEntry=1' });

    await user.click(await screen.findByRole('tab', { name: '등원목록' }));

    expect(getUrlParams().get('from')).toBe('home');
    expect(getUrlParams().get('tab')).toBe('attendance-list');
  });
});

describe('홈·알림이 새 주소로 열 때', () => {
  test('지난 날짜를 보던 중이라도 날짜 없이 열면 오늘 `등원처리` 탭이 지각 토글을 켠 채로 열린다', async () => {
    renderOwnerDaily(<OwnerDailyPage />, {
      url: `/owner/daily?date=${PAST_KEY}&tab=attendance-list&todayFilter=CURRENTLY_IN`,
    });
    expect(await screen.findByRole('tab', { name: '등원목록', selected: true })).toBeTruthy();

    act(() => setFakeUrl('/owner/daily?tab=attendance-check&lateOnly=true&from=home&homeEntry=2'));

    expect(await screen.findByRole('tab', { name: '등원처리', selected: true })).toBeTruthy();
    expect(getLateToggle().getAttribute('aria-pressed')).toBe('true');
    expect(getCardNames()).toEqual(['콩이']);
  });

  test('검색어 없이 열면 보던 검색어가 지워진다', async () => {
    renderOwnerDaily(<OwnerDailyPage />, { url: '/owner/daily?q=보리' });
    expect((await screen.findByRole('searchbox', { name: '원생 검색' })).getAttribute('value')).toBe('보리');

    act(() => setFakeUrl('/owner/daily?tab=attendance-check&lateOnly=true&homeEntry=3'));

    expect(screen.getByRole('searchbox', { name: '원생 검색' }).getAttribute('value')).toBe('');
  });

  test('`발송전` 필터로 열면 오늘 `등원목록` 탭이 그 칩을 선택한 채로 열린다', async () => {
    // 등원목록 칩은 오늘 등원한 원생이 있어야 보인다.
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT }),
    ]);
    renderOwnerDaily(<OwnerDailyPage />, { url: '/owner/daily?tab=attendance-list&todayFilter=UNSENT_RECORD' });

    expect(await screen.findByRole('tab', { name: '등원목록', selected: true })).toBeTruthy();
    expect((await screen.findByRole('button', { name: /^발송전/ })).getAttribute('aria-pressed')).toBe('true');
  });
});

describe('주소에 이상한 값이 들어오면', () => {
  test.each([
    ['없는 날짜·모르는 탭·모르는 필터·대문자 TRUE', '?date=2026-02-31&tab=nope&todayFilter=x&lateOnly=TRUE'],
    ['형식이 다른 날짜', '?date=2026-6-1&tab=&todayFilter=&lateOnly=1'],
    ['공백·지수 표기', '?date=%202026-06-17&lateOnly=1e3&tab=0x10'],
    ['선택 가능 범위를 벗어난 날짜', '?date=2099-01-01'],
  ])('%s는 없는 값으로 보고 오늘 `등원처리` 탭을 기본으로 연다', async (_name, query) => {
    renderOwnerDaily(<OwnerDailyPage />, { url: `/owner/daily${query}` });

    expect(await screen.findByRole('tab', { name: '등원처리', selected: true })).toBeTruthy();
    expect(getLateToggle().getAttribute('aria-pressed')).toBe('false');
    expect(getCardNames()).toEqual(['콩이', '보리']);
  });
});
