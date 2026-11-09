// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@shared/api';

import { OwnerMemberProfilePage } from './OwnerMemberProfilePage';

const mocks = vi.hoisted(() => ({
  getOwnerPet: vi.fn(),
  getOwnerPetGuardian: vi.fn(),
}));

vi.mock('next/navigation', () => ({ useParams: () => ({ id: '1' }) }));
// 클립보드 복사는 네이티브 브리지에 의존한다. 이 테스트의 관심사가 아니다.
vi.mock('@shared/lib/device', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@shared/lib/device')>()),
  useClipboardCopy: () => vi.fn(),
}));
vi.mock('@entities/owner-pet/api/ownerPet', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@entities/owner-pet/api/ownerPet')>()),
  ...mocks,
}));
// 헤더는 네이티브 브리지에 의존한다. 이 테스트의 관심사가 아니라 단순한 자리표시로 바꾼다.
vi.mock('@widgets/Header', async () => {
  const { createElement } = await import('react');
  const Slot = ({ children }: { children?: React.ReactNode }) => createElement('div', null, children);
  return { Header: Object.assign(Slot, { LeftSection: Slot, RightSection: Slot, Title: Slot, BackButton: () => null }) };
});

const renderProfilePage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <OwnerMemberProfilePage />
    </QueryClientProvider>
  );
};

describe('해제된 원생의 프로필에 들어오면 접근 불가 화면을 보여준다', () => {
  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it('해제된 원생의 프로필로 들어오면 공통 오류 화면이 보이고 프로필 내용은 보이지 않는다', async () => {
    mocks.getOwnerPet.mockRejectedValue(new ApiError(403, 'PET-403-1', '접근 권한이 없는 원생입니다.'));
    renderProfilePage();

    expect(await screen.findByRole('heading', { level: 1 })).toBeTruthy();
    expect(screen.queryByRole('tab')).toBeNull();
  });
});
