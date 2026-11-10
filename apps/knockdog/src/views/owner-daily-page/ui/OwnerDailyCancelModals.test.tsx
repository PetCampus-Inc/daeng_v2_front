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

/** 화면에 떠 있는 토스트 글. 토스트는 카드와 달리 열려 있는 탭 밖에 그려진다. */
const getToastText = () => {
  const tabPanel = screen.getByRole('tabpanel');
  return screen
    .queryAllByRole('listitem')
    .filter((item) => !tabPanel.contains(item))
    .map((item) => item.textContent)
    .join('');
};

const findDialog = () => screen.findByRole('alertdialog');

/** 카드의 `등원 취소` 버튼을 눌러 확인 모달이 뜨면 `취소하기`까지 누른다. */
const cancelCheckInFromCard = async (name: string) => {
  await clickCardButton(name, '등원 취소');
  const dialog = await findDialog();
  await user.click(within(dialog).getByRole('button', { name: '취소하기' }));
};

/** 카드의 버튼(`결석 취소`·`하원 취소`)을 눌러 확인 모달이 뜨면 `취소하기`까지 누른다. */
const confirmCancelFromCard = async (name: string, buttonName: string) => {
  await clickCardButton(name, buttonName);
  await user.click(within(await findDialog()).getByRole('button', { name: '취소하기' }));
};

const getStatValue = (label: string) => screen.getByRole('group', { name: label }).textContent ?? '';

/** 카드 안의 버튼을 누른다. */
const clickCardButton = async (name: string, buttonName: string) => {
  const card = await findCard(name);
  await user.click(within(card).getByRole('button', { name: buttonName }));
};

/** 오늘 일과를 열고 `등원처리` 탭에서 시작한다. */
const openPage = async () => {
  renderOwnerDaily(<OwnerDailyPage />);
  await screen.findByRole('tab', { name: '등원처리' });
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

describe('등원 취소', () => {
  test('등원 취소 버튼을 누르면 항상 먼저 확인 모달이 열리고 모달에 원생 이름이 보인다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT }),
      // 하원 처리했거나 알림장을 보낸 원생도 모달은 먼저 열린다.
      createFakePet({
        name: '초코',
        status: 'CHECKED_OUT',
        checkInAt: CHECK_IN_AT,
        checkOutAt: CHECK_OUT_AT,
        attendanceRecordSent: true,
      }),
    ]);
    await openPage();

    await clickCardButton('콩이', '등원 취소');
    const dialog = await findDialog();
    expect(within(dialog).getByText(/콩이/)).toBeTruthy();
    await user.click(within(dialog).getByRole('button', { name: '닫기' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());

    await clickCardButton('초코', '등원 취소');
    expect(within(await findDialog()).getByText(/초코/)).toBeTruthy();
    expect(fakeAttendanceApi.postAttendanceCancelCheckIn).not.toHaveBeenCalled();
  });

  test('모달에서 `닫기`를 누르면 모달만 닫히고 등원 상태는 그대로다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT }),
    ]);
    await openPage();

    await clickCardButton('콩이', '등원 취소');
    await user.click(within(await findDialog()).getByRole('button', { name: '닫기' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    const card = await findCard('콩이');
    expect(within(card).getByText('등원완료')).toBeTruthy();
    expect(within(card).getByRole('button', { name: '등원 취소' })).toBeTruthy();
    expect(fakeAttendanceApi.postAttendanceCancelCheckIn).not.toHaveBeenCalled();
  });

  test('`취소하기`를 누르면 등원 전으로 돌아가고 등원 시각이 지워지며 결석처리·등원처리 버튼이 다시 보인다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', reservedTime: '11:00', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT }),
    ]);
    await openPage();
    expect(within(await findCard('콩이')).getByText(/등원 완료$/)).toBeTruthy();

    await cancelCheckInFromCard('콩이');

    await waitFor(async () => {
      const card = await findCard('콩이');
      expect(within(card).getByRole('button', { name: '결석처리' })).toBeTruthy();
      expect(within(card).getByRole('button', { name: '등원처리' })).toBeTruthy();
      expect(within(card).queryByText(/등원 완료$/)).toBeNull();
      expect(within(card).queryByText('등원완료')).toBeNull();
    });
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  test('등원을 취소하면 그 원생이 등원목록 탭에서 빠지고 집계의 등원 완료 수치가 줄어든다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT }),
      createFakePet({ name: '보리', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT }),
    ]);
    await openPage();
    await findCard('콩이');
    expect(getStatValue('등원 완료')).toContain('2');

    await cancelCheckInFromCard('콩이');

    await waitFor(() => expect(getStatValue('등원 완료')).toContain('1'));
    await user.click(screen.getByRole('tab', { name: '등원목록' }));
    await findCard('보리');
    expect(getCards().some((card) => card.textContent?.includes('콩이'))).toBe(false);
  });

  test('등원을 취소했을 때 현재 시각이 지각 조건이면 `지각` 칩이 다시 보인다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', reservedTime: '09:00', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT }),
    ]);
    await openPage();
    expect(within(await findCard('콩이')).queryByText('지각')).toBeNull();

    await cancelCheckInFromCard('콩이');

    await waitFor(async () => {
      expect(within(await findCard('콩이')).getByText('지각')).toBeTruthy();
    });
  });

  test('지각 토글이 켜진 상태에서 등원을 취소하면 지각 조건에 맞는 그 원생이 목록에 다시 나타난다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', reservedTime: '09:00', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT }),
      createFakePet({ name: '보리', reservedTime: '09:00', status: 'NOT_CHECKED_IN' }),
    ]);
    await openPage();
    // 토글이 켜져 있으면 등원 완료 원생은 목록에 없어서 취소 버튼을 누를 수 없다. 끈 채로 취소하고 다시 켠다.
    await user.click(await screen.findByRole('button', { name: '지각' }));
    await waitFor(() => expect(getCards()).toHaveLength(1));
    await user.click(screen.getByRole('button', { name: '지각' }));

    await cancelCheckInFromCard('콩이');
    await waitFor(async () => {
      expect(within(await findCard('콩이')).getByRole('button', { name: '등원처리' })).toBeTruthy();
    });
    await user.click(screen.getByRole('button', { name: '지각' }));

    await waitFor(() => expect(getCards()).toHaveLength(2));
    expect(within(await findCard('콩이')).getByText('지각')).toBeTruthy();
  });

  test('`취소하기` 요청 중에는 버튼을 다시 눌러도 요청이 한 번만 간다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT }),
    ]);
    await openPage();
    const release = fakeAttendanceServer.holdActions();

    await clickCardButton('콩이', '등원 취소');
    const dialog = await findDialog();
    await user.click(within(dialog).getByRole('button', { name: '취소하기' }));
    await user.click(within(dialog).getByRole('button', { name: '취소하기' }));
    release();

    await waitFor(async () => {
      expect(within(await findCard('콩이')).getByRole('button', { name: '등원처리' })).toBeTruthy();
    });
    expect(fakeAttendanceApi.postAttendanceCancelCheckIn).toHaveBeenCalledTimes(1);
  });

  test('서버가 이미 하원 처리됨을 이유로 거절하면 등원 상태를 바꾸지 않고 하원 처리 사유의 안내를 보여 준다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', status: 'CHECKED_OUT', checkInAt: CHECK_IN_AT, checkOutAt: CHECK_OUT_AT }),
      createFakePet({ name: '보리', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT, attendanceRecordSent: true }),
    ]);
    await openPage();

    await cancelCheckInFromCard('콩이');
    await waitFor(() => expect(getToastText()).not.toBe(''));
    const checkedOutReasonText = getToastText();
    toast.clear();
    await cancelCheckInFromCard('보리');
    await waitFor(() => expect(getToastText()).not.toBe(''));
    const recordSentReasonText = getToastText();

    // 하원 처리 사유와 알림장 발송 사유의 안내는 서로 다르고, 둘 다 공통 실패 안내가 아니다.
    expect(checkedOutReasonText).not.toBe(recordSentReasonText);
    expect(checkedOutReasonText).not.toContain(REQUEST_FAILED_MESSAGE);
    const card = await findCard('콩이');
    expect(within(card).getByText('등원완료')).toBeTruthy();
    expect(within(card).getByRole('button', { name: '등원 취소' })).toBeTruthy();
  });

  test('서버가 이미 알림장 발송됨을 이유로 거절하면 등원 상태를 바꾸지 않고 알림장 발송 사유의 안내를 보여 준다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '보리', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT, attendanceRecordSent: true }),
    ]);
    await openPage();

    await cancelCheckInFromCard('보리');

    await waitFor(() => expect(getToastText()).not.toBe(''));
    expect(getToastText()).not.toContain(REQUEST_FAILED_MESSAGE);
    const card = await findCard('보리');
    expect(within(card).getByText('등원완료')).toBeTruthy();
    expect(within(card).getByRole('button', { name: '등원 취소' })).toBeTruthy();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  test('그 밖의 이유로 취소가 실패하면 등원 상태를 바꾸지 않고 공통 실패 안내를 보여 준다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', status: 'CHECKED_IN', checkInAt: CHECK_IN_AT }),
    ]);
    fakeAttendanceServer.failNextAction('postAttendanceCancelCheckIn');
    await openPage();

    await cancelCheckInFromCard('콩이');

    expect(await screen.findByText(REQUEST_FAILED_MESSAGE)).toBeTruthy();
    const card = await findCard('콩이');
    expect(within(card).getByText('등원완료')).toBeTruthy();
    expect(within(card).getByRole('button', { name: '등원 취소' })).toBeTruthy();
  });
});

describe('결석 취소', () => {
  test('결석 취소 버튼을 누르면 확인 모달이 열리고 `닫기`를 누르면 결석 상태는 그대로다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [createFakePet({ name: '콩이', status: 'ABSENT' })]);
    await openPage();

    await clickCardButton('콩이', '결석 취소');
    const dialog = await findDialog();
    expect(within(dialog).getByText(/콩이/)).toBeTruthy();
    await user.click(within(dialog).getByRole('button', { name: '닫기' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    const card = await findCard('콩이');
    expect(within(card).getByText('결석')).toBeTruthy();
    expect(within(card).getByRole('button', { name: '결석 취소' })).toBeTruthy();
    expect(fakeAttendanceApi.postAttendanceCancelAbsent).not.toHaveBeenCalled();
  });

  test('`취소하기`를 누르면 등원 전으로 돌아가고 결석처리·등원처리 버튼이 다시 보인다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [createFakePet({ name: '콩이', reservedTime: '11:00', status: 'ABSENT' })]);
    await openPage();

    await confirmCancelFromCard('콩이', '결석 취소');

    await waitFor(async () => {
      const card = await findCard('콩이');
      expect(within(card).getByRole('button', { name: '결석처리' })).toBeTruthy();
      expect(within(card).getByRole('button', { name: '등원처리' })).toBeTruthy();
      expect(within(card).queryByText('결석')).toBeNull();
    });
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  test('결석을 취소하면 집계의 결석 확정 수치가 줄어든다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', status: 'ABSENT' }),
      createFakePet({ name: '보리', status: 'ABSENT' }),
    ]);
    await openPage();
    await findCard('콩이');
    expect(getStatValue('결석 확정')).toContain('2');

    await confirmCancelFromCard('콩이', '결석 취소');

    await waitFor(() => expect(getStatValue('결석 확정')).toContain('1'));
  });

  test('결석을 취소했을 때 현재 시각이 지각 조건이면 `지각` 칩이 다시 보인다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [createFakePet({ name: '콩이', reservedTime: '09:00', status: 'ABSENT' })]);
    await openPage();
    expect(within(await findCard('콩이')).queryByText('지각')).toBeNull();

    await confirmCancelFromCard('콩이', '결석 취소');

    await waitFor(async () => {
      expect(within(await findCard('콩이')).getByText('지각')).toBeTruthy();
    });
  });

  test('결석 취소가 실패하면 결석 상태를 바꾸지 않고 실패 안내를 보여 준다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [createFakePet({ name: '콩이', status: 'ABSENT' })]);
    fakeAttendanceServer.failNextAction('postAttendanceCancelAbsent');
    await openPage();

    await confirmCancelFromCard('콩이', '결석 취소');

    expect(await screen.findByText(REQUEST_FAILED_MESSAGE)).toBeTruthy();
    const card = await findCard('콩이');
    expect(within(card).getByText('결석')).toBeTruthy();
    expect(within(card).getByRole('button', { name: '결석 취소' })).toBeTruthy();
  });
});
