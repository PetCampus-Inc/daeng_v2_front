// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useOwnerHomePage } from '@views/owner-home-page/model/useOwnerHomePage';

const push = vi.fn();
let homeData: { school: { name: string }; operationStatus: Record<string, number> } | undefined;

vi.mock('@shared/lib/bridge', () => ({
  useStackNavigation: () => ({ push }),
  useTabNavigation: () => ({ navigateToTab: vi.fn() }),
}));
vi.mock('@features/role-conversion', () => ({
  useOwnerRole: () => ({ isOwner: true, isResolved: true, kindergarten: null, owner: null }),
}));
vi.mock('@entities/owner-home', () => ({
  useOwnerHomeQuery: () => ({ data: homeData, isError: false, refetch: vi.fn() }),
}));
vi.mock('@entities/owner-member', () => ({
  OWNER_MEMBERS_TAB: { registered: 'registered', pending: 'pending' },
  OWNER_MEMBERS_TAB_QUERY_KEY: 'tab',
  useOwnerMembersQuery: () => ({ data: undefined, refetch: vi.fn() }),
}));
vi.mock('@entities/user', () => ({
  useUserStore: (selector: (state: { user: { userId: string } }) => unknown) =>
    selector({ user: { userId: 'owner-1' } }),
}));

describe('승인 대기 진입점을 신청 탭으로 변경', () => {
  beforeEach(() => push.mockClear());

  it('홈의 `연결 관리`를 누르면 구성원 화면의 `신청` 탭이 열린다', () => {
    const { result } = renderHook(() => useOwnerHomePage());

    act(() => result.current.handleConnectionClick());

    expect(push).toHaveBeenCalledWith({
      pathname: '/owner/members',
      query: { tab: 'pending', homeEntry: expect.any(String) },
    });
  });

  it('이용권 카드의 반복 진입도 만료예정 필터를 다시 적용할 수 있게 구분한다', () => {
    const now = vi.spyOn(Date, 'now');
    const { result } = renderHook(() => useOwnerHomePage());
    now.mockReturnValueOnce(1).mockReturnValueOnce(2);

    act(() => result.current.handleTicketsClick());
    act(() => result.current.handleTicketsClick());

    expect(push).toHaveBeenNthCalledWith(1, {
      pathname: '/owner/members',
      query: { tab: 'registered', filter: 'expiring', homeEntry: '1' },
    });
    expect(push).toHaveBeenNthCalledWith(2, {
      pathname: '/owner/members',
      query: { tab: 'registered', filter: 'expiring', homeEntry: '2' },
    });
    now.mockRestore();
  });
});

describe('등원 현황 카드를 누르면 해당 일과 탭으로 이동', () => {
  const setCounts = (checkedInCount: number, absentCount: number, checkedOutCount: number) => {
    homeData = { school: { name: '똑독 유치원' }, operationStatus: { checkedInCount, absentCount, checkedOutCount } };
  };

  beforeEach(() => {
    push.mockClear();
    homeData = undefined;
  });

  it.each([
    ['등원 완료', 'handleCheckedInClick', 'attendance-check', 'checkedIn'],
    ['결석 확정', 'handleAbsentClick', 'attendance-check', 'absent'],
    ['하원 완료', 'handleCheckedOutClick', 'attendance-list', 'checkedOut'],
  ] as const)('%s 원생이 있으면 해당 탭으로 이동하고 그 상태를 먼저 보여 준다', (_label, handler, tab, focusStatus) => {
    setCounts(3, 2, 1);
    const { result } = renderHook(() => useOwnerHomePage());

    act(() => result.current[handler]());

    expect(push).toHaveBeenCalledWith({
      pathname: '/owner/daily',
      query: { tab, focusStatus, from: 'home' },
    });
  });

  it.each([
    ['등원 완료', 'handleCheckedInClick', 'attendance-check'],
    ['결석 확정', 'handleAbsentClick', 'attendance-check'],
    ['하원 완료', 'handleCheckedOutClick', 'attendance-list'],
  ] as const)('%s 0마리면 우선 표시 없이 기본 목록 탭으로 이동한다', (_label, handler, tab) => {
    setCounts(0, 0, 0);
    const { result } = renderHook(() => useOwnerHomePage());

    act(() => result.current[handler]());

    expect(push).toHaveBeenCalledWith({
      pathname: '/owner/daily',
      query: { tab, focusStatus: undefined, from: 'home' },
    });
  });
});
