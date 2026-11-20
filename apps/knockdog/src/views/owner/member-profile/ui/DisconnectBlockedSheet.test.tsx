// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { OwnerMemberDisconnectBlock } from '@entities/owner-member';

import { DisconnectBlockedSheet } from './DisconnectBlockedSheet';

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

const BLOCKS: OwnerMemberDisconnectBlock[] = [
  { type: 'reservation', dateLabel: '2026.11.20', timeLabel: '오후 9:30' },
  { type: 'ticket', name: '모모네 유치원 10회권', remainingCount: 6, expiryLabel: '2026.12.31까지' },
];

const renderSheet = (close = vi.fn()) => {
  render(
    <DisconnectBlockedSheet
      isOpen
      close={close}
      bodyKind='ticket'
      blocks={BLOCKS}
      kindergartenName='모모네 유치원'
    />
  );

  return close;
};

describe('해제 불가 시트에 남은 예약·이용권을 보여준다', () => {
  afterEach(cleanup);

  it('예약과 이용권이 모두 남아 있으면 예약 항목이 이용권 항목보다 먼저 보인다', () => {
    renderSheet();

    const [firstItem, secondItem] = within(screen.getByRole('list')).getAllByRole('listitem');

    expect(firstItem?.textContent).toContain('2026.11.20 오후 9:30');
    expect(secondItem?.textContent).toContain('모모네 유치원 10회권');
  });

  it('시트의 `확인`을 누르면 시트가 닫히고 원생 프로필이 그대로 남는다', async () => {
    const close = renderSheet();

    await userEvent.click(screen.getByRole('button', { name: '확인' }));

    expect(close).toHaveBeenCalledTimes(1);
  });

  it('시트의 어두운 배경을 누르면 시트가 닫히고 원생 프로필이 그대로 남는다', async () => {
    const close = renderSheet();

    await userEvent.click(screen.getByTestId('sheet-dim'));

    expect(close).toHaveBeenCalledTimes(1);
  });
});
