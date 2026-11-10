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

import { REQUEST_FAILED_MESSAGE } from '@shared/api';
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
/** 한국 시간 오전 9시 */
const CHECK_IN_AT = '2026-06-18T00:00:00.000Z';

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

const getStatValue = (label: string) => screen.getByRole('group', { name: label }).textContent ?? '';

/** 카드 안의 버튼을 누른다. */
const clickCardButton = async (name: string, buttonName: string) => {
  const card = await findCard(name);
  await user.click(within(card).getByRole('button', { name: buttonName }));
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

describe('하원 처리와 알림장 이동', () => {
  test('알림장을 안 보낸 재원 중 원생을 하원처리하면 `하원완료` 태그와 하원 취소 버튼으로 바뀌고 하원 시각이 보인다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT }),
    ]);
    await openListTab();

    await clickCardButton('콩이', '하원처리');

    await waitFor(async () => {
      const card = await findCard('콩이');
      expect(within(card).getByText('하원완료')).toBeTruthy();
      expect(within(card).getByRole('button', { name: '하원 취소' })).toBeTruthy();
      expect(within(card).queryByRole('button', { name: '하원처리' })).toBeNull();
      expect(within(card).getByText(/^하원 (오전|오후) \d{1,2}:\d{2}$/)).toBeTruthy();
    });
  });

  test('알림장을 보낸 재원 중 원생을 하원처리하면 `일과 완료` 태그로 바뀐다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT, attendanceRecordSent: true }),
    ]);
    await openListTab();

    await clickCardButton('콩이', '하원처리');

    await waitFor(async () => {
      const card = await findCard('콩이');
      expect(within(card).getByText('일과 완료')).toBeTruthy();
      expect(within(card).queryByText('발송완료')).toBeNull();
    });
  });

  test('하원 처리가 성공하면 집계의 하원 완료 수치가 바로 늘어난다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT }),
    ]);
    await openListTab();
    await findCard('콩이');
    expect(getStatValue('하원 완료')).toContain('0');

    await clickCardButton('콩이', '하원처리');

    await waitFor(() => expect(getStatValue('하원 완료')).toContain('1'));
  });

  test('하원 처리가 실패하면 카드 상태를 바꾸지 않고 실패 안내를 보여 준다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT }),
    ]);
    fakeAttendanceServer.failNextAction('postAttendanceCheckOut');
    await openListTab();

    await clickCardButton('콩이', '하원처리');

    expect(await screen.findByText(REQUEST_FAILED_MESSAGE)).toBeTruthy();
    const card = await findCard('콩이');
    expect(within(card).getByText('등원완료')).toBeTruthy();
    expect(within(card).getByRole('button', { name: '하원처리' })).toBeTruthy();
    expect(within(card).queryByRole('button', { name: '하원 취소' })).toBeNull();
  });

  test('하원 처리 요청 중에는 버튼을 다시 눌러도 요청이 한 번만 간다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT }),
    ]);
    await openListTab();
    const release = fakeAttendanceServer.holdActions();

    await clickCardButton('콩이', '하원처리');
    await clickCardButton('콩이', '하원처리');
    release();

    await waitFor(async () => {
      expect(within(await findCard('콩이')).getByText('하원완료')).toBeTruthy();
    });
    expect(fakeAttendanceApi.postAttendanceCheckOut).toHaveBeenCalledTimes(1);
  });

  test('`알림장 작성하기`를 누르면 그 원생의 알림장 작성 화면으로 이동한다', async () => {
    const pet = createFakePet({ name: '콩이', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT });
    fakeAttendanceServer.seedDay(TODAY_KEY, [pet]);
    await openListTab();

    await clickCardButton('콩이', '알림장 작성하기');

    expect(pushMock).toHaveBeenCalledWith({
      pathname: route.owner.daily.notice.write.root.replace('[id]', String(pet.petId)),
    });
  });

  test('`알림장 보기`를 누르면 발송된 알림장 상세로 이동한다', async () => {
    const pet = createFakePet({
      name: '콩이',
      status: 'CHECKED_IN',
      checkInAt: CHECK_IN_AT,
      attendanceRecordSent: true,
    });
    fakeAttendanceServer.seedDay(TODAY_KEY, [pet]);
    await openListTab();

    await clickCardButton('콩이', '알림장 보기');

    expect(pushMock).toHaveBeenCalledWith({
      pathname: route.owner.daily.notice.write.root.replace('[id]', String(pet.petId)),
    });
  });
});
