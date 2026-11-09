// @vitest-environment jsdom
import { act, cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { ownerPassTemplateContent } from '../config/ownerPassTemplateContent';
import { renderWithQueryClient } from '../lib/renderWithQueryClient';
import { OwnerPassTemplateListPage } from './OwnerPassTemplateListPage';

import { getOwnerPassTemplates } from '@entities/owner-pass-template/api/ownerPassTemplate';

const push = vi.fn();

vi.mock('@entities/owner-pass-template/api/ownerPassTemplate', () => ({
  getOwnerPassTemplates: vi.fn(),
}));
vi.mock('@shared/lib/bridge', () => ({
  useStackNavigation: () => ({ push, back: vi.fn(), replace: vi.fn() }),
  useNativeBackHandler: vi.fn(),
}));
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
vi.mock('@shared/ui/loading-spinner/ui/LoadingSpinner', () => ({
  LoadingSpinner: () => <div role='status' />,
}));
vi.mock('next/image', () => ({ default: () => null }));

const mockedGetTemplates = vi.mocked(getOwnerPassTemplates);

const templatesDto = {
  templates: [
    { id: 11, name: '체험 등원(1회권)', chargeCount: 1, validityValue: null, validityUnit: null },
    { id: 12, name: '정기권 10회', chargeCount: 10, validityValue: 1, validityUnit: 'MONTH' as const },
    { id: 13, name: '가나다 5회', chargeCount: 5, validityValue: 80, validityUnit: 'DAY' as const },
  ],
};

describe('목록 조회 화면', () => {
  beforeEach(() => {
    push.mockReset();
    mockedGetTemplates.mockReset();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  test('템플릿이 있으면 서버가 준 순서 그대로 카드를 보여 준다', async () => {
    mockedGetTemplates.mockResolvedValue(templatesDto);
    renderWithQueryClient(<OwnerPassTemplateListPage />);

    const cards = await screen.findAllByRole('listitem');
    expect(cards.map((card) => card.textContent)).toEqual([
      expect.stringContaining('체험 등원(1회권)'),
      expect.stringContaining('정기권 10회'),
      expect.stringContaining('가나다 5회'),
    ]);
  });

  test('템플릿이 0개면 `아직 등록된 이용권이 없어요`와 `자주 사용하는 이용권을 등록할 수 있어요.`를 보여 준다', async () => {
    mockedGetTemplates.mockResolvedValue({ templates: [] });
    renderWithQueryClient(<OwnerPassTemplateListPage />);

    expect(await screen.findByText(ownerPassTemplateContent.emptyTitle)).toBeTruthy();
    expect(screen.getByText(ownerPassTemplateContent.emptyDescription)).toBeTruthy();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  test('목록 조회가 250ms 넘게 걸리면 Header를 유지한 채 콘텐츠 영역에 Spinner를 보여 준다', async () => {
    vi.useFakeTimers();
    mockedGetTemplates.mockReturnValue(new Promise(() => {}));
    renderWithQueryClient(<OwnerPassTemplateListPage />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.getByRole('button', { name: '뒤로' })).toBeTruthy();
  });

  test('목록 조회가 250ms 안에 끝나면 Spinner를 보여 주지 않는다', async () => {
    vi.useFakeTimers();
    mockedGetTemplates.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(templatesDto), 100))
    );
    renderWithQueryClient(<OwnerPassTemplateListPage />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(screen.queryByRole('status')).toBeNull();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  test('목록 조회가 실패하면 빈 상태 대신 `정보를 불러오지 못했어요`, `잠시 후 다시 시도해 주세요.`, `다시 시도하기`를 보여 준다', async () => {
    mockedGetTemplates.mockRejectedValue(new Error('network'));
    renderWithQueryClient(<OwnerPassTemplateListPage />);

    expect(await screen.findByRole('button', { name: '다시 시도하기' })).toBeTruthy();
    expect(screen.getByText('정보를 불러오지 못했어요')).toBeTruthy();
    expect(screen.getByText('잠시 후 다시 시도해 주세요.')).toBeTruthy();
    expect(screen.queryByText(ownerPassTemplateContent.emptyTitle)).toBeNull();
  });

  test('조회 실패 후 `다시 시도하기`를 누르면 목록을 다시 불러와 보여 준다', async () => {
    mockedGetTemplates.mockRejectedValueOnce(new Error('network')).mockResolvedValue(templatesDto);
    renderWithQueryClient(<OwnerPassTemplateListPage />);

    await userEvent.click(await screen.findByRole('button', { name: '다시 시도하기' }));

    expect(await screen.findAllByRole('listitem')).toHaveLength(3);
    expect(screen.queryByRole('button', { name: '다시 시도하기' })).toBeNull();
  });

  test('재조회 중에는 `다시 시도하기`를 다시 눌러도 요청이 추가로 나가지 않는다', async () => {
    mockedGetTemplates
      .mockRejectedValueOnce(new Error('network'))
      .mockReturnValue(new Promise(() => {}));
    renderWithQueryClient(<OwnerPassTemplateListPage />);

    const retryButton = await screen.findByRole('button', { name: '다시 시도하기' });
    await userEvent.click(retryButton);
    await waitFor(() => expect(mockedGetTemplates).toHaveBeenCalledTimes(2));
    await userEvent.click(retryButton);
    await userEvent.click(retryButton);

    expect(mockedGetTemplates).toHaveBeenCalledTimes(2);
  });

  test('조회 실패 후 사용자가 `다시 시도하기`를 누르기 전에는 다시 요청하지 않는다', async () => {
    vi.useFakeTimers();
    mockedGetTemplates.mockRejectedValue(new Error('network'));
    renderWithQueryClient(<OwnerPassTemplateListPage />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });

    expect(mockedGetTemplates).toHaveBeenCalledTimes(1);
  });

  test('카드를 누르면 해당 템플릿의 수정 화면(`/mypage/pass-templates/[id]`)으로 이동한다', async () => {
    mockedGetTemplates.mockResolvedValue(templatesDto);
    renderWithQueryClient(<OwnerPassTemplateListPage />);

    await userEvent.click(await screen.findByRole('button', { name: /정기권 10회/ }));

    expect(push).toHaveBeenCalledWith({ pathname: '/mypage/pass-templates/12' });
  });

  test('목록 화면과 빈 상태 화면에서 `이용권 등록하기`를 누르면 등록 화면으로 이동한다', async () => {
    mockedGetTemplates.mockResolvedValue(templatesDto);
    const { unmount } = renderWithQueryClient(<OwnerPassTemplateListPage />);
    await userEvent.click(await screen.findByRole('button', { name: ownerPassTemplateContent.createButtonLabel }));
    expect(push).toHaveBeenLastCalledWith({ pathname: '/mypage/pass-templates/create' });
    unmount();

    mockedGetTemplates.mockResolvedValue({ templates: [] });
    renderWithQueryClient(<OwnerPassTemplateListPage />);
    await screen.findByText(ownerPassTemplateContent.emptyTitle);
    await userEvent.click(screen.getByRole('button', { name: ownerPassTemplateContent.createButtonLabel }));
    expect(push).toHaveBeenCalledTimes(2);
    expect(push).toHaveBeenLastCalledWith({ pathname: '/mypage/pass-templates/create' });
  });
});
