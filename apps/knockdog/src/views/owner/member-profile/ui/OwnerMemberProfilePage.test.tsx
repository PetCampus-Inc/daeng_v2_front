// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { OwnerMemberProfilePage } from '@views/owner/member-profile/ui/OwnerMemberProfilePage';

const searchParamsRef = vi.hoisted(() => ({ current: new URLSearchParams() }));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '7' }),
  useSearchParams: () => searchParamsRef.current,
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));
vi.mock('@entities/owner-pet', () => ({
  useOwnerPetQuery: () => ({
    data: {
      petId: '7',
      name: '콩이',
      profileImageUrl: null,
      gender: null,
      isNeutered: null,
      breed: '말티즈',
      weightKg: null,
      birthYear: null,
    },
    isLoading: false,
    isError: false,
  }),
  useOwnerPetGuardianQuery: () => ({ data: undefined, isLoading: false, isError: false }),
}));
vi.mock('@views/owner/member-profile/model/useOwnerMemberProfileDisconnect', () => ({
  useOwnerMemberProfileDisconnect: () => ({ handleDisconnectClick: vi.fn(), isDisconnecting: false }),
}));
vi.mock('@views/owner/member-profile/ui/OwnerMemberTicketSection', () => ({ OwnerMemberTicketSection: () => null }));
vi.mock('@views/owner/member-profile/ui/OwnerMemberConnectionHistorySection', () => ({
  OwnerMemberConnectionHistorySection: () => null,
}));
vi.mock('@views/owner/member-profile/ui/AttendanceRecordSection', () => ({ AttendanceRecordSection: () => null }));
vi.mock('@shared/lib/device', () => ({ useClipboardCopy: () => vi.fn() }));
vi.mock('@widgets/Header', () => {
  const Slot = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  const Header = Object.assign(Slot, {
    LeftSection: Slot,
    RightSection: Slot,
    Title: Slot,
    BackButton: () => <button type='button'>뒤로</button>,
  });
  return { Header };
});

const getSelectedTabName = () => screen.getByRole('tab', { selected: true }).textContent;
const getTabName = (index: number) => screen.getAllByRole('tab')[index]?.textContent;

describe('원생 프로필 탭 지정 열기', () => {
  beforeEach(() => {
    searchParamsRef.current = new URLSearchParams();
    // jsdom에는 ResizeObserver가 없어서 비워 둔다.
    globalThis.ResizeObserver ??= class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });
  afterEach(cleanup);

  test('이동 경로에서 등하원 기록 탭을 지정하면 프로필 화면이 그 탭으로 열린다', () => {
    searchParamsRef.current = new URLSearchParams('tab=attendance');
    render(<OwnerMemberProfilePage />);

    // 탭 순서: 이용 정보 · 보호자 정보 · 등하원 기록
    expect(getSelectedTabName()).toBe(getTabName(2));
  });

  test('탭을 지정하지 않으면 프로필 화면이 지금처럼 첫 탭(이용권)으로 열린다', () => {
    render(<OwnerMemberProfilePage />);

    expect(getSelectedTabName()).toBe(getTabName(0));
  });
});
