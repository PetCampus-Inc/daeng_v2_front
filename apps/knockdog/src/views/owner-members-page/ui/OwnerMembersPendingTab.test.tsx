// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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

/** `강아지수` 라벨과 숫자가 한 묶음으로 나란히 보이는지 확인한다 */
const expectDogCountTag = (count: string) => {
  const group = screen.getByText('강아지수').parentElement!;
  expect(within(group).getByText(count)).toBeTruthy();
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

type PendingRequest = { requestId: string; petId: number; dogName: string; guardianName: string };
let pendingRequests: PendingRequest[] = [];
const pendingFixture = (): PendingRequest[] => [
  { requestId: 'p2', petId: 12, dogName: '나나', guardianName: '김나나' },
  { requestId: 'p1', petId: 11, dogName: '가가', guardianName: '김가가' },
  { requestId: 'p3', petId: 13, dogName: '다다', guardianName: '김다다' },
];
const respondPending = (sort = 'LATEST', keyword = '') => {
  const requests = pendingRequests.filter((request) => request.dogName.includes(keyword));
  if (sort === 'NAME') requests.sort((a, b) => a.dogName.localeCompare(b.dogName, 'ko'));
  if (sort === 'OLDEST') requests.reverse();

  return {
    data: {
      pendingCount: requests.length,
      requests: requests.map((request) => ({ ...request, memberId: request.requestId, profileImageUrl: null })),
    },
  };
};
const removePending = (requestId: string) => {
  pendingRequests = pendingRequests.filter((request) => request.requestId !== requestId);
  return Promise.resolve({ data: {} });
};
const listedDogNames = () => screen.getAllByText(/^(가가|나나|다다)$/).map((element) => element.textContent);

const setupApis = () => {
  vi.clearAllMocks();
  pendingRequests = pendingFixture();
  mocks.getOwnerPendingMembers.mockImplementation(async (params?: { sort?: string; keyword?: string }) =>
    respondPending(params?.sort, params?.keyword)
  );
  mocks.getOwnerMembers.mockImplementation(async () => createMembersResponse({ pendingCount: pendingRequests.length }));
  mocks.postApproveOwnerMember.mockImplementation(removePending);
  mocks.postRejectOwnerMember.mockImplementation(removePending);
};

describe('신청 인원 표시', () => {
  beforeEach(setupApis);
  afterEach(cleanup);

  it('`신청` 탭을 누르면 신청 목록과 신청 수가 적힌 `강아지수` 태그가 보인다', async () => {
    renderPage('');

    fireEvent.click(await screen.findByRole('tab', { name: /신청/ }));

    expect(await screen.findByText('가가')).toBeTruthy();
    expectDogCountTag('3');
  });

  it('신청이 0건이면 태그가 숨겨지고 `신청한 원생이 없어요` / `QR코드를 통해 원생 신청을 받아보세요.`가 보인다', async () => {
    pendingRequests = [];

    renderPage('tab=pending');

    expect(await screen.findByText('신청한 원생이 없어요')).toBeTruthy();
    expect(screen.getByText('QR코드를 통해 원생 신청을 받아보세요.')).toBeTruthy();
    expect(screen.queryByText(/강아지수/)).toBeNull();
  });
});

describe('신청 목록 정렬', () => {
  beforeEach(setupApis);
  afterEach(cleanup);

  it('`신청` 탭은 `최신순`이 선택된 채 열린다', async () => {
    renderPage('tab=pending');
    await screen.findByText('가가');

    expect(screen.getByRole('button', { name: '최신순' })).toBeTruthy();
    expect(mocks.getOwnerPendingMembers).toHaveBeenCalledWith(expect.objectContaining({ sort: 'LATEST' }));
    expect(listedDogNames()).toEqual(['나나', '가가', '다다']);
  });

  it('정렬 영역을 누르면 드롭다운이 열리고 현재 기준이 선택 표시된다', async () => {
    renderPage('tab=pending');
    await screen.findByText('가가');

    fireEvent.click(screen.getByRole('button', { name: '최신순' }));

    expect(screen.getByRole('button', { name: '이름순' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '오래된순' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '최신순', pressed: true })).toBeTruthy();
  });

  it('다른 정렬 기준을 고르면 그 기준의 목록으로 바뀌고 드롭다운이 닫힌다', async () => {
    renderPage('tab=pending');
    await screen.findByText('가가');
    fireEvent.click(screen.getByRole('button', { name: '최신순' }));

    fireEvent.click(screen.getByRole('button', { name: '이름순' }));
    await waitFor(() =>
      expect(mocks.getOwnerPendingMembers).toHaveBeenCalledWith(expect.objectContaining({ sort: 'NAME' }))
    );
    await waitFor(() => expect(listedDogNames()).toEqual(['가가', '나나', '다다']));
    expect(screen.queryByRole('button', { name: '오래된순' })).toBeNull();
  });
});

describe('승인과 승인 완료 안내 모달', () => {
  beforeEach(setupApis);
  afterEach(cleanup);

  const approveFirst = async () => {
    renderPage('tab=pending');
    await screen.findByText('가가');
    fireEvent.click(screen.getAllByRole('button', { name: '승인' })[0]!);
  };

  it('`승인`을 누르면 `원생 승인을 완료했어요` / `{강아지 이름}의 유치원 연결이 완료됐어요.` 모달과 `닫기`·`이용권 충전하기` 버튼이 보인다', async () => {
    await approveFirst();

    const dialog = await screen.findByRole('alertdialog');
    expect(within(dialog).getByText('원생 승인을 완료했어요')).toBeTruthy();
    expect(within(dialog).getByText('나나의 유치원 연결이 완료됐어요.')).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: '닫기' })).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: '이용권 충전하기' })).toBeTruthy();
  });

  it('승인 완료 모달에서 `닫기`를 누르면 모달이 닫히고, 승인한 원생이 빠진 신청 목록과 줄어든 신청 수가 보인다', async () => {
    await approveFirst();

    fireEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: '닫기' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    await waitFor(() => expect(listedDogNames()).toEqual(['가가', '다다']));
    expectDogCountTag('2');
    expect(screen.getByRole('tab', { name: '신청 2' })).toBeTruthy();
  });

  it('승인이 실패하면 모달 없이 공통 오류 안내가 보이고 `승인` 버튼을 다시 누를 수 있다', async () => {
    mocks.postApproveOwnerMember.mockRejectedValue(new Error('network'));

    await approveFirst();

    await waitFor(() => expect(mocks.toast).toHaveBeenCalled());
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect((screen.getAllByRole('button', { name: '승인' })[0] as HTMLButtonElement).disabled).toBe(false);
  });
});

describe('거절 확인 모달과 거절 완료 토스트', () => {
  beforeEach(setupApis);
  afterEach(cleanup);

  const clickRejectOnFirst = async () => {
    renderPage('tab=pending');
    fireEvent.click((await screen.findAllByRole('button', { name: '거절' }))[0]!);
    return screen.findByRole('alertdialog');
  };

  it('`거절`을 누르면 `원생 승인을 거절할까요?` / `거절한 원생은 되돌릴 수 없어요.` 모달과 `닫기`·`거절하기` 버튼이 보인다', async () => {
    const dialog = await clickRejectOnFirst();

    expect(within(dialog).getByText('원생 승인을 거절할까요?')).toBeTruthy();
    expect(within(dialog).getByText('거절한 원생은 되돌릴 수 없어요.')).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: '닫기' })).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: '거절하기' })).toBeTruthy();
  });

  it('거절 확인 모달에서 `닫기`를 누르면 거절하지 않고 신청 목록이 그대로다', async () => {
    const dialog = await clickRejectOnFirst();

    fireEvent.click(within(dialog).getByRole('button', { name: '닫기' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(mocks.postRejectOwnerMember).not.toHaveBeenCalled();
    expect(listedDogNames()).toEqual(['나나', '가가', '다다']);
  });

  it('`거절하기`를 누르면 모달이 닫히고 토스트 `원생 거절이 완료되었어요`가 보이며, 그 원생이 목록에서 빠지고 신청 수가 줄어든다', async () => {
    const dialog = await clickRejectOnFirst();

    fireEvent.click(within(dialog).getByRole('button', { name: '거절하기' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    await waitFor(() =>
      expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ title: '원생 거절이 완료되었어요' }))
    );
    await waitFor(() => expect(listedDogNames()).toEqual(['가가', '다다']));
    expectDogCountTag('2');
  });

  it('마지막 남은 신청을 거절하면 신청 목록 빈 상태가 보인다', async () => {
    pendingRequests = pendingRequests.slice(0, 1);
    const dialog = await clickRejectOnFirst();

    fireEvent.click(within(dialog).getByRole('button', { name: '거절하기' }));

    expect(await screen.findByText('신청한 원생이 없어요')).toBeTruthy();
  });

  it('거절이 실패하면 신청 목록이 그대로이고 공통 오류 안내가 보인다', async () => {
    mocks.postRejectOwnerMember.mockRejectedValue(new Error('network'));
    const dialog = await clickRejectOnFirst();

    fireEvent.click(within(dialog).getByRole('button', { name: '거절하기' }));

    await waitFor(() => expect(mocks.toast).toHaveBeenCalled());
    expect(mocks.toast).not.toHaveBeenCalledWith(expect.objectContaining({ title: '원생 거절이 완료되었어요' }));
    expect(listedDogNames()).toEqual(['나나', '가가', '다다']);
  });
});

describe('신청 탭 검색', () => {
  beforeEach(setupApis);
  afterEach(cleanup);

  const typeKeyword = (value: string) =>
    fireEvent.change(screen.getByLabelText('구성원 검색어 입력'), { target: { value } });

  it('신청 탭에서 검색어를 입력하면 이름이나 견종이 일치하는 신청 목록으로 바뀐다', async () => {
    renderPage('tab=pending');
    await screen.findByText('가가');

    typeKeyword('나나');

    await waitFor(() => expect(listedDogNames()).toEqual(['나나']));
  });

  it('신청 탭에서 검색 결과가 없으면 `검색된 원생이 없어요` / `다른 원생을 검색해보세요.`가 보이고 검색창과 탭은 그대로다', async () => {
    renderPage('tab=pending');
    await screen.findByText('가가');

    typeKeyword('개냥이');

    expect(await screen.findByText('검색된 원생이 없어요')).toBeTruthy();
    expect(screen.getByText('다른 원생을 검색해보세요.')).toBeTruthy();
    expect(screen.getByLabelText('구성원 검색어 입력')).toBeTruthy();
    expect(screen.getByRole('tab', { name: /신청/, selected: true })).toBeTruthy();
  });

  it('신청 탭에서 검색어를 지우면 정렬 기준에 맞는 전체 신청 목록으로 돌아간다', async () => {
    renderPage('tab=pending');
    await screen.findByText('가가');
    fireEvent.click(screen.getByRole('button', { name: '최신순' }));
    fireEvent.click(screen.getByRole('button', { name: '이름순' }));
    await waitFor(() => expect(listedDogNames()).toEqual(['가가', '나나', '다다']));
    typeKeyword('나나');
    await waitFor(() => expect(listedDogNames()).toEqual(['나나']));

    typeKeyword('');

    await waitFor(() => expect(listedDogNames()).toEqual(['가가', '나나', '다다']));
  });
});
