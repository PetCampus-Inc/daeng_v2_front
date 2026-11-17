// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { ApiError } from '@shared/api';

import { OwnerMemberProfilePage } from './OwnerMemberProfilePage';

const searchParamsRef = vi.hoisted(() => ({ current: new URLSearchParams() }));
const mocks = vi.hoisted(() => ({
  petId: '1',
  getOwnerPet: vi.fn(),
  getOwnerPetGuardian: vi.fn(),
  navigateToTab: vi.fn(),
}));

vi.mock('@shared/lib/bridge', () => ({
  useTabNavigation: () => ({ navigateToTab: mocks.navigateToTab }),
}));
vi.mock('@shared/ui/toast', () => ({ toast: vi.fn() }));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: mocks.petId }),
  useSearchParams: () => searchParamsRef.current,
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));
// 클립보드 복사는 네이티브 브리지에 의존한다. 이 테스트의 관심사가 아니다.
vi.mock('@shared/lib/device', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@shared/lib/device')>()),
  useClipboardCopy: () => vi.fn(),
}));
vi.mock('@entities/owner-pet/api/ownerPet', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@entities/owner-pet/api/ownerPet')>()),
  ...mocks,
}));
vi.mock('./OwnerMemberProfileDisconnectButton', () => ({
  OwnerMemberProfileDisconnectButton: () => null,
}));
vi.mock('./OwnerMemberTicketSection', () => ({ OwnerMemberTicketSection: () => null }));
vi.mock('./OwnerMemberConnectionHistorySection', () => ({
  OwnerMemberConnectionHistorySection: () => null,
}));
vi.mock('./AttendanceRecordSection', () => ({ AttendanceRecordSection: () => null }));
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

describe('해제된 원생의 프로필에 들어오면 원생 목록으로 돌아간다', () => {
  beforeEach(() => {
    mocks.petId = '1';
    mocks.navigateToTab.mockResolvedValue(undefined);
  });
  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it('접근 권한이 없는 원생은 목록으로 이동하고 프로필 내용은 보이지 않는다', async () => {
    mocks.getOwnerPet.mockRejectedValue(new ApiError(403, 'PET-403-1', '접근 권한이 없는 원생입니다.'));
    renderProfilePage();

    await waitFor(() => expect(mocks.navigateToTab).toHaveBeenCalledWith('/owner/members', undefined, 'owner'));
    expect(screen.queryByRole('tab')).toBeNull();
  });

  it('일시적인 서버 오류는 목록 이동으로 처리하지 않는다', async () => {
    mocks.getOwnerPet.mockRejectedValue(new ApiError(500, 'SERVER_ERROR', '서버 오류'));
    renderProfilePage();

    await screen.findByText('원생 프로필을 불러오지 못했어요');
    expect(mocks.navigateToTab).not.toHaveBeenCalled();
  });

  it('존재하지 않는 원생 응답도 목록으로 돌아간다', async () => {
    mocks.getOwnerPet.mockRejectedValue(new ApiError(404, 'PET-404-1', '해당 강아지가 존재하지 않습니다.'));
    renderProfilePage();

    await waitFor(() => expect(mocks.navigateToTab).toHaveBeenCalledWith('/owner/members', undefined, 'owner'));
  });

  it('응답에 프로필이 없으면 목록으로 돌아간다', async () => {
    mocks.getOwnerPet.mockResolvedValue({ data: null });
    renderProfilePage();

    await waitFor(() => expect(mocks.navigateToTab).toHaveBeenCalledWith('/owner/members', undefined, 'owner'));
  });

  it('원생 ID가 숫자가 아닌 잘못된 주소는 조회하지 않고 목록으로 돌아간다', async () => {
    mocks.petId = 'invalid';
    renderProfilePage();

    await waitFor(() => expect(mocks.navigateToTab).toHaveBeenCalledWith('/owner/members', undefined, 'owner'));
    expect(mocks.getOwnerPet).not.toHaveBeenCalled();
  });
});

describe('원생 프로필 탭 지정 열기', () => {
  beforeEach(() => {
    mocks.petId = '1';
    searchParamsRef.current = new URLSearchParams();
    mocks.getOwnerPet.mockResolvedValue({
      data: {
        petId: 1,
        name: '콩이',
        profileImage: null,
        gender: 'MALE',
        isNeutered: true,
        breedName: '말티즈',
        weight: 3.5,
        birthDate: '2023-01-01',
        relationship: 'MOTHER',
        allergies: [],
        diseases: [],
        medications: [],
        temperament: null,
        memo: null,
      },
    });
    mocks.getOwnerPetGuardian.mockResolvedValue({ data: null });
    // jsdom에는 ResizeObserver가 없어서 비워 둔다.
    globalThis.ResizeObserver ??= class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });
  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  test('이동 경로에서 등하원 기록 탭을 지정하면 프로필 화면이 그 탭으로 열린다', async () => {
    searchParamsRef.current = new URLSearchParams('tab=attendance');
    renderProfilePage();

    await screen.findAllByRole('tab');
    const selectedTab = screen.getByRole('tab', { selected: true }).textContent;
    const attendanceTab = screen.getAllByRole('tab')[2]?.textContent;

    // 탭 순서: 이용 정보 · 보호자 정보 · 등하원 기록
    expect(selectedTab).toBe(attendanceTab);
  });

  test('탭을 지정하지 않으면 프로필 화면이 지금처럼 첫 탭(이용권)으로 열린다', async () => {
    renderProfilePage();

    await screen.findAllByRole('tab');
    const selectedTab = screen.getByRole('tab', { selected: true }).textContent;
    const usageTab = screen.getAllByRole('tab')[0]?.textContent;

    expect(selectedTab).toBe(usageTab);
  });
});
