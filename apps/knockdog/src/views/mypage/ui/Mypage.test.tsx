// @vitest-environment jsdom
import { type ReactNode } from 'react';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OverlayProvider } from 'overlay-kit';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { Mypage } from './Mypage';

import { route } from '@shared/constants/route';
import { toast } from '@shared/ui/toast';

const push = vi.fn();
const navigateToTab = vi.fn<(path: string, query: undefined, mode: 'guardian' | 'owner') => Promise<void>>();
const setRoleView = vi.fn();
const roleState = { canSwitch: false, isOwnerView: false, isNative: false };
const petListState = { pets: [] as unknown[] };

vi.mock('@shared/lib/bridge', () => ({
  useStackNavigation: () => ({ push, reset: vi.fn() }),
  useTabNavigation: () => ({ navigateToTab }),
  openConfirmDialog: vi.fn(),
  useBridge: () => ({}),
}));

vi.mock('@shared/lib/device', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@shared/lib/device')>()),
  isNativeWebView: () => roleState.isNative,
}));

vi.mock('@shared/ui/private-access', () => ({
  PrivateAccess: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock('@shared/ui/notification-bell', () => ({
  NotificationBell: () => null,
}));

vi.mock('@shared/ui/toast', () => ({ toast: vi.fn() }));

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
  RoleConversionButton: ({ children, onClick, disabled }: {
    children: ReactNode;
    onClick: () => void;
    disabled: boolean;
  }) => <button onClick={onClick} disabled={disabled}>{children}</button>,
  showConvertedToGuardianToast: vi.fn(),
  showConvertedToOwnerToast: vi.fn(),
  useMypageRoleView: () => ({
    isOwnerView: roleState.isOwnerView,
    isGuardianView: !roleState.isOwnerView,
    canToggleRoleView: roleState.canSwitch,
    setRoleView,
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
    navigateToTab.mockReset();
    setRoleView.mockReset();
    vi.mocked(toast).mockClear();
    Object.assign(roleState, { canSwitch: false, isOwnerView: false, isNative: false });
    petListState.pets = [];
  });

  test('네이티브 탭 전환이 실패하면 마이페이지 모드를 변경하지 않는다', async () => {
    Object.assign(roleState, { canSwitch: true, isOwnerView: true, isNative: true });
    navigateToTab.mockRejectedValueOnce(new Error('Navigation unavailable'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      renderMypage();
      await userEvent.click(await screen.findByRole('button', { name: '보호자로 전환' }));

      await waitFor(() => expect(toast).toHaveBeenCalledOnce());
      expect(setRoleView).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });

  test.each([
    [true, '보호자로 전환', 'guardian'],
    [false, '원장으로 전환', 'owner'],
  ] as const)('앱에서 네이티브 탭이 전환된 뒤 마이페이지 모드를 저장한다 (%s)', async (isOwnerView, label, mode) => {
    Object.assign(roleState, { canSwitch: true, isOwnerView, isNative: true });
    let confirmSwitch: () => void = () => {};
    navigateToTab.mockImplementationOnce(() => new Promise<void>((resolve) => {
      confirmSwitch = resolve;
    }));

    renderMypage();
    const button = await screen.findByRole('button', { name: label });
    await userEvent.click(button);

    expect(navigateToTab).toHaveBeenCalledWith('/mypage', undefined, mode);
    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(setRoleView).not.toHaveBeenCalled();

    await act(async () => confirmSwitch());
    expect(setRoleView).toHaveBeenCalledExactlyOnceWith(mode);
    expect((button as HTMLButtonElement).disabled).toBe(false);
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

describe('마이페이지 반려견 프로필 영역', () => {
  beforeEach(async () => {
    const { useUserStore } = await import('@entities/user');
    useUserStore.setState({ user: { userId: '1', nickname: '보호자' } } as never);
  });

  afterEach(() => {
    cleanup();
    push.mockReset();
    petListState.pets = [];
  });

  test('등록한 강아지가 없으면 강아지 추가 안내가 보이고 마리수·대표 강아지 변경 영역은 보이지 않는다', async () => {
    petListState.pets = [];

    renderMypage();

    expect(await screen.findByRole('button', { name: /강아지 추가하기/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /대표 강아지 변경/ })).toBeNull();
    expect(screen.queryByText(/마리/)).toBeNull();
  });

  test('`대표 강아지 변경`을 누르면 대표 강아지 선택 바텀시트가 열린다', async () => {
    petListState.pets = [
      { id: '1', name: '초코', breed: '푸들', birthYear: 2022, isRepresentative: true },
    ];

    renderMypage();
    await userEvent.click(await screen.findByRole('button', { name: /대표 강아지 변경/ }));

    expect(await screen.findByRole('dialog', { name: '대표 강아지 선택' })).toBeTruthy();
  });

  test('원장으로 등록하지 않은 사용자에게는 `원장으로 전환` 줄이 보이지 않는다', async () => {
    renderMypage();
    await screen.findByRole('button', { name: /유치원 연결 내역/ });

    expect(screen.queryByRole('button', { name: /원장으로 전환/ })).toBeNull();
  });
});
