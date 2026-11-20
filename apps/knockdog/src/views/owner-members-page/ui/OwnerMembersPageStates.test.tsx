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
  useStackNavigation: () => ({ push: vi.fn(), back: vi.fn() }),
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
  useHasUnreadNotificationQuery: () => ({ data: false }),
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

describe('목록 화면 상태', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getOwnerMembers.mockResolvedValue(membersResponse);
    mocks.getOwnerPendingMembers.mockResolvedValue(pendingResponse);
  });
  afterEach(cleanup);

  it('목록을 불러오는 동안 상단·하단 내비게이션은 그대로이고 콘텐츠 영역에 로딩 표시가 보인다', async () => {
    mocks.getOwnerMembers.mockImplementation(neverResolves);

    renderPage('');

    expect(await screen.findByRole('status', { name: '로딩 중' })).toBeTruthy();
    expect(screen.getByText('구성원')).toBeTruthy();
  });

  it('목록 조회가 실패하면 콘텐츠 영역에 `정보를 불러오지 못했어요` / `잠시 후 다시 시도해 주세요.`와 `다시 시도하기` 버튼이 보인다', async () => {
    mocks.getOwnerMembers.mockRejectedValue(new Error('network'));
    mocks.getOwnerPendingMembers.mockRejectedValue(new Error('network'));

    for (const search of ['', 'tab=pending']) {
      const { unmount } = renderPage(search);

      expect(await screen.findByRole('button', { name: '다시 시도하기' })).toBeTruthy();
      expect(screen.getByRole('heading', { name: '정보를 불러오지 못했어요' })).toBeTruthy();
      unmount();
    }
  });

  it('`다시 시도하기`를 누르면 목록을 다시 불러오고, 불러오는 동안에는 버튼을 다시 누를 수 없다', async () => {
    mocks.getOwnerMembers.mockRejectedValueOnce(new Error('network'));
    mocks.getOwnerMembers.mockImplementation(neverResolves);

    renderPage('');
    const retryButton = await screen.findByRole('button', { name: '다시 시도하기' });
    const callCountBeforeRetry = mocks.getOwnerMembers.mock.calls.length;

    fireEvent.click(retryButton);

    await waitFor(() => expect(mocks.getOwnerMembers.mock.calls.length).toBeGreaterThan(callCountBeforeRetry));
    expect((screen.getByRole('button', { name: '다시 시도하기' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('승인·거절 요청 중에는 그 신청의 `승인`·`거절` 버튼을 누를 수 없다', async () => {
    mocks.postApproveOwnerMember.mockImplementation(neverResolves);

    renderPage('tab=pending');
    fireEvent.click(await screen.findByRole('button', { name: '승인' }));

    await waitFor(() => {
      expect((screen.getByRole('button', { name: '승인' }) as HTMLButtonElement).disabled).toBe(true);
      expect((screen.getByRole('button', { name: '거절' }) as HTMLButtonElement).disabled).toBe(true);
    });
  });

  it('이미 취소·처리된 신청을 승인하거나 거절하면 모달 없이 토스트 `취소된 연결 신청이에요`가 보이고 신청 목록을 새로 불러온다', async () => {
    mocks.postApproveOwnerMember.mockRejectedValue(
      new ApiError(409, 'OWNER_MEMBER-409-2' as never, 'already cancelled')
    );

    renderPage('tab=pending');
    await screen.findByRole('button', { name: '승인' });
    const callCountBeforeApprove = mocks.getOwnerPendingMembers.mock.calls.length;

    fireEvent.click(screen.getByRole('button', { name: '승인' }));

    await waitFor(() =>
      expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ title: '취소된 연결 신청이에요' }))
    );
    await waitFor(() => expect(mocks.getOwnerPendingMembers.mock.calls.length).toBeGreaterThan(callCountBeforeApprove));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
