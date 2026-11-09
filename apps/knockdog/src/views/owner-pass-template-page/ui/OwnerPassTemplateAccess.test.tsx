// @vitest-environment jsdom
import { cleanup, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import PassTemplatesLayout from '../../../../app/(stack)/mypage/pass-templates/layout';
import { renderWithQueryClient } from '../lib/renderWithQueryClient';
import { OwnerPassTemplateFormPage } from './OwnerPassTemplateFormPage';
import { OwnerPassTemplateListPage } from './OwnerPassTemplateListPage';

const replace = vi.fn();

vi.mock('next/navigation', () => ({ useParams: () => ({ id: '12' }) }));
vi.mock('@entities/owner-pass-template/api/ownerPassTemplate', () => ({
  getOwnerPassTemplates: vi.fn(() => new Promise(() => {})),
  postOwnerPassTemplate: vi.fn(),
  putOwnerPassTemplate: vi.fn(),
  deleteOwnerPassTemplate: vi.fn(),
}));
vi.mock('@features/role-conversion/model/useOwnerRole', () => ({
  useOwnerRole: () => ({ isOwner: false, isResolved: true, isError: false, isFetching: false, refetch: vi.fn() }),
}));
vi.mock('@shared/ui/private-access', () => ({ useRequireAuth: () => true }));
vi.mock('@shared/lib/bridge', async () => ({
  useStackNavigation: () => ({ push: vi.fn(), back: vi.fn(), replace }),
  useNativeBackHandler: (await import('@shared/lib/bridge/useNativeBackHandler')).useNativeBackHandler,
}));
vi.mock('@widgets/Header', () => {
  const Slot = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  return { Header: Object.assign(Slot, { LeftSection: Slot, RightSection: Slot, Title: Slot, BackButton: Slot }) };
});
vi.mock('@shared/ui/loading-spinner/ui/LoadingSpinner', () => ({ LoadingSpinner: () => null }));

describe('원장 전용 접근', () => {
  beforeEach(() => {
    replace.mockReset();
    replace.mockResolvedValue(undefined);
  });
  afterEach(cleanup);

  test('원장이 아닌 사용자가 목록 화면(`/mypage/pass-templates`)에 들어오면 `/mypage`로 이동한다', async () => {
    renderWithQueryClient(
      <PassTemplatesLayout>
        <OwnerPassTemplateListPage />
      </PassTemplatesLayout>
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith({ pathname: '/mypage' }));
    expect(screen.queryByRole('button', { name: '이용권 등록하기' })).toBeNull();
  });

  test('원장이 아닌 사용자가 등록 화면(`/mypage/pass-templates/create`)에 들어오면 `/mypage`로 이동한다', async () => {
    renderWithQueryClient(
      <PassTemplatesLayout>
        <OwnerPassTemplateFormPage mode='create' />
      </PassTemplatesLayout>
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith({ pathname: '/mypage' }));
    expect(screen.queryByRole('button', { name: '등록하기' })).toBeNull();
  });

  test('원장이 아닌 사용자가 수정 화면(`/mypage/pass-templates/[id]`)에 들어오면 `/mypage`로 이동한다', async () => {
    renderWithQueryClient(
      <PassTemplatesLayout>
        <OwnerPassTemplateFormPage mode='edit' />
      </PassTemplatesLayout>
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith({ pathname: '/mypage' }));
    expect(screen.queryByRole('button', { name: '등록하기' })).toBeNull();
  });
});
