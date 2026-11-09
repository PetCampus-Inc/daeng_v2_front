// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { OwnerMember } from '@entities/owner-member';

import { OwnerMembersList } from './OwnerMembersList';

vi.mock('@shared/lib/bridge', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@shared/lib/bridge')>()),
  useStackNavigation: () => ({ push: vi.fn() }),
}));
vi.mock('@shared/ui/toast', () => ({ toast: vi.fn() }));

const MEMBERS: OwnerMember[] = [
  {
    id: 'member-1',
    petId: 'pet-1',
    dogName: '콩이',
    guardianName: '보호자',
    profileImageUrl: null,
    lastAttendanceAt: null,
  },
];

const renderList = () =>
  render(<OwnerMembersList members={MEMBERS} emptyStateType={null} isLoading={false} isError={false} />);

describe('구성원 목록에서 연결 해제 진입점을 없앤다', () => {
  afterEach(cleanup);

  it('구성원 목록 카드에 연결 해제를 시작하는 메뉴가 없다', () => {
    renderList();

    expect(screen.getByText('콩이')).toBeTruthy();
    expect(screen.queryByRole('button', { name: '콩이 더보기' })).toBeNull();
  });
});
