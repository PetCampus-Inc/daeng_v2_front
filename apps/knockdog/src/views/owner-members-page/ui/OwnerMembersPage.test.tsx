// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { OwnerMembersPage } from '@views/owner-members-page/ui/OwnerMembersPage';

import { HeaderProvider } from '@widgets/Header';

const searchParams = vi.hoisted(() => ({ value: new URLSearchParams() }));

const registeredMember = {
  id: 'm1',
  petId: '1',
  dogName: '보리',
  guardianName: '김상수',
  profileImageUrl: null,
  lastAttendanceAt: null,
};
const pendingMember = {
  id: 'p1',
  petId: '2',
  dogName: '가나디',
  guardianName: '김지원',
  profileImageUrl: null,
  lastAttendanceAt: null,
};

vi.mock('next/navigation', () => ({
  useSearchParams: () => searchParams.value,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/owner/members',
}));
vi.mock('@shared/lib/bridge', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@shared/lib/bridge')>()),
  useStackNavigation: () => ({ push: vi.fn(), back: vi.fn() }),
  useTabNavigation: () => ({ navigateToTab: vi.fn() }),
}));
vi.mock('@shared/lib/bridge/BridgeProvider', () => ({
  useBridge: () => ({ request: vi.fn(), on: vi.fn(() => vi.fn()) }),
  getBridgeInstance: () => null,
  BridgeProvider: ({ children }: { children: React.ReactNode }) => children,
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
}));
vi.mock('@entities/owner-member', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@entities/owner-member')>()),
  useOwnerMembersQuery: () => ({
    data: { members: [registeredMember], totalMemberCount: 1 },
    isLoading: false,
    isFetchedAfterMount: true,
    isError: false,
  }),
  useOwnerPendingMembersQuery: () => ({
    data: { members: [pendingMember], totalMemberCount: 1 },
    isLoading: false,
    isFetchedAfterMount: true,
    isError: false,
  }),
  useOwnerMemberApprovalMutation: () => ({
    approveMutation: { mutate: vi.fn(), isPending: false },
    rejectMutation: { mutate: vi.fn(), isPending: false },
  }),
  useOwnerMemberDisconnectMutation: () => ({ mutateAsync: vi.fn() }),
}));

describe('승인 대기 진입점을 신청 탭으로 변경', () => {
  it('신청 탭 주소로 구성원 화면을 열면 `신청` 탭이 선택된 채 신청 목록이 보인다', () => {
    searchParams.value = new URLSearchParams('tab=pending');

    render(
      <HeaderProvider>
        <OwnerMembersPage />
      </HeaderProvider>
    );

    expect(screen.getByRole('tab', { name: /신청/, selected: true })).toBeTruthy();
    expect(screen.getByText('가나디')).toBeTruthy();
    expect(screen.getByRole('button', { name: '승인' })).toBeTruthy();
    expect(screen.queryByText('보리')).toBeNull();
  });
});
