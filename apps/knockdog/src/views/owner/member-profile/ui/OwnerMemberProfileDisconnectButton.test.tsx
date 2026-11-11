// @vitest-environment jsdom
import { QueryClient, QueryClientProvider, QueryObserver } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OverlayProvider } from 'overlay-kit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@shared/api';

import { OwnerMemberProfileDisconnectButton } from './OwnerMemberProfileDisconnectButton';

const apiMock = vi.hoisted(() => ({
  getOwnerMembers: vi.fn(),
  getDisconnectEligibility: vi.fn(),
  postDisconnectOwnerMember: vi.fn(),
}));

const uiMock = vi.hoisted(() => ({
  navigateToTab: vi.fn(),
  toast: vi.fn(),
}));

vi.mock('@entities/owner-member/api/ownerMember', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@entities/owner-member/api/ownerMember')>()),
  ...apiMock,
}));
vi.mock('@shared/lib/bridge', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@shared/lib/bridge')>()),
  useTabNavigation: () => ({ navigateToTab: uiMock.navigateToTab }),
  useNativeBackToClose: () => undefined,
}));
// 바텀시트 라이브러리(vaul)는 React 18로 빌드돼 테스트 환경(React 19)과 충돌한다. 시트 내부 동작은 라이브러리 책임이라 가짜 시트로 바꾼다.
vi.mock('@shared/ui/bottom-sheet', async () => {
  const { createContext, createElement, useContext } = await import('react');
  const SheetContext = createContext<(open: boolean) => void>(() => undefined);

  return {
    BottomSheet: {
      Root: ({
        open,
        onOpenChange,
        children,
      }: {
        open: boolean;
        onOpenChange: (open: boolean) => void;
        children: React.ReactNode;
      }) =>
        open
          ? createElement(
              SheetContext.Provider,
              { value: onOpenChange },
              createElement('div', { role: 'dialog' }, children)
            )
          : null,
      Overlay: () => {
        const onOpenChange = useContext(SheetContext);
        return createElement('div', { 'data-testid': 'sheet-dim', onClick: () => onOpenChange(false) });
      },
      Body: ({ children }: { children: React.ReactNode }) => createElement('div', null, children),
      Handle: () => null,
      Title: ({ children }: { children: React.ReactNode }) => createElement('h2', null, children),
    },
  };
});
vi.mock('@shared/lib/analytics', () => ({ trackConnectionStatus: vi.fn() }));
vi.mock('@shared/ui/toast', () => ({ toast: uiMock.toast }));
vi.mock('@features/role-conversion', () => ({
  useOwnerRole: () => ({ kindergarten: { name: '모모네 유치원' } }),
}));

const MEMBERS_RESPONSE = {
  data: {
    totalStudentCount: 1,
    members: [
      {
        memberId: 'member-1',
        petId: 'pet-1',
        dogName: '콩이',
        guardianName: '보호자',
        profileImageUrl: null,
      },
    ],
  },
};

const ELIGIBLE_RESPONSE = { data: { canDisconnect: true, blocks: [] } };

const BLOCKED_RESPONSE = {
  data: {
    canDisconnect: false,
    blocks: [
      {
        type: 'TICKET',
        ticket: { name: '모모네 유치원 10회권', remainingCount: 6, expiresOn: '2026-12-31' },
        reservation: null,
      },
    ],
  },
};

const renderDisconnectButton = (
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
) => {

  return render(
    <QueryClientProvider client={queryClient}>
      <OverlayProvider>
        <OwnerMemberProfileDisconnectButton petId='pet-1' dogName='콩이' />
      </OverlayProvider>
    </QueryClientProvider>
  );
};

describe('연결해제를 누르면 해제 가능 여부에 따라 화면을 나눈다', () => {
  beforeEach(() => {
    apiMock.getOwnerMembers.mockResolvedValue(MEMBERS_RESPONSE);
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it('해제할 수 있는 원생이면 `연결해제`를 눌렀을 때 해제 확인 모달이 열린다', async () => {
    apiMock.getDisconnectEligibility.mockResolvedValue(ELIGIBLE_RESPONSE);
    renderDisconnectButton();

    await userEvent.click(screen.getByRole('button', { name: '연결해제' }));

    expect(await screen.findByRole('alertdialog')).toBeTruthy();
  });

  it('해제할 수 없는 원생이면 `연결해제`를 눌렀을 때 해제 불가 시트가 열리고 해제 확인 모달은 열리지 않는다', async () => {
    apiMock.getDisconnectEligibility.mockResolvedValue(BLOCKED_RESPONSE);
    renderDisconnectButton();

    await userEvent.click(screen.getByRole('button', { name: '연결해제' }));

    expect(await screen.findByRole('dialog')).toBeTruthy();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('예약일과 만료일이 배열인 해제 불가 응답도 토스트 대신 예약·이용권 시트를 연다', async () => {
    apiMock.getDisconnectEligibility.mockResolvedValue({
      data: {
        canDisconnect: false,
        blocks: [
          {
            type: 'RESERVATION',
            ticket: null,
            reservation: { date: [2026, 11, 11], time: '20:30', status: '예약 확정' },
          },
          {
            type: 'TICKET',
            ticket: { name: '이용권 이름', remainingCount: 1, expiresOn: [2027, 2, 10] },
            reservation: null,
          },
        ],
      },
    });
    renderDisconnectButton();

    await userEvent.click(screen.getByRole('button', { name: '연결해제' }));

    expect(await screen.findByRole('dialog')).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(uiMock.toast).not.toHaveBeenCalled();
    expect(apiMock.postDisconnectOwnerMember).not.toHaveBeenCalled();
  });

  it('해제 불가 시트를 닫은 뒤 그 사이 조건이 풀렸으면 `연결해제`를 다시 눌렀을 때 해제 확인 모달이 열린다', async () => {
    apiMock.getDisconnectEligibility
      .mockResolvedValueOnce(BLOCKED_RESPONSE)
      .mockResolvedValueOnce(ELIGIBLE_RESPONSE);
    renderDisconnectButton();

    await userEvent.click(screen.getByRole('button', { name: '연결해제' }));
    await userEvent.click(await screen.findByRole('button', { name: '확인' }));
    await userEvent.click(screen.getByRole('button', { name: '연결해제' }));

    expect(await screen.findByRole('alertdialog')).toBeTruthy();
  });
});

describe('해제 확인 모달에서 연결을 해제한다', () => {
  beforeEach(() => {
    apiMock.getOwnerMembers.mockResolvedValue(MEMBERS_RESPONSE);
    apiMock.getDisconnectEligibility.mockResolvedValue(ELIGIBLE_RESPONSE);
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it('`닫기`를 누르면 모달이 닫히고 연결이 해제되지 않은 채 원생 프로필이 남는다', async () => {
    renderDisconnectButton();

    await userEvent.click(screen.getByRole('button', { name: '연결해제' }));
    await userEvent.click(await screen.findByRole('button', { name: '닫기' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(apiMock.postDisconnectOwnerMember).not.toHaveBeenCalled();
    expect(uiMock.navigateToTab).not.toHaveBeenCalled();
  });

  it('`해제하기`가 성공하면 구성원 목록으로 이동하고 해제한 원생 이름이 들어간 토스트가 보인다', async () => {
    apiMock.postDisconnectOwnerMember.mockResolvedValue({ data: {} });
    renderDisconnectButton();

    await userEvent.click(screen.getByRole('button', { name: '연결해제' }));
    await userEvent.click(await screen.findByRole('button', { name: '해제하기' }));

    await waitFor(() => expect(uiMock.navigateToTab).toHaveBeenCalledWith('/owner/members', undefined, 'owner'));
    expect(uiMock.toast).toHaveBeenCalledWith(expect.objectContaining({ nativeTitle: expect.stringContaining('콩이') }));
  });

  it('해제 직후에는 접근 권한이 없어진 프로필을 다시 조회하지 않고 캐시만 오래된 상태로 바꾼다', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const getProfile = vi.fn().mockResolvedValue({ name: '콩이' });
    const queryKey = ['ownerPet', 'pet-1'];
    queryClient.setQueryData(queryKey, { name: '콩이' });
    const observer = new QueryObserver(queryClient, { queryKey, queryFn: getProfile, staleTime: Infinity });
    const unsubscribe = observer.subscribe(() => undefined);
    apiMock.postDisconnectOwnerMember.mockResolvedValue({ data: {} });
    renderDisconnectButton(queryClient);

    try {
      await userEvent.click(screen.getByRole('button', { name: '연결해제' }));
      await userEvent.click(await screen.findByRole('button', { name: '해제하기' }));

      await waitFor(() => expect(uiMock.navigateToTab).toHaveBeenCalled());
      expect(getProfile).not.toHaveBeenCalled();
      expect(queryClient.getQueryState(queryKey)?.isInvalidated).toBe(true);
    } finally {
      unsubscribe();
    }
  });
});

describe('해제 처리 중 조건이 바뀌거나 이미 해제된 경우를 나눈다', () => {
  beforeEach(() => {
    apiMock.getOwnerMembers.mockResolvedValue(MEMBERS_RESPONSE);
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it('해제 가능 여부를 확인할 때 이미 해제된 응답이 오면 목록으로 돌아간다', async () => {
    apiMock.getDisconnectEligibility.mockRejectedValue(new ApiError(400, 'OWNER_MEMBER-400-2', '이미 해제됨'));
    renderDisconnectButton();

    await userEvent.click(screen.getByRole('button', { name: '연결해제' }));

    await waitFor(() => expect(uiMock.navigateToTab).toHaveBeenCalledWith('/owner/members', undefined, 'owner'));
    expect(apiMock.postDisconnectOwnerMember).not.toHaveBeenCalled();
  });

  it('목록 재조회가 실패하면 연결 해제로 판단하지 않고 프로필에 머문다', async () => {
    apiMock.getOwnerMembers.mockRejectedValue(new ApiError(500, 'SERVER_ERROR', '조회 실패'));
    renderDisconnectButton();

    await userEvent.click(screen.getByRole('button', { name: '연결해제' }));

    await waitFor(() => expect(uiMock.toast).toHaveBeenCalled());
    expect(uiMock.navigateToTab).not.toHaveBeenCalled();
  });

  it('`해제하기`를 눌렀는데 그 사이 이용권·예약이 생겨 서버가 거절하면 해제 불가 시트가 열린다', async () => {
    apiMock.getDisconnectEligibility
      .mockResolvedValueOnce(ELIGIBLE_RESPONSE)
      .mockResolvedValueOnce(BLOCKED_RESPONSE);
    apiMock.postDisconnectOwnerMember.mockRejectedValue(
      new ApiError(409, 'OWNER_MEMBER-409-3', '남은 이용권이나 끝나지 않은 예약이 있어 연결을 해제할 수 없습니다.')
    );
    renderDisconnectButton();

    await userEvent.click(screen.getByRole('button', { name: '연결해제' }));
    await userEvent.click(await screen.findByRole('button', { name: '해제하기' }));

    expect(await screen.findByRole('dialog')).toBeTruthy();
    expect(uiMock.navigateToTab).not.toHaveBeenCalled();
  });

  it('`해제하기`를 눌렀는데 이미 해제된 원생이라는 응답이 오면 구성원 목록으로 이동하고 이미 해제됐다는 토스트가 보인다', async () => {
    apiMock.getDisconnectEligibility.mockResolvedValue(ELIGIBLE_RESPONSE);
    apiMock.postDisconnectOwnerMember.mockRejectedValue(
      new ApiError(400, 'OWNER_MEMBER-400-2', '이미 연결 해제되었거나 연결된 구성원이 아닙니다.')
    );
    renderDisconnectButton();

    await userEvent.click(screen.getByRole('button', { name: '연결해제' }));
    await userEvent.click(await screen.findByRole('button', { name: '해제하기' }));

    await waitFor(() => expect(uiMock.navigateToTab).toHaveBeenCalledWith('/owner/members', undefined, 'owner'));
    expect(uiMock.toast).toHaveBeenCalledTimes(1);
    expect(uiMock.toast).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));
  });
});
