// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { OwnerPassTemplateManagementSection } from './OwnerPassTemplateManagementSection';

const push = vi.fn();

vi.mock('@shared/lib/bridge', () => ({
  useStackNavigation: () => ({ push }),
}));

describe('마이페이지 이용권 관리 진입', () => {
  afterEach(() => {
    cleanup();
    push.mockReset();
  });

  test('원장 마이페이지의 `이용권 관리` 메뉴를 누르면 `/mypage/pass-templates`로 이동한다', async () => {
    render(<OwnerPassTemplateManagementSection />);

    await userEvent.click(screen.getByRole('button', { name: /이용권 관리/ }));

    expect(push).toHaveBeenCalledWith({ pathname: '/mypage/pass-templates' });
  });

  test('원장 마이페이지의 `예약 설정` 메뉴를 누르면 예약 설정 화면으로 이동한다', async () => {
    render(<OwnerPassTemplateManagementSection />);

    await userEvent.click(screen.getByRole('button', { name: /예약 설정/ }));

    expect(push).toHaveBeenCalledWith({ pathname: '/mypage/kindergarten/reservation' });
  });
});
