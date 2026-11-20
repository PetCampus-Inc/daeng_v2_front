// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { guardianKindergartenNoPetContent } from '@views/guardian-kindergarten-page/config/guardianKindergartenNoPetContent';

import { GuardianKindergartenEmptyState } from './GuardianKindergartenEmptyState';
import { GuardianKindergartenNoPetState } from './GuardianKindergartenNoPetState';
import { GuardianKindergartenPendingState } from './GuardianKindergartenPendingState';

const push = vi.fn();

vi.mock('next/image', () => ({ default: () => null }));
vi.mock('@shared/lib/bridge', () => ({
  useStackNavigation: () => ({ push }),
}));
vi.mock('./GuardianLinkedKindergartenCard', () => ({
  GuardianLinkedKindergartenCard: () => <div>유치원 카드</div>,
}));

const kindergarten = {
  id: 'school-1',
  placeId: 'place-1',
  name: '모모네 유치원',
  address: '서울특별시 강남구 논현로 123길 37',
  imageUrl: '',
};

function expectKindergartenTab() {
  expect(screen.getByRole('tab', { name: '유치원' }).getAttribute('aria-selected')).toBe('true');
  expect(screen.getByRole('tab', { name: '일기장' }).getAttribute('aria-selected')).toBe('false');
}

describe('유치원 홈 상태', () => {
  afterEach(() => {
    cleanup();
    push.mockReset();
  });

  test('강아지가 없으면 유치원 탭을 유지하고 등록 화면으로 보낸다', async () => {
    const user = userEvent.setup();
    render(<GuardianKindergartenNoPetState />);

    expectKindergartenTab();
    await user.click(screen.getByRole('button', { name: guardianKindergartenNoPetContent.ctaLabel }));

    expect(push).toHaveBeenCalledWith({ pathname: guardianKindergartenNoPetContent.petRegisterPath });
  });

  test('유치원이 없으면 유치원 탭이 선택된 빈 화면이다', () => {
    render(<GuardianKindergartenEmptyState />);

    expectKindergartenTab();
    expect(screen.queryByRole('button', { name: guardianKindergartenNoPetContent.ctaLabel })).toBeNull();
  });

  test('승인 전에는 유치원 탭과 신청한 유치원 카드를 보여 준다', () => {
    render(<GuardianKindergartenPendingState kindergarten={kindergarten} />);

    expectKindergartenTab();
    expect(screen.getByText('유치원 카드')).toBeTruthy();
  });
});
