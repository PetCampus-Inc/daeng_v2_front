// @vitest-environment jsdom
import { type ReactNode } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OverlayProvider } from 'overlay-kit';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { Mypage } from './Mypage';

import { route } from '@shared/constants/route';

const push = vi.fn();
const petListState = { pets: [] as unknown[] };

vi.mock('@shared/lib/bridge', () => ({
  useStackNavigation: () => ({ push, reset: vi.fn() }),
  openConfirmDialog: vi.fn(),
  useBridge: () => ({}),
}));

vi.mock('@shared/ui/private-access', () => ({
  PrivateAccess: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock('@shared/ui/notification-bell', () => ({
  NotificationBell: () => null,
}));

vi.mock('@widgets/Header', () => {
  const Header = ({ children }: { children: ReactNode }) => <header>{children}</header>;
  Header.Title = ({ children }: { children: ReactNode }) => <h1>{children}</h1>;
  Header.RightSection = ({ children }: { children: ReactNode }) => <div>{children}</div>;
  return { Header };
});

vi.mock('@entities/notification', () => ({
  useHasUnreadNotificationQuery: () => ({ data: false }),
}));

vi.mock('@entities/pet', () => ({
  usePetListQuery: () => ({ data: { data: petListState.pets }, isLoading: false }),
  calculateAge: () => 1,
}));

vi.mock('@entities/user', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@entities/user')>()),
  useUserInfoQuery: () => ({ data: undefined }),
}));

vi.mock('@features/role-conversion', () => ({
  ownerMypageContent: {
    accountSectionTitle: '내 계정',
    ttokIdLabel: '똑독 ID',
    ttokIdDescription: '문의 시 사용되는 ID예요',
    otherInfoTitle: '기타 정보',
    logoutLabel: '로그아웃',
    withdrawLabel: '탈퇴하기',
  },
  roleConversionButtonContent: { convertToOwner: '원장으로 전환', convertoGuardian: '보호자로 전환' },
  OwnerKindergartenCard: () => null,
  OwnerKindergartenCardSkeleton: () => null,
  OwnerProfileRow: () => null,
  OwnerVerificationEntry: () => null,
  RoleConversionButton: ({ children }: { children: ReactNode }) => <button>{children}</button>,
  showConvertedToGuardianToast: vi.fn(),
  showConvertedToOwnerToast: vi.fn(),
  useMypageRoleView: () => ({
    isOwnerView: false,
    isGuardianView: true,
    canToggleRoleView: false,
    toggleRoleView: vi.fn(),
  }),
  useOwnerKindergarten: () => ({ isProfileLoading: false }),
  useOwnerProfile: () => ({ profile: {} }),
  useOwnerMypageSummary: () => ({}),
  useOwnerRole: () => ({ isOwner: false, isResolved: true }),
}));

vi.mock('@views/mypage/ui/MypageLazySections', async () => {
  const { AccountSection } = await import('@features/user-account');
  const { DogHouseSection } = await import('@features/dog-profile');
  return {
    AccountSection,
    DogHouseSection,
    QuickActionsSection: () => null,
    SettingsSection: () => null,
  };
});

vi.mock('@features/dog-profile', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@features/dog-profile')>()),
  DogSelectSheet: () => <div role='dialog' aria-label='대표 강아지 선택' />,
}));

const renderMypage = () =>
  render(
    <OverlayProvider>
      <Mypage />
    </OverlayProvider>
  );

describe('마이페이지 `내 정보` 진입 항목', () => {
  beforeEach(async () => {
    const { useUserStore } = await import('@entities/user');
    useUserStore.setState({ user: { userId: '1', nickname: '보호자' } } as never);
  });

  afterEach(() => {
    cleanup();
    push.mockReset();
    petListState.pets = [];
  });

  test('`유치원 연결 내역` 항목을 누르면 연결 이력 화면으로 이동한다', async () => {
    renderMypage();

    await userEvent.click(await screen.findByRole('button', { name: /유치원 연결 내역/ }));

    expect(push).toHaveBeenCalledWith({ pathname: route.kindergarten.connectionHistory.root });
  });

  test('`연결 신청 현황` 항목을 누르면 기존 연결 신청 현황 화면으로 이동한다', async () => {
    renderMypage();

    await userEvent.click(await screen.findByRole('button', { name: /연결 신청 현황/ }));

    expect(push).toHaveBeenCalledWith({ pathname: route.guardian.connectionApply.status.root });
  });

  test('등록한 강아지가 없어도 `유치원 연결 내역` 항목이 보인다', async () => {
    petListState.pets = [];

    renderMypage();

    expect(await screen.findByRole('button', { name: /유치원 연결 내역/ })).toBeTruthy();
  });
});
