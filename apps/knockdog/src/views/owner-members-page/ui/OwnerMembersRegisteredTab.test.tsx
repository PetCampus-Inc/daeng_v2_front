// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OwnerMembersPage } from '@views/owner-members-page/ui/OwnerMembersPage';

import { HeaderProvider } from '@widgets/Header';
import { ApiError } from '@shared/api';

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
const membersResponse = {
  data: {
    totalStudentCount: 1,
    members: [{ memberId: 'm1', petId: 1, dogName: '보리', guardianName: '김상수', profileImageUrl: null }],
  },
};
const neverResolves = () => new Promise<never>(() => {});

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

    await waitFor(() =>
      expect(mocks.push).toHaveBeenCalledWith({ pathname: '/owner/members/1' })
    );
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
