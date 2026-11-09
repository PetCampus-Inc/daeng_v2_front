// @vitest-environment jsdom
import { type ReactNode } from 'react';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OverlayProvider } from 'overlay-kit';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { GuardianKindergartenHistoryPage } from './GuardianKindergartenHistoryPage';

interface TestPet {
  id: string;
  name: string;
  breed: string;
  birthYear: number;
  weight: number;
  isRepresentative: boolean;
}

interface TestConnection {
  schoolPetMembershipId: string;
  name: string;
  disconnectedAt: Date | null;
}

const push = vi.fn();
const getDisconnectEligibility = vi.fn();
const deleteConnection = vi.fn();
const petState = { pets: [] as TestPet[] };
const refetchConnections = vi.fn();
const connectionState = { byPetId: {} as Record<string, TestConnection[]>, isError: false };

vi.mock('@shared/lib/bridge', () => ({
  useStackNavigation: () => ({ push, back: vi.fn() }),
}));

// vaul이 테스트 환경에서 다른 React를 불러와 그려지지 않아, 열림 여부와 제목만 따르는 단순 dialog로 바꾼다
vi.mock('@shared/ui/bottom-sheet', () => ({
  BottomSheet: {
    Root: ({ open, children }: { open?: boolean; children: ReactNode }) =>
      open ? (
        <div role='dialog' aria-labelledby='bottom-sheet-title'>
          {children}
        </div>
      ) : null,
    Overlay: () => null,
    Body: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Title: ({ children }: { children: ReactNode }) => <h2 id='bottom-sheet-title'>{children}</h2>,
  },
}));

vi.mock('@widgets/Header', () => {
  const Header = ({ children }: { children: ReactNode }) => <header>{children}</header>;
  Header.BackButton = () => <button type='button'>뒤로</button>;
  Header.Title = ({ children }: { children: ReactNode }) => <h1>{children}</h1>;
  return { Header };
});

vi.mock('@shared/ui/toast', () => ({ toast: vi.fn() }));
vi.mock('@shared/lib/analytics', () => ({ trackConnectionStatus: vi.fn() }));

vi.mock('@entities/pet', () => ({
  usePetListQuery: () => ({
    data: { data: petState.pets },
    isFetched: true,
    isSuccess: true,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
  usePetRepresentativeQuery: () => ({
    data: petState.pets.find((pet) => pet.isRepresentative),
  }),
  calculateAge: () => 3,
  formatAge: () => '3살',
}));

vi.mock('@entities/guardian-home', async () => ({
  ...(await import('@entities/guardian-home/model/guardianDisconnectEligibility')),
  getDisconnectEligibility: (params: unknown) => getDisconnectEligibility(params),
  useGuardianSchoolConnectionsQuery: ({ petId }: { petId?: string | null }) => ({
    data: (connectionState.byPetId[petId ?? ''] ?? []).map((connection) => ({
      id: connection.schoolPetMembershipId,
      schoolPetMembershipId: connection.schoolPetMembershipId,
      schoolId: connection.schoolPetMembershipId,
      placeId: '10',
      name: connection.name,
      address: '서울시',
      imageUrl: '',
      status: connection.disconnectedAt ? 'disconnected' : 'approved',
      connectedAt: new Date('2026-01-01'),
      disconnectedAt: connection.disconnectedAt,
      attendedDays: 3,
      canWriteReview: false,
    })),
    isPending: false,
    isError: connectionState.isError,
    isFetching: false,
    refetch: refetchConnections,
  }),
  useGuardianSchoolDisconnectMutation: () => ({ mutateAsync: deleteConnection, isPending: false }),
}));

const createConnection = (overrides: Partial<TestConnection>): TestConnection => ({
  schoolPetMembershipId: '11',
  name: '모모네 유치원',
  disconnectedAt: null,
  ...overrides,
});

const createPet = (overrides: Partial<TestPet>): TestPet => ({
  id: '1',
  name: '초코',
  breed: '푸들',
  birthYear: 2023,
  weight: 4,
  isRepresentative: false,
  ...overrides,
});

const renderPage = () =>
  render(
    <OverlayProvider>
      <GuardianKindergartenHistoryPage />
    </OverlayProvider>
  );

beforeEach(async () => {
  const { useUserStore } = await import('@entities/user');
  const { useGuardianSelectedPetStore } = await import(
    '@views/guardian-kindergarten-page/model/useGuardianSelectedPetStore'
  );
  useUserStore.setState({ user: { userId: '1', nickname: '보호자' } } as never);
  useGuardianSelectedPetStore.setState({ selectedPetId: null });
});

afterEach(() => {
  cleanup();
  push.mockReset();
  petState.pets = [];
  connectionState.byPetId = {};
  connectionState.isError = false;
  refetchConnections.mockReset();
  getDisconnectEligibility.mockReset();
  deleteConnection.mockReset();
});

describe('연결 이력 화면의 강아지 선택', () => {
  const twoPets = () => [
    createPet({ id: '1', name: '초코', isRepresentative: true }),
    createPet({ id: '2', name: '두부' }),
  ];

  test('화면에 들어오면 대표 강아지가 선택돼 있다', async () => {
    petState.pets = twoPets();

    renderPage();

    expect(await screen.findByRole('button', { name: /초코/ })).toBeTruthy();
  });

  test('강아지가 1마리면 선택 목록을 열 수 없다', async () => {
    petState.pets = [createPet({ id: '1', name: '초코', isRepresentative: true })];

    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: /초코/ }));

    expect(screen.queryByRole('region', { name: '강아지 선택 목록' })).toBeNull();
  });

  test('강아지가 여러 마리면 선택 영역을 눌러 등록한 강아지 목록을 열 수 있다', async () => {
    petState.pets = twoPets();

    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: /초코/ }));

    const list = await screen.findByRole('region', { name: '강아지 선택 목록' });
    expect(within(list).getByRole('button', { name: /초코/ })).toBeTruthy();
    expect(within(list).getByRole('button', { name: /두부/ })).toBeTruthy();
  });

  test('목록에서 강아지를 고르면 목록이 닫히고 그 강아지의 연결 이력을 보여 준다', async () => {
    petState.pets = twoPets();
    connectionState.byPetId = {
      '1': [{ schoolPetMembershipId: '11', name: '초코네 유치원', disconnectedAt: null }],
      '2': [{ schoolPetMembershipId: '22', name: '두부네 유치원', disconnectedAt: null }],
    };

    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: /초코/ }));
    const list = await screen.findByRole('region', { name: '강아지 선택 목록' });
    await userEvent.click(within(list).getByRole('button', { name: /두부/ }));

    expect(screen.queryByRole('region', { name: '강아지 선택 목록' })).toBeNull();
    expect(await screen.findByText('두부네 유치원')).toBeTruthy();
    expect(screen.queryByText('초코네 유치원')).toBeNull();
  });

  test('목록 바깥을 누르면 목록이 닫히고 선택한 강아지는 바뀌지 않는다', async () => {
    petState.pets = twoPets();
    connectionState.byPetId = {
      '1': [{ schoolPetMembershipId: '11', name: '초코네 유치원', disconnectedAt: null }],
    };

    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: /초코/ }));
    await userEvent.click(await screen.findByRole('button', { name: '강아지 선택 닫기' }));

    expect(screen.queryByRole('region', { name: '강아지 선택 목록' })).toBeNull();
    expect(await screen.findByText('초코네 유치원')).toBeTruthy();
  });

  test('등록한 강아지가 없으면 강아지 선택 영역 없이 연결 이력이 없는 화면을 보여 준다', async () => {
    petState.pets = [];

    renderPage();

    expect(await screen.findByText(/아직 연결된 유치원이 없어요/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /초코/ })).toBeNull();
  });
});

describe('연결 이력 목록', () => {
  const setUpPet = () => {
    petState.pets = [createPet({ id: '1', name: '초코', isRepresentative: true })];
  };

  test('연결 중인 유치원이 있으면 지금 다니는 유치원 카드에 `연결 해제` 버튼이 있다', async () => {
    setUpPet();
    connectionState.byPetId = { '1': [createConnection({})] };

    renderPage();

    const current = await screen.findByRole('region', { name: '지금 다니는 유치원' });
    expect(within(current).getByRole('button', { name: '연결 해제' })).toBeTruthy();
  });

  test('연결 해제된 유치원 카드에는 `연결 해제` 버튼이 없다', async () => {
    setUpPet();
    connectionState.byPetId = {
      '1': [createConnection({ name: '누리 유치원', disconnectedAt: new Date('2026-05-01') })],
    };

    renderPage();

    const previous = await screen.findByRole('region', { name: '이전에 다녔던 유치원' });
    expect(within(previous).getByText('누리 유치원')).toBeTruthy();
    expect(within(previous).queryByRole('button', { name: '연결 해제' })).toBeNull();
  });

  test('지금 다니는 유치원이 없으면 빈 카드를 보여 준다', async () => {
    setUpPet();
    connectionState.byPetId = {
      '1': [createConnection({ disconnectedAt: new Date('2026-05-01') })],
    };

    renderPage();

    const current = await screen.findByRole('region', { name: '지금 다니는 유치원' });
    expect(within(current).queryByRole('button', { name: '연결 해제' })).toBeNull();
    expect(within(current).getByText(/연결된 유치원이 없어요/)).toBeTruthy();
  });

  test('이전에 다닌 유치원이 0곳이어도 섹션 제목과 개수 0이 보이고 카드는 없다', async () => {
    setUpPet();
    connectionState.byPetId = { '1': [createConnection({})] };

    renderPage();

    const previous = await screen.findByRole('region', { name: '이전에 다녔던 유치원' });
    expect(within(previous).getByText('0')).toBeTruthy();
    expect(within(previous).queryAllByRole('listitem')).toHaveLength(0);
  });

  test('이전에 다닌 유치원 개수가 목록의 카드 수와 같다', async () => {
    setUpPet();
    connectionState.byPetId = {
      '1': [
        createConnection({ schoolPetMembershipId: '1', name: '가 유치원', disconnectedAt: new Date('2026-03-01') }),
        createConnection({ schoolPetMembershipId: '2', name: '나 유치원', disconnectedAt: new Date('2026-04-01') }),
        createConnection({ schoolPetMembershipId: '3', name: '다 유치원', disconnectedAt: new Date('2026-05-01') }),
      ],
    };

    renderPage();

    const previous = await screen.findByRole('region', { name: '이전에 다녔던 유치원' });
    expect(within(previous).getByText('3')).toBeTruthy();
    expect(within(previous).getAllByRole('listitem')).toHaveLength(3);
  });

  test('연결 이력이 하나도 없으면 연결 이력이 없는 화면을 보여 준다', async () => {
    setUpPet();
    connectionState.byPetId = { '1': [] };

    renderPage();

    expect(await screen.findByText(/아직 연결된 유치원이 없어요/)).toBeTruthy();
    expect(screen.queryByRole('region', { name: '이전에 다녔던 유치원' })).toBeNull();
  });

  test('이력 조회에 실패하면 화면 안에 오류를 보여 주고 다시 시도할 수 있다', async () => {
    setUpPet();
    connectionState.isError = true;

    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: /다시 시도/ }));

    expect(refetchConnections).toHaveBeenCalledTimes(1);
  });
});

describe('연결 해제 확인 모달', () => {
  beforeEach(() => {
    petState.pets = [createPet({ id: '1', name: '초코', isRepresentative: true })];
    connectionState.byPetId = { '1': [createConnection({})] };
  });

  const openDisconnectDialog = async () => {
    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: '연결 해제' }));
    return screen.findByRole('alertdialog');
  };

  test('`연결 해제`를 누르면 확인 모달이 열린다', async () => {
    const dialog = await openDisconnectDialog();

    expect(within(dialog).getByRole('button', { name: '연결 해제하기' })).toBeTruthy();
  });

  test('모달에 해당 유치원 이름과 강아지 이름이 들어간다', async () => {
    const dialog = await openDisconnectDialog();

    expect(within(dialog).getByText(/모모네 유치원/)).toBeTruthy();
    expect(within(dialog).getByText(/초코/)).toBeTruthy();
  });

  test('`닫기`를 누르면 모달이 닫히고 연결 이력은 그대로다', async () => {
    const dialog = await openDisconnectDialog();

    await userEvent.click(within(dialog).getByRole('button', { name: '닫기' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    const current = screen.getByRole('region', { name: '지금 다니는 유치원' });
    expect(within(current).getByText('모모네 유치원')).toBeTruthy();
    expect(within(current).getByRole('button', { name: '연결 해제' })).toBeTruthy();
  });

  test('모달 바깥을 눌러도 모달이 닫히지 않는다', async () => {
    await openDisconnectDialog();

    // 모달이 열려 있는 동안 바깥은 `pointer-events: none`이라 검사를 끄고 실제 바깥 누르기를 재현한다
    await userEvent.setup({ pointerEventsCheck: 0 }).click(document.body);

    expect(screen.getByRole('alertdialog')).toBeTruthy();
  });
});

describe('해제 불가 바텀시트', () => {
  beforeEach(() => {
    petState.pets = [createPet({ id: '1', name: '초코', isRepresentative: true })];
    connectionState.byPetId = { '1': [createConnection({})] };
  });

  const openBlockedSheet = async (blocks: unknown[]) => {
    getDisconnectEligibility.mockResolvedValue({ canDisconnect: false, blocks });
    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: '연결 해제' }));
    const dialog = await screen.findByRole('alertdialog');
    await userEvent.click(within(dialog).getByRole('button', { name: '연결 해제하기' }));
    return screen.findByRole('dialog', { name: /아직 연결을 해제할 수 없어요/ });
  };

  const TICKET_BLOCKS = [
    { type: 'TICKET', ticket: { name: '10회권', remainingCount: 6, expiresOn: '2026-01-12' } },
    { type: 'TICKET', ticket: { name: '체험권', remainingCount: 1, expiresOn: null } },
  ];
  const RESERVATION_BLOCKS = [
    { type: 'RESERVATION', reservation: { date: '2026-10-12', time: '15:00', status: '예약 확정' } },
  ];

  describe('이용권이 남은 경우', () => {
    test('남은 이용권이 여러 장이면 모두 이름·만료일·잔여 횟수와 함께 보여 준다', async () => {
      const sheet = await openBlockedSheet(TICKET_BLOCKS);

      expect(within(sheet).getByText('10회권')).toBeTruthy();
      expect(within(sheet).getByText('2026.01.12까지')).toBeTruthy();
      expect(within(sheet).getByText('6회 남음')).toBeTruthy();
      expect(within(sheet).getByText('체험권')).toBeTruthy();
      expect(within(sheet).getByText('만료 없음')).toBeTruthy();
      expect(within(sheet).getByText('1회 남음')).toBeTruthy();
    });

    test('`유치원에 문의`를 누르면 해당 유치원 상세 페이지로 이동한다', async () => {
      const sheet = await openBlockedSheet(TICKET_BLOCKS);

      await userEvent.click(within(sheet).getByRole('button', { name: '유치원에 문의' }));

      expect(push).toHaveBeenCalledWith({ pathname: '/kindergarten/10' });
    });

    test('`확인`을 누르면 시트가 닫힌다', async () => {
      const sheet = await openBlockedSheet(TICKET_BLOCKS);

      await userEvent.click(within(sheet).getByRole('button', { name: '확인' }));

      await waitFor(() => expect(screen.queryByRole('dialog', { name: /아직 연결을 해제할 수 없어요/ })).toBeNull());
    });

    test('시트 바깥을 누르거나 아래로 밀어도 시트가 닫히지 않는다', async () => {
      await openBlockedSheet(TICKET_BLOCKS);

      await userEvent.setup({ pointerEventsCheck: 0 }).click(document.documentElement);

      expect(screen.getByRole('dialog', { name: /아직 연결을 해제할 수 없어요/ })).toBeTruthy();
    });
  });

  describe('예약이 남은 경우', () => {
    test('예약 안내에 유치원 이름, 등원 예정 날짜·시간, 등원 전 상태가 보인다', async () => {
      const sheet = await openBlockedSheet(RESERVATION_BLOCKS);

      expect(within(sheet).getByText('모모네 유치원 예약')).toBeTruthy();
      expect(within(sheet).getByText('2026.10.12 오후 3:00 등원 예정')).toBeTruthy();
      expect(within(sheet).getByText('등원 전')).toBeTruthy();
    });

    test('`유치원에 문의`를 누르면 해당 유치원 상세 페이지로 이동한다', async () => {
      const sheet = await openBlockedSheet(RESERVATION_BLOCKS);

      await userEvent.click(within(sheet).getByRole('button', { name: '유치원에 문의' }));

      expect(push).toHaveBeenCalledWith({ pathname: '/kindergarten/10' });
    });

    test('`확인`을 누르면 시트가 닫힌다', async () => {
      const sheet = await openBlockedSheet(RESERVATION_BLOCKS);

      await userEvent.click(within(sheet).getByRole('button', { name: '확인' }));

      await waitFor(() => expect(screen.queryByRole('dialog', { name: /아직 연결을 해제할 수 없어요/ })).toBeNull());
    });
  });
});
