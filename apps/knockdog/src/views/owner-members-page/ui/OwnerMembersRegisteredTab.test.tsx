// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OwnerMembersPage } from '@views/owner-members-page/ui/OwnerMembersPage';

import { HeaderProvider } from '@widgets/Header';

const mocks = vi.hoisted(() => ({
  searchParams: { value: new URLSearchParams() },
  toast: vi.fn(),
  push: vi.fn(),
  hasUnreadNotification: { value: false },
  getOwnerMembers: vi.fn(),
  getOwnerPendingMembers: vi.fn(),
  postApproveOwnerMember: vi.fn(),
  postRejectOwnerMember: vi.fn(),
  postDisconnectOwnerMember: vi.fn(),
  postOwnerInvite: vi.fn(),
}));

const pendingResponse = {
  data: {
    pendingCount: 1,
    requests: [{ requestId: 'p1', petId: 2, dogName: '가나디', guardianName: '김지원', profileImageUrl: null }],
  },
};
const createMember = (overrides: Record<string, unknown> = {}) => ({
  memberId: 'm1',
  petId: 1,
  dogName: '보리',
  guardianName: '김상수',
  profileImageUrl: null,
  lastAttendanceAt: null,
  gender: 'MALE',
  breed: '푸들',
  guardianPhoneNumber: '010-0000-0000',
  ticketState: 'VALID',
  expiringReason: null,
  ticket: null,
  ...overrides,
});
const createMembersResponse = ({
  members = [createMember()],
  pendingCount = 5,
}: { members?: ReturnType<typeof createMember>[]; pendingCount?: number } = {}) => ({
  data: {
    totalStudentCount: 22,
    pendingCount,
    counts: { all: 22, expiring: 2, expired: 3 },
    members,
  },
});
const membersResponse = createMembersResponse();

vi.mock('next/navigation', () => ({
  useSearchParams: () => mocks.searchParams.value,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/owner/members',
}));
vi.mock('@shared/lib/bridge/BridgeProvider', () => ({
  useBridge: () => ({ request: vi.fn(), on: vi.fn(() => vi.fn()) }),
  getBridgeInstance: () => null,
  BridgeProvider: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('@shared/lib/bridge', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@shared/lib/bridge')>()),
  useStackNavigation: () => ({ push: mocks.push, back: vi.fn() }),
  useTabNavigation: () => ({ navigateToTab: vi.fn() }),
}));
vi.mock('@features/role-conversion', () => ({
  useOwnerRole: () => ({ isOwner: true, isResolved: true }),
}));
vi.mock('@entities/user', () => ({
  useUserStore: (selector: (state: { user: { userId: string } }) => unknown) =>
    selector({ user: { userId: 'owner-1' } }),
}));
vi.mock('@entities/notification', () => ({
  useHasUnreadNotificationQuery: () => ({ data: mocks.hasUnreadNotification.value }),
  NOTIFICATIONS_QUERY_KEY: 'notifications',
}));
vi.mock('@shared/ui/toast', () => ({ toast: mocks.toast }));
vi.mock('lottie-react', () => ({ default: () => null }));
vi.mock('@entities/owner-member/api/ownerMember', () => ({
  getOwnerMembers: mocks.getOwnerMembers,
  getOwnerPendingMembers: mocks.getOwnerPendingMembers,
  postApproveOwnerMember: mocks.postApproveOwnerMember,
  postRejectOwnerMember: mocks.postRejectOwnerMember,
  postDisconnectOwnerMember: mocks.postDisconnectOwnerMember,
  postOwnerInvite: mocks.postOwnerInvite,
}));

const renderPage = (search: string) => {
  mocks.searchParams.value = new URLSearchParams(search);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <HeaderProvider>
        <OwnerMembersPage />
      </HeaderProvider>
    </QueryClientProvider>
  );
};

describe('등록 원생 상세 이동', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getOwnerMembers.mockResolvedValue(membersResponse);
    mocks.getOwnerPendingMembers.mockResolvedValue(pendingResponse);
  });
  afterEach(cleanup);

  it('등록 원생을 누르면 그 원생의 상세 프로필 화면으로 이동한다', async () => {
    renderPage('');

    fireEvent.click(await screen.findByText('보리'));

    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith({ pathname: '/owner/members/1' }));
  });
});

describe('상단 내비게이션', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasUnreadNotification.value = false;
    mocks.getOwnerMembers.mockResolvedValue(membersResponse);
    mocks.getOwnerPendingMembers.mockResolvedValue(pendingResponse);
  });
  afterEach(cleanup);

  it('알림 아이콘을 누르면 알림 화면으로 이동한다', async () => {
    renderPage('');

    fireEvent.click(await screen.findByRole('button', { name: /알림함/ }));

    expect(mocks.push).toHaveBeenCalledWith({ pathname: '/notification' });
  });

  it('읽지 않은 알림이 있으면 알림 아이콘에 표시가 보인다', async () => {
    mocks.hasUnreadNotification.value = true;

    renderPage('');

    expect(await screen.findByRole('button', { name: /읽지 않은 알림/ })).toBeTruthy();
  });
});

describe('탭', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getOwnerMembers.mockResolvedValue(membersResponse);
    mocks.getOwnerPendingMembers.mockResolvedValue(pendingResponse);
  });
  afterEach(cleanup);

  it('구성원 화면에 들어오면 `등록 원생` 탭과 `전체` 칩이 선택돼 있다', async () => {
    renderPage('');

    expect(await screen.findByRole('tab', { name: '등록 원생', selected: true })).toBeTruthy();
    expect(await screen.findByRole('button', { name: /전체/, pressed: true })).toBeTruthy();
  });

  it('신청이 1건 이상이면 `신청` 탭에 신청 건수 배지가 보인다', async () => {
    renderPage('');

    expect(await screen.findByRole('tab', { name: '신청 5' })).toBeTruthy();
  });

  it('신청이 0건이면 `신청` 탭 배지가 보이지 않는다', async () => {
    mocks.getOwnerMembers.mockResolvedValue(createMembersResponse({ pendingCount: 0 }));

    renderPage('');
    await screen.findByText('보리');

    expect(screen.getByRole('tab', { name: '신청' })).toBeTruthy();
  });
});

describe('필터 칩', () => {
  const expiringMember = createMember({
    memberId: 'm2',
    petId: 3,
    dogName: '가나디',
    ticketState: 'EXPIRING',
    expiringReason: 'DAYS_LEFT',
    ticket: {
      ticketId: 1,
      name: '20회권',
      status: 'IN_USE',
      remainingCount: 3,
      chargeCount: 20,
      expiresOn: '2026-11-12',
      daysLeft: 3,
    },
  });
  const expiredMember = createMember({ memberId: 'm3', petId: 4, dogName: '두리안', ticketState: 'EXPIRED' });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getOwnerPendingMembers.mockResolvedValue(pendingResponse);
    mocks.getOwnerMembers.mockImplementation(async (params?: { filter?: string }) => {
      if (params?.filter === 'EXPIRING') return createMembersResponse({ members: [expiringMember] });
      if (params?.filter === 'EXPIRED') return createMembersResponse({ members: [expiredMember] });
      return membersResponse;
    });
  });
  afterEach(cleanup);

  it('`전체`·`만료예정`·`만료` 칩에 각각의 원생 수가 함께 보인다', async () => {
    renderPage('');

    expect(await screen.findByRole('button', { name: '전체 22' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '만료예정 2' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '만료 3' })).toBeTruthy();
  });

  it('`만료예정` 칩을 누르면 그 칩만 선택되고 만료예정 원생 목록으로 바뀐다', async () => {
    renderPage('');

    fireEvent.click(await screen.findByRole('button', { name: '만료예정 2' }));

    expect(await screen.findByText('가나디')).toBeTruthy();
    expect(screen.queryByText('보리')).toBeNull();
    expect(screen.getByRole('button', { name: '만료예정 2', pressed: true })).toBeTruthy();
    expect(screen.getByRole('button', { name: '전체 22', pressed: false })).toBeTruthy();
    expect(screen.getByRole('button', { name: '만료 3', pressed: false })).toBeTruthy();
  });

  it('`만료` 칩을 누르면 그 칩만 선택되고 만료된 원생 목록으로 바뀐다', async () => {
    renderPage('');

    fireEvent.click(await screen.findByRole('button', { name: '만료 3' }));

    expect(await screen.findByText('두리안')).toBeTruthy();
    expect(screen.queryByText('보리')).toBeNull();
    expect(screen.getByRole('button', { name: '만료 3', pressed: true })).toBeTruthy();
    expect(screen.getByRole('button', { name: '전체 22', pressed: false })).toBeTruthy();
    expect(screen.getByRole('button', { name: '만료예정 2', pressed: false })).toBeTruthy();
  });

  it('검색하거나 칩을 바꿔도 칩의 원생 수는 유치원 전체 기준 그대로다', async () => {
    renderPage('');

    fireEvent.click(await screen.findByRole('button', { name: '만료예정 2' }));
    await screen.findByText('가나디');

    expect(screen.getByRole('button', { name: '전체 22' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '만료예정 2' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '만료 3' })).toBeTruthy();
  });
});
