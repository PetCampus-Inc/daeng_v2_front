// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MemberTicketChargePage } from './MemberTicketChargePage';

import { HeaderProvider } from '@widgets/Header';

vi.mock('next/navigation', () => ({ useParams: () => ({ id: '1' }) }));
vi.mock('@entities/owner-pass-template', () => ({
  useOwnerPassTemplatesQuery: () => ({ data: [] }),
}));
vi.mock('@entities/owner-pet-ticket', () => ({ useChargePetTicketMutation: () => ({ mutate: vi.fn() }) }));
vi.mock('@shared/lib/bridge', () => ({
  getCurrentTxId: vi.fn(),
  useNativeBackHandler: vi.fn(),
  useNavigationResult: () => ({ send: vi.fn() }),
  useStackNavigation: () => ({ back: vi.fn() }),
}));
vi.mock('@shared/lib/useUnsavedBrowserBackGuard', () => ({
  useUnsavedBrowserBackGuard: () => ({ releaseAndLeave: vi.fn() }),
}));
vi.mock('@shared/ui/toast', () => ({ toast: vi.fn() }));
vi.mock('./TicketChargeLeaveDialog', () => ({ TicketChargeLeaveDialog: () => null }));
vi.mock('./TicketChargeDateSheet', () => ({
  TicketChargeDateSheet: ({
    onDraftChange,
    onConfirm,
  }: {
    onDraftChange: (date: Date) => void;
    onConfirm: () => void;
  }) => (
    <>
      <button onClick={() => onDraftChange(new Date(2026, 9, 25))}>다음 날짜</button>
      <button onClick={() => onDraftChange(new Date(2026, 9, 24))}>오늘 날짜</button>
      <button onClick={onConfirm}>날짜 확정</button>
    </>
  ),
}));
vi.mock('./TicketChargePresetSheet', () => ({
  TicketChargePresetSheet: ({
    onSelectDirect,
    onSelectPreset,
  }: {
    onSelectDirect: () => void;
    onSelectPreset: (preset: unknown) => void;
  }) => (
    <>
      <button onClick={onSelectDirect}>직접입력 전환</button>
      <button
        onClick={() =>
          onSelectPreset({
            id: '1',
            name: '정기권',
            count: 10,
            duration: { kind: 'month', months: 3 },
          })
        }
      >
        개월권 선택
      </button>
      <button
        onClick={() =>
          onSelectPreset({
            id: '2',
            name: '직접 기간권',
            count: 5,
            duration: { kind: 'custom', amount: 7, unit: 'month' },
          })
        }
      >
        직접 기간권 선택
      </button>
    </>
  ),
}));

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 24, 12));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('이용권 충전 입력 전환', () => {
  it('기본 시작일은 오늘이고 다른 날짜를 선택했다 오늘로 돌아오면 표시가 복원된다', () => {
    render(
      <HeaderProvider>
        <MemberTicketChargePage />
      </HeaderProvider>
    );
    expect(screen.getByRole('button', { name: '2026.10.24 (오늘)' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '다음 날짜' }));
    fireEvent.click(screen.getByRole('button', { name: '날짜 확정' }));
    expect(screen.getByRole('button', { name: '2026.10.25' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '오늘 날짜' }));
    fireEvent.click(screen.getByRole('button', { name: '날짜 확정' }));
    expect(screen.getByRole('button', { name: '2026.10.24 (오늘)' })).toBeTruthy();
  });

  it.each(['개월권 선택', '직접 기간권 선택'])(
    '%s 후 직접입력하면 이전 값이 초기화되고 시작일은 유지된다',
    (preset) => {
      render(
        <HeaderProvider>
          <MemberTicketChargePage />
        </HeaderProvider>
      );
      fireEvent.click(screen.getByRole('button', { name: '다음 날짜' }));
      fireEvent.click(screen.getByRole('button', { name: '날짜 확정' }));
      fireEvent.click(screen.getByRole('button', { name: preset }));
      const name = screen.getByPlaceholderText<HTMLInputElement>('이름을 입력하세요.');
      const count = screen.getByPlaceholderText<HTMLInputElement>('횟수를 입력하세요.');
      expect(name.disabled).toBe(true);
      expect(count.value).not.toBe('');
      fireEvent.click(screen.getByRole('button', { name: '직접입력 전환' }));
      expect(name.value).toBe('');
      expect(count.value).toBe('');
      expect(name.disabled).toBe(false);
      expect(count.disabled).toBe(false);
      expect(screen.queryAllByRole('button', { pressed: true })).toHaveLength(0);
      expect(screen.getByRole('button', { name: '충전하기' }).hasAttribute('disabled')).toBe(true);
      expect(screen.getByRole('button', { name: '2026.10.25' })).toBeTruthy();
      fireEvent.click(screen.getByRole('button', { name: '직접 입력' }));
      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
      expect(inputs[2]?.value).toBe('');
    }
  );
});
