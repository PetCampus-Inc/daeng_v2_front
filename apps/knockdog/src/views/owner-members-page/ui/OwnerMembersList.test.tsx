// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@shared/api';

import { useOwnerMembersPage } from '../model/useOwnerMembersPage';
import { OwnerMembersList } from './OwnerMembersList';

const mocks = vi.hoisted(() => ({
  getOwnerMembers: vi.fn(),
  getOwnerPet: vi.fn(),
  push: vi.fn(),
  toast: vi.fn(),
}));

vi.mock('@entities/owner-member/api/ownerMember', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@entities/owner-member/api/ownerMember')>()),
  getOwnerMembers: mocks.getOwnerMembers,
}));
vi.mock('@entities/owner-pet/api/ownerPet', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@entities/owner-pet/api/ownerPet')>()),
  getOwnerPet: mocks.getOwnerPet,
}));
vi.mock('@shared/lib/bridge', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@shared/lib/bridge')>()),
  useStackNavigation: () => ({ push: mocks.push }),
}));
vi.mock('@shared/ui/toast', () => ({ toast: mocks.toast }));
vi.mock('@features/role-conversion', () => ({
  useOwnerRole: () => ({ isOwner: true, isResolved: true }),
}));

const createMemberDto = (memberId: string, petId: string, dogName: string) => ({
  memberId,
  petId,
  dogName,
  guardianName: '보호자',
  profileImageUrl: null,
});

const createMembersResponse = (...members: ReturnType<typeof createMemberDto>[]) => ({
  data: { totalStudentCount: members.length, members },
});

/** 구성원 목록 화면과 같은 조합: 페이지 훅이 목록을 불러오고 목록 컴포넌트가 카드를 그린다 */
const MembersListHost = () => {
  const { ownerMembers } = useOwnerMembersPage();

  return <OwnerMembersList members={ownerMembers} emptyStateType={null} isLoading={false} isError={false} />;
};

const renderMembersList = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <MembersListHost />
    </QueryClientProvider>
  );
};

describe('구성원 목록에서 연결 해제 진입점을 없앤다', () => {
  beforeEach(() => {
    mocks.getOwnerMembers.mockResolvedValue(createMembersResponse(createMemberDto('member-1', 'pet-1', '콩이')));
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it('구성원 목록 카드에 연결 해제를 시작하는 메뉴가 없다', async () => {
    renderMembersList();

    expect(await screen.findByText('콩이')).toBeTruthy();
    expect(screen.queryByRole('button', { name: '콩이 더보기' })).toBeNull();
  });
});

describe('오래된 목록에서 해제된 원생 카드를 누르면 목록에 머문다', () => {
  beforeEach(() => {
    mocks.getOwnerMembers
      .mockResolvedValueOnce(
        createMembersResponse(createMemberDto('member-1', 'pet-1', '콩이'), createMemberDto('member-2', 'pet-2', '뭉치'))
      )
      .mockResolvedValue(createMembersResponse(createMemberDto('member-2', 'pet-2', '뭉치')));
    mocks.getOwnerPet.mockRejectedValue(new ApiError(403, 'PET-403-1', '접근 권한이 없는 원생입니다.'));
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it('이미 해제된 원생 카드를 누르면 프로필로 들어가지 않고 구성원 목록에 머물며 토스트가 보인다', async () => {
    renderMembersList();

    await userEvent.click(await screen.findByRole('button', { name: /콩이/ }));

    await waitFor(() => expect(mocks.toast).toHaveBeenCalledTimes(1));
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('이미 해제된 원생 카드를 누르고 나면 그 카드가 목록에서 사라진다', async () => {
    renderMembersList();

    await userEvent.click(await screen.findByRole('button', { name: /콩이/ }));

    await waitFor(() => expect(screen.queryByText('콩이')).toBeNull());
    expect(screen.getByText('뭉치')).toBeTruthy();
  });
});
