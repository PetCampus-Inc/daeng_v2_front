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

/** 원생 카드들. 토스트도 목록 항목이라서 열려 있는 탭 안에서만 찾는다. */
const getCards = () => {
  const tabPanel = screen.queryByRole('tabpanel');
  return tabPanel ? within(tabPanel).queryAllByRole('listitem') : [];
};

/** 이름이 들어 있는 카드(목록 항목)를 찾는다. */
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

const queryCard = (name: string) => getCards().find((item) => item.textContent?.includes(name)) ?? null;

const getStatValue = (label: string) => screen.getByRole('group', { name: label }).textContent ?? '';

/** 카드 안의 버튼을 눌러 처리를 시작한다. */
const clickCardButton = async (name: string, buttonName: string) => {
  const card = await findCard(name);
  await user.click(within(card).getByRole('button', { name: buttonName }));
};

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  // 현재 시각 10:00 → 09:00 예약은 지각, 11:00 예약은 지각이 아니다
  vi.setSystemTime(new Date('2026-06-18T10:00:00+09:00'));
  user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  fakeAttendanceServer.reset();
});
afterEach(() => {
  toast.clear();
  cleanup();
  vi.useRealTimers();
});

describe('등원 처리', () => {
  test('등원처리를 누르면 확인 없이 바로 등원 완료가 되고, 카드가 `등원완료` 칩과 등원 취소 버튼으로 바뀐다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [createFakePet({ name: '콩이', reservedTime: '11:00' })]);
    renderOwnerDaily(<OwnerDailyPage />);

    await clickCardButton('콩이', '등원처리');

    expect(screen.queryByRole('dialog')).toBeNull();
    await waitFor(async () => {
      const card = await findCard('콩이');
      expect(within(card).getByText('등원완료')).toBeTruthy();
      expect(within(card).getByRole('button', { name: '등원 취소' })).toBeTruthy();
      expect(within(card).queryByRole('button', { name: '등원처리' })).toBeNull();
    });
  });

  test('지각 원생을 등원처리하면 `지각` 칩이 `등원완료` 칩으로 바뀐다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [createFakePet({ name: '콩이', reservedTime: '09:00' })]);
    renderOwnerDaily(<OwnerDailyPage />);
    expect(within(await findCard('콩이')).getByText('지각')).toBeTruthy();

    await clickCardButton('콩이', '등원처리');

    await waitFor(async () => {
      const card = await findCard('콩이');
      expect(within(card).getByText('등원완료')).toBeTruthy();
      expect(within(card).queryByText('지각')).toBeNull();
    });
  });

  test('등원 처리가 성공하면 집계의 등원 완료 수치가 바로 늘어난다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', reservedTime: '11:00' }),
      createFakePet({ name: '보리', reservedTime: '11:30' }),
    ]);
    renderOwnerDaily(<OwnerDailyPage />);
    await findCard('콩이');
    expect(getStatValue('등원 완료')).toContain('0');

    await clickCardButton('콩이', '등원처리');

    await waitFor(() => expect(getStatValue('등원 완료')).toContain('1'));
  });

  test('등원 처리한 원생이 등원목록 탭에 나타난다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [createFakePet({ name: '콩이', reservedTime: '11:00' })]);
    renderOwnerDaily(<OwnerDailyPage />);

    await clickCardButton('콩이', '등원처리');
    await waitFor(async () => {
      expect(within(await findCard('콩이')).getByRole('button', { name: '등원 취소' })).toBeTruthy();
    });
    await user.click(screen.getByRole('tab', { name: '등원목록' }));

    expect(await findCard('콩이')).toBeTruthy();
  });

  test('등원 처리가 성공하면 카드는 목록의 처리한 원생 그룹(아래쪽)으로 옮겨진다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', reservedTime: '10:30' }),
      createFakePet({ name: '보리', reservedTime: '11:00' }),
    ]);
    renderOwnerDaily(<OwnerDailyPage />);
    await findCard('콩이');
    expect(getCards()[0]?.textContent).toContain('콩이');

    await clickCardButton('콩이', '등원처리');

    await waitFor(() => {
      const cards = getCards();
      expect(cards[0]?.textContent).toContain('보리');
      expect(cards[1]?.textContent).toContain('콩이');
    });
  });

  test('등원 처리 요청 중에는 버튼을 다시 눌러도 요청이 한 번만 간다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [createFakePet({ name: '콩이', reservedTime: '11:00' })]);
    const release = fakeAttendanceServer.holdActions();
    renderOwnerDaily(<OwnerDailyPage />);
    const card = await findCard('콩이');
    const checkInButton = within(card).getByRole('button', { name: '등원처리' }) as HTMLButtonElement;

    await user.click(checkInButton);
    await user.click(checkInButton);

    expect(checkInButton.disabled).toBe(true);
    expect(fakeAttendanceApi.postAttendanceCheckIn).toHaveBeenCalledTimes(1);

    release();
    await waitFor(async () => {
      expect(within(await findCard('콩이')).getByRole('button', { name: '등원 취소' })).toBeTruthy();
    });
    expect(fakeAttendanceApi.postAttendanceCheckIn).toHaveBeenCalledTimes(1);
  });

  test('등원 처리가 실패하면 카드 상태를 바꾸지 않고 실패 안내를 보여 준 뒤 버튼이 다시 눌린다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [createFakePet({ name: '콩이', reservedTime: '11:00' })]);
    fakeAttendanceServer.failNextAction('postAttendanceCheckIn', 'COMMON-500');
    renderOwnerDaily(<OwnerDailyPage />);

    await clickCardButton('콩이', '등원처리');

    expect(await screen.findByText(REQUEST_FAILED_MESSAGE)).toBeTruthy();
    const card = await findCard('콩이');
    const checkInButton = within(card).getByRole('button', { name: '등원처리' }) as HTMLButtonElement;
    expect(within(card).queryByText('등원완료')).toBeNull();
    expect(checkInButton.disabled).toBe(false);
  });

  test('다른 기기에서 이미 처리했거나 예약이 취소되어 서버가 거절하면 실패 안내를 보여 주고 목록을 다시 불러온다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [createFakePet({ name: '콩이', reservedTime: '11:00' })]);
    renderOwnerDaily(<OwnerDailyPage />);
    await findCard('콩이');
    const candidateCallsBefore = fakeAttendanceApi.getAttendanceCheckinoutCandidates.mock.calls.length;
    // 화면에는 아직 등원 전이지만, 그 사이 다른 기기에서 먼저 등원 처리했다.
    fakeAttendanceServer.getPets(TODAY_KEY).forEach((pet) => {
      pet.status = 'CHECKED_IN';
    });

    await clickCardButton('콩이', '등원처리');

    expect(await screen.findByText(REQUEST_FAILED_MESSAGE)).toBeTruthy();
    await waitFor(async () => {
      expect(within(await findCard('콩이')).getByRole('button', { name: '등원 취소' })).toBeTruthy();
    });
    expect(fakeAttendanceApi.getAttendanceCheckinoutCandidates.mock.calls.length).toBeGreaterThan(candidateCallsBefore);
  });
});

describe('결석 처리', () => {
  test('결석처리를 누르면 확인 없이 바로 결석이 되고, 카드가 `결석` 칩과 결석 취소 버튼으로 바뀐다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [createFakePet({ name: '콩이', reservedTime: '11:00' })]);
    renderOwnerDaily(<OwnerDailyPage />);

    await clickCardButton('콩이', '결석처리');

    expect(screen.queryByRole('dialog')).toBeNull();
    await waitFor(async () => {
      const card = await findCard('콩이');
      expect(within(card).getByText('결석')).toBeTruthy();
      expect(within(card).getByRole('button', { name: '결석 취소' })).toBeTruthy();
      expect(within(card).queryByRole('button', { name: '결석처리' })).toBeNull();
    });
  });

  test('지각 원생을 결석처리하면 `결석` 칩이 되고 지각 대상에서 빠진다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [createFakePet({ name: '콩이', reservedTime: '09:00' })]);
    renderOwnerDaily(<OwnerDailyPage />);
    expect(within(await findCard('콩이')).getByText('지각')).toBeTruthy();

    await clickCardButton('콩이', '결석처리');

    await waitFor(async () => {
      const card = await findCard('콩이');
      expect(within(card).getByText('결석')).toBeTruthy();
      expect(within(card).queryByText('지각')).toBeNull();
    });
    await user.click(screen.getByRole('button', { name: '지각' }));
    expect(getCards()).toHaveLength(0);
  });

  test('결석 처리가 성공하면 집계의 결석 확정 수치가 바로 늘어난다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', reservedTime: '11:00' }),
      createFakePet({ name: '보리', reservedTime: '11:30' }),
    ]);
    renderOwnerDaily(<OwnerDailyPage />);
    await findCard('콩이');
    expect(getStatValue('결석 확정')).toContain('0');

    await clickCardButton('콩이', '결석처리');

    await waitFor(() => expect(getStatValue('결석 확정')).toContain('1'));
  });

  test('결석 처리한 원생은 오늘 등원목록 탭에 나타나지 않는다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', reservedTime: '11:00' }),
      createFakePet({ name: '보리', reservedTime: '11:30', status: 'CHECKED_IN' }),
    ]);
    renderOwnerDaily(<OwnerDailyPage />);

    await clickCardButton('콩이', '결석처리');
    await waitFor(async () => {
      expect(within(await findCard('콩이')).getByRole('button', { name: '결석 취소' })).toBeTruthy();
    });
    await user.click(screen.getByRole('tab', { name: '등원목록' }));

    expect(await findCard('보리')).toBeTruthy();
    expect(queryCard('콩이')).toBeNull();
  });

  test('결석 처리 요청 중에는 버튼을 다시 눌러도 요청이 한 번만 간다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [createFakePet({ name: '콩이', reservedTime: '11:00' })]);
    const release = fakeAttendanceServer.holdActions();
    renderOwnerDaily(<OwnerDailyPage />);
    const card = await findCard('콩이');
    const absentButton = within(card).getByRole('button', { name: '결석처리' }) as HTMLButtonElement;

    await user.click(absentButton);
    await user.click(absentButton);

    expect(absentButton.disabled).toBe(true);
    expect(fakeAttendanceApi.postAttendanceAbsent).toHaveBeenCalledTimes(1);

    release();
    await waitFor(async () => {
      expect(within(await findCard('콩이')).getByRole('button', { name: '결석 취소' })).toBeTruthy();
    });
    expect(fakeAttendanceApi.postAttendanceAbsent).toHaveBeenCalledTimes(1);
  });

  test('결석 처리가 실패하면 카드 상태를 바꾸지 않고 실패 안내를 보여 준 뒤 버튼이 다시 눌린다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [createFakePet({ name: '콩이', reservedTime: '11:00' })]);
    fakeAttendanceServer.failNextAction('postAttendanceAbsent', 'COMMON-500');
    renderOwnerDaily(<OwnerDailyPage />);

    await clickCardButton('콩이', '결석처리');

    expect(await screen.findByText(REQUEST_FAILED_MESSAGE)).toBeTruthy();
    const card = await findCard('콩이');
    const absentButton = within(card).getByRole('button', { name: '결석처리' }) as HTMLButtonElement;
    expect(within(card).queryByText('결석')).toBeNull();
    expect(absentButton.disabled).toBe(false);
  });
});

describe('지각 토글(처리 시)', () => {
  test('토글을 켠 상태에서 원생을 등원 처리하면 그 카드가 목록에서 빠진다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', reservedTime: '09:00' }),
      createFakePet({ name: '보리', reservedTime: '09:10' }),
    ]);
    renderOwnerDaily(<OwnerDailyPage />);
    await findCard('콩이');
    await user.click(screen.getByRole('button', { name: '지각' }));
    expect(getCards()).toHaveLength(2);

    await clickCardButton('콩이', '등원처리');

    await waitFor(() => expect(queryCard('콩이')).toBeNull());
    expect(queryCard('보리')).not.toBeNull();
  });

  test('토글을 켠 상태에서 원생을 결석 처리하면 그 카드가 목록에서 빠진다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', reservedTime: '09:00' }),
      createFakePet({ name: '보리', reservedTime: '09:10' }),
    ]);
    renderOwnerDaily(<OwnerDailyPage />);
    await findCard('콩이');
    await user.click(screen.getByRole('button', { name: '지각' }));

    await clickCardButton('콩이', '결석처리');

    await waitFor(() => expect(queryCard('콩이')).toBeNull());
    expect(queryCard('보리')).not.toBeNull();
  });
});

describe('등원처리 탭 카드 표시(처리 후)', () => {
  test('등원·결석 처리를 한 뒤에도 요청사항이 계속 보인다', async () => {
    fakeAttendanceServer.seedDay(TODAY_KEY, [
      createFakePet({ name: '콩이', reservedTime: '11:00', requestMemo: '알레르기가 있어요' }),
      createFakePet({ name: '보리', reservedTime: '11:30', requestMemo: '산책을 좋아해요' }),
    ]);
    renderOwnerDaily(<OwnerDailyPage />);

    await clickCardButton('콩이', '등원처리');
    await waitFor(async () => {
      expect(within(await findCard('콩이')).getByRole('button', { name: '등원 취소' })).toBeTruthy();
    });
    await clickCardButton('보리', '결석처리');
    await waitFor(async () => {
      expect(within(await findCard('보리')).getByRole('button', { name: '결석 취소' })).toBeTruthy();
    });

    expect(within(await findCard('콩이')).getByRole('group', { name: '요청사항' })).toBeTruthy();
    expect(within(await findCard('보리')).getByRole('group', { name: '요청사항' })).toBeTruthy();
  });
});
