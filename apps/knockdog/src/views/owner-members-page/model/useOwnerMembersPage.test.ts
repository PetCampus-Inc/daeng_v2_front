// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useOwnerMembersPage } from './useOwnerMembersPage';

const search = vi.hoisted(() => ({ value: new URLSearchParams() }));
vi.mock('next/navigation', () => ({ useSearchParams: () => search.value }));
vi.mock('@features/role-conversion', () => ({
  useOwnerRole: () => ({ isOwner: true, isResolved: true }),
}));
vi.mock('@entities/user', () => ({
  useUserStore: (select: (state: { user: { userId: string } }) => unknown) => select({ user: { userId: 'owner' } }),
}));
vi.mock('@entities/owner-member', () => ({
  OWNER_MEMBERS_TAB: { registered: 'registered', pending: 'pending' },
  OWNER_MEMBERS_TAB_QUERY_KEY: 'tab',
  useOwnerMembersQuery: () => ({ isLoading: false, isFetchedAfterMount: true, isError: false }),
}));
vi.mock('@shared/ui/toast', () => ({ toast: vi.fn() }));

describe('열려 있는 구성원 화면의 진입 쿼리 반영', () => {
  beforeEach(() => {
    search.value = new URLSearchParams();
  });

  it('새 신청 진입은 기존 필터와 검색을 초기화하고 신청 탭을 연다', () => {
    const { result, rerender } = renderHook(() => useOwnerMembersPage());
    act(() => {
      result.current.setSelectedFilter('EXPIRED');
      result.current.handleSearchQueryChange('보리');
    });
    search.value = new URLSearchParams('tab=pending&homeEntry=1');
    rerender();
    expect(result.current.selectedTab).toBe('pending');
    expect(result.current.selectedFilter).toBe('ALL');
    expect(result.current.keyword).toBe('');
    expect(result.current.searchQuery).toBe('');
  });

  it('같은 이용권 카드로 재진입하면 사용자가 바꾼 탭과 필터를 다시 맞춘다', () => {
    search.value = new URLSearchParams('tab=registered&filter=expiring&homeEntry=1');
    const { result, rerender } = renderHook(() => useOwnerMembersPage());
    act(() => {
      result.current.setSelectedTab('pending');
      result.current.setSelectedFilter('ALL');
    });
    rerender();
    expect(result.current.selectedTab).toBe('pending');
    search.value = new URLSearchParams('tab=registered&filter=expiring&homeEntry=2');
    rerender();
    expect(result.current.selectedTab).toBe('registered');
    expect(result.current.selectedFilter).toBe('EXPIRING');
  });

  it('진입 조건 없는 URL 변경은 직접 선택한 탭과 필터를 유지한다', () => {
    const { result, rerender } = renderHook(() => useOwnerMembersPage());
    act(() => {
      result.current.setSelectedTab('pending');
      result.current.setSelectedFilter('EXPIRED');
    });
    search.value = new URLSearchParams('homeEntry=1');
    rerender();
    expect(result.current.selectedTab).toBe('pending');
    expect(result.current.selectedFilter).toBe('EXPIRED');
  });
});
