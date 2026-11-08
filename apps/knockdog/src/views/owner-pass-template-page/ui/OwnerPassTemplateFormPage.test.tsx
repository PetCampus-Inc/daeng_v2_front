// @vitest-environment jsdom
import { act, cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { ownerPassTemplateContent } from '../config/ownerPassTemplateContent';
import { renderWithQueryClient } from '../lib/renderWithQueryClient';
import { OwnerPassTemplateFormPage } from './OwnerPassTemplateFormPage';
import { OwnerPassTemplateListPage } from './OwnerPassTemplateListPage';

import { OverlayProvider } from '@app/providers/OverlayProvider';
import {
  deleteOwnerPassTemplate,
  getOwnerPassTemplates,
  postOwnerPassTemplate,
  putOwnerPassTemplate,
} from '@entities/owner-pass-template/api/ownerPassTemplate';
import { ApiError } from '@shared/api/model/error';
import { NATIVE_BACK_EVENT } from '@shared/lib/bridge/useNativeBackHandler';
import { markUnsavedExitDialogClosed } from '@shared/lib/openUnsavedExitDialog';
import { toast } from '@shared/ui/toast';

const navigation = { push: vi.fn(), back: vi.fn(), replace: vi.fn() };
let routeParams: { id?: string } = {};

vi.mock('next/navigation', () => ({ useParams: () => routeParams }));
vi.mock('@entities/owner-pass-template/api/ownerPassTemplate', () => ({
  getOwnerPassTemplates: vi.fn(),
  postOwnerPassTemplate: vi.fn(),
  putOwnerPassTemplate: vi.fn(),
  deleteOwnerPassTemplate: vi.fn(),
}));
vi.mock('@shared/lib/bridge', async () => ({
  useStackNavigation: () => navigation,
  useNativeBackHandler: (await import('@shared/lib/bridge/useNativeBackHandler')).useNativeBackHandler,
}));
vi.mock('@shared/ui/toast', () => ({ toast: vi.fn() }));
vi.mock('@widgets/Header', () => {
  const Slot = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  const Header = Object.assign(Slot, {
    LeftSection: Slot,
    RightSection: Slot,
    Title: Slot,
    BackButton: ({ onClick }: { onClick?: () => void }) => (
      <button type='button' onClick={onClick}>
        뒤로
      </button>
    ),
  });
  return { Header };
});
vi.mock('@shared/ui/loading-spinner/ui/LoadingSpinner', () => ({
  LoadingSpinner: () => <div role='status' />,
}));
vi.mock('next/image', () => ({ default: () => null }));

const mockedGet = vi.mocked(getOwnerPassTemplates);
const mockedPost = vi.mocked(postOwnerPassTemplate);
const mockedPut = vi.mocked(putOwnerPassTemplate);
const mockedDelete = vi.mocked(deleteOwnerPassTemplate);
const mockedToast = vi.mocked(toast);

const LIST_PATH = '/mypage/pass-templates';
const savedDto = { id: 12, name: '정기권', chargeCount: 10, validityValue: 80, validityUnit: 'DAY' as const };
const duplicateError = () => new ApiError(409, 'TICKET_TEMPLATE-409-1', '중복');

function renderForm(mode: 'create' | 'edit', ui = <OwnerPassTemplateFormPage mode={mode} />) {
  routeParams = mode === 'edit' ? { id: '12' } : {};
  return renderWithQueryClient(<OverlayProvider>{ui}</OverlayProvider>);
}

const nameInput = () => screen.getByLabelText(new RegExp(ownerPassTemplateContent.nameLabel));
const chargeInput = () => screen.getByLabelText(new RegExp(ownerPassTemplateContent.chargeCountLabel));
const submitButton = () => screen.getByRole('button', { name: ownerPassTemplateContent.submitButtonLabel });
const backButton = () => screen.getByRole('button', { name: '뒤로' });
const chip = (label: string) => screen.getByRole('button', { name: label });

/** 등록 화면에서 이름·충전 횟수·`3개월` 칩을 채운다. */
async function fillValidCreateForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(nameInput(), '  체험   등원 ');
  await user.type(chargeInput(), '5');
  await user.click(chip('3개월'));
}

async function renderEdit() {
  mockedGet.mockResolvedValue({ templates: [savedDto] });
  const view = renderForm('edit');
  await screen.findByDisplayValue('정기권');
  return view;
}

beforeEach(() => {
  Object.values(navigation).forEach((fn) => fn.mockReset());
  [mockedGet, mockedPost, mockedPut, mockedDelete, mockedToast].forEach((fn) => fn.mockReset());
  window.history.replaceState(null, '', '/');
});
afterEach(() => {
  cleanup();
  markUnsavedExitDialogClosed();
  vi.useRealTimers();
});

describe('이름 입력', () => {
  test('이름을 50자 넘게 입력하면 51번째 글자부터 입력되지 않는다', async () => {
    const user = userEvent.setup();
    renderForm('create');

    await user.type(nameInput(), 'a'.repeat(60));

    expect((nameInput() as HTMLInputElement).value).toBe('a'.repeat(50));
  });

  test('이름을 입력하면 글자 수가 `n/50`으로 바뀐다', async () => {
    const user = userEvent.setup();
    renderForm('create');
    expect(screen.getByText('0/50')).toBeTruthy();

    await user.type(nameInput(), '체험등원');

    expect(screen.getByText('4/50')).toBeTruthy();
  });
});

describe('충전 횟수 입력', () => {
  test('범위를 벗어난 충전 횟수를 입력하고 필드를 벗어나면 `충전 횟수는 1~1000회 사이로 입력해 주세요.`가 보이고 CTA가 비활성화된다', async () => {
    const user = userEvent.setup();
    renderForm('create');
    await user.type(nameInput(), '정기권');
    await user.click(chip('만료 없음'));

    await user.type(chargeInput(), '1001');
    await user.tab();

    expect(screen.getByText(ownerPassTemplateContent.chargeCountError)).toBeTruthy();
    expect((submitButton() as HTMLButtonElement).disabled).toBe(true);
  });

  test('충전 횟수 오류가 보이는 상태에서 올바른 값으로 고치면 오류가 바로 사라진다', async () => {
    const user = userEvent.setup();
    renderForm('create');
    await user.type(chargeInput(), '0');
    await user.tab();
    expect(screen.getByText(ownerPassTemplateContent.chargeCountError)).toBeTruthy();

    await user.clear(chargeInput());
    await user.type(chargeInput(), '10');

    expect(screen.queryByText(ownerPassTemplateContent.chargeCountError)).toBeNull();
  });
});

describe('유효기간 선택', () => {
  test('신규 등록 화면에 처음 들어오면 아무 기간 칩도 선택돼 있지 않고 직접 입력 필드도 보이지 않는다', () => {
    renderForm('create');

    ['만료 없음', '1개월', '3개월', '6개월', '12개월', '직접 입력'].forEach((label) => {
      expect(chip(label).getAttribute('aria-pressed')).toBe('false');
    });
    expect(screen.queryByPlaceholderText('1~99')).toBeNull();
  });

  test('`직접 입력`을 누르면 숫자 필드와 `일`·`개월` 선택이 보인다', async () => {
    const user = userEvent.setup();
    renderForm('create');

    await user.click(chip('직접 입력'));

    expect(screen.getByPlaceholderText('1~99')).toBeTruthy();
    expect(screen.getByRole('button', { name: '일' })).toBeTruthy();
    expect(screen.getAllByRole('button', { name: '개월' })).toHaveLength(1);
  });

  test('직접 입력 상태에서 다른 기간 칩을 누르면 직접 입력 필드가 사라진다', async () => {
    const user = userEvent.setup();
    renderForm('create');
    await user.click(chip('직접 입력'));

    await user.click(chip('6개월'));

    expect(screen.queryByPlaceholderText('1~99')).toBeNull();
  });
});

describe('등록', () => {
  test('이름·충전 횟수·유효기간이 모두 유효할 때만 `등록하기`가 활성화된다', async () => {
    const user = userEvent.setup();
    renderForm('create');
    const isDisabled = () => (submitButton() as HTMLButtonElement).disabled;
    expect(isDisabled()).toBe(true);

    await user.type(nameInput(), '정기권');
    await user.type(chargeInput(), '5');
    expect(isDisabled()).toBe(true);

    await user.click(chip('3개월'));
    expect(isDisabled()).toBe(false);

    await user.clear(nameInput());
    expect(isDisabled()).toBe(true);
  });

  test('`등록하기`를 누르면 이름 앞뒤 공백과 연속 공백을 정리한 값으로 등록 요청을 보낸다', async () => {
    const user = userEvent.setup();
    mockedPost.mockResolvedValue(savedDto);
    renderForm('create');
    await fillValidCreateForm(user);

    await user.click(submitButton());

    expect(mockedPost).toHaveBeenCalledWith({
      name: '체험 등원',
      chargeCount: 5,
      validityValue: 3,
      validityUnit: 'MONTH',
    });
  });

  test('등록 요청 중에는 `등록하기`가 비활성화돼 다시 눌러도 요청이 한 번만 나간다', async () => {
    const user = userEvent.setup();
    mockedPost.mockReturnValue(new Promise(() => {}));
    renderForm('create');
    await fillValidCreateForm(user);

    await user.click(submitButton());
    await user.click(submitButton());

    expect(mockedPost).toHaveBeenCalledTimes(1);
    expect((submitButton() as HTMLButtonElement).disabled).toBe(true);
  });

  test('등록 요청이 250ms 넘게 걸리면 CTA에 Spinner가 보인다', async () => {
    const user = userEvent.setup();
    mockedPost.mockReturnValue(new Promise(() => {}));
    renderForm('create');
    await fillValidCreateForm(user);

    vi.useFakeTimers();
    fireEvent.click(submitButton());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(screen.queryByRole('status')).toBeNull();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(screen.getByRole('status')).toBeTruthy();
  });

  test('등록에 성공하면 목록으로 돌아가 `이용권이 등록됐어요` 토스트를 보여 준다', async () => {
    const user = userEvent.setup();
    mockedPost.mockResolvedValue(savedDto);
    renderForm('create');
    await fillValidCreateForm(user);

    await user.click(submitButton());

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith({ pathname: LIST_PATH }));
    expect(mockedToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));
  });

  test('서버가 `TICKET_TEMPLATE-409-1`을 주면 이름 아래 `이미 같은 이름의 템플릿이 있어요.`가 보이고 입력값은 유지되며 CTA가 비활성화된다', async () => {
    const user = userEvent.setup();
    mockedPost.mockRejectedValue(duplicateError());
    renderForm('create');
    await fillValidCreateForm(user);

    await user.click(submitButton());

    expect(await screen.findByText(ownerPassTemplateContent.duplicateNameError)).toBeTruthy();
    expect((nameInput() as HTMLInputElement).value).toBe('  체험   등원 ');
    expect((chargeInput() as HTMLInputElement).value).toBe('5');
    expect((submitButton() as HTMLButtonElement).disabled).toBe(true);
  });

  test('이름 중복 오류가 보이는 상태에서 이름을 바꾸면 오류가 사라지고 CTA가 다시 활성화된다', async () => {
    const user = userEvent.setup();
    mockedPost.mockRejectedValue(duplicateError());
    renderForm('create');
    await fillValidCreateForm(user);
    await user.click(submitButton());
    await screen.findByText(ownerPassTemplateContent.duplicateNameError);

    await user.type(nameInput(), '2');

    expect(screen.queryByText(ownerPassTemplateContent.duplicateNameError)).toBeNull();
    expect((submitButton() as HTMLButtonElement).disabled).toBe(false);
  });

  test('그 밖의 이유로 등록에 실패하면 화면과 입력값을 유지하고 `이용권을 등록하지 못했어요` 토스트를 보여 준 뒤 CTA를 다시 활성화한다', async () => {
    const user = userEvent.setup();
    mockedPost.mockRejectedValue(new ApiError(500, 'UNKNOWN_ERROR', '실패'));
    renderForm('create');
    await fillValidCreateForm(user);

    await user.click(submitButton());

    await waitFor(() => expect(mockedToast).toHaveBeenCalledTimes(1));
    expect(navigation.replace).not.toHaveBeenCalled();
    expect((chargeInput() as HTMLInputElement).value).toBe('5');
    expect(screen.queryByText(ownerPassTemplateContent.duplicateNameError)).toBeNull();
    await waitFor(() => expect((submitButton() as HTMLButtonElement).disabled).toBe(false));
  });
});

describe('수정', () => {
  test('수정 화면에 들어오면 헤더에 템플릿 이름이, 입력란에 기존 값이, 오른쪽 위에 삭제 아이콘이 보인다', async () => {
    await renderEdit();

    expect(screen.getAllByText('정기권').length).toBeGreaterThan(0);
    expect((nameInput() as HTMLInputElement).value).toBe('정기권');
    expect((chargeInput() as HTMLInputElement).value).toBe('10');
    expect(screen.getByDisplayValue('80')).toBeTruthy();
    expect(chip('직접 입력').getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: '이용권 삭제' })).toBeTruthy();
  });

  test('기존 값에서 바뀐 것이 없으면 CTA가 비활성화돼 있다', async () => {
    await renderEdit();

    expect((submitButton() as HTMLButtonElement).disabled).toBe(true);
  });

  test('값을 바꿨다가 원래 값으로 되돌리면 CTA가 다시 비활성화된다', async () => {
    const user = userEvent.setup();
    await renderEdit();

    await user.type(nameInput(), '2');
    expect((submitButton() as HTMLButtonElement).disabled).toBe(false);
    await user.type(nameInput(), '{Backspace}');

    expect((submitButton() as HTMLButtonElement).disabled).toBe(true);
  });

  test('유효한 값으로 바꾸면 CTA가 활성화되고, 바뀐 값이 유효하지 않으면 비활성화된다', async () => {
    const user = userEvent.setup();
    await renderEdit();

    await user.clear(chargeInput());
    await user.type(chargeInput(), '20');
    expect((submitButton() as HTMLButtonElement).disabled).toBe(false);

    await user.clear(chargeInput());
    await user.type(chargeInput(), '0');
    expect((submitButton() as HTMLButtonElement).disabled).toBe(true);
  });

  test('수정 화면에서 템플릿 정보를 불러오지 못하면 Header를 유지한 채 `정보를 불러오지 못했어요`, `잠시 후 다시 시도해 주세요.`, `다시 시도하기`를 보여 준다', async () => {
    mockedGet.mockRejectedValue(new Error('network'));
    renderForm('edit');

    expect(await screen.findByRole('button', { name: '다시 시도하기' })).toBeTruthy();
    expect(screen.getByText('정보를 불러오지 못했어요')).toBeTruthy();
    expect(screen.getByText('잠시 후 다시 시도해 주세요.')).toBeTruthy();
    expect(backButton()).toBeTruthy();
  });

  test('목록에 해당 ID의 템플릿이 없으면 이용권 목록 화면으로 이동하고 `이용권을 찾을 수 없어요` 토스트를 보여 준다', async () => {
    mockedGet.mockResolvedValue({ templates: [{ ...savedDto, id: 99 }] });
    renderForm('edit');

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith({ pathname: LIST_PATH }));
    expect(mockedToast).toHaveBeenCalledTimes(1);
  });

  test('저장 요청 중에는 CTA가 비활성화돼 다시 눌러도 요청이 한 번만 나간다', async () => {
    const user = userEvent.setup();
    mockedPut.mockReturnValue(new Promise(() => {}));
    await renderEdit();
    await user.type(nameInput(), '2');

    await user.click(submitButton());
    await user.click(submitButton());

    expect(mockedPut).toHaveBeenCalledTimes(1);
    expect((submitButton() as HTMLButtonElement).disabled).toBe(true);
  });

  test('저장에 성공하면 목록으로 돌아가 `이용권을 저장했어요` 토스트를 보여 준다', async () => {
    const user = userEvent.setup();
    mockedPut.mockResolvedValue(savedDto);
    await renderEdit();
    await user.type(nameInput(), '2');

    await user.click(submitButton());

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith({ pathname: LIST_PATH }));
    expect(mockedPut).toHaveBeenCalledWith('12', expect.objectContaining({ name: '정기권2', chargeCount: 10 }));
    expect(mockedToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));
  });

  test('수정 중 서버가 `TICKET_TEMPLATE-409-1`을 주면 이름 아래 중복 문구를 보여 주고 입력값을 유지한다', async () => {
    const user = userEvent.setup();
    mockedPut.mockRejectedValue(duplicateError());
    await renderEdit();
    await user.type(nameInput(), '2');

    await user.click(submitButton());

    expect(await screen.findByText(ownerPassTemplateContent.duplicateNameError)).toBeTruthy();
    expect((nameInput() as HTMLInputElement).value).toBe('정기권2');
  });

  test('그 밖의 이유로 저장에 실패하면 화면과 입력값을 유지하고 `이용권을 저장하지 못했어요` 토스트를 보여 준 뒤 CTA를 다시 활성화한다', async () => {
    const user = userEvent.setup();
    mockedPut.mockRejectedValue(new ApiError(500, 'UNKNOWN_ERROR', '실패'));
    await renderEdit();
    await user.type(nameInput(), '2');

    await user.click(submitButton());

    await waitFor(() => expect(mockedToast).toHaveBeenCalledTimes(1));
    expect(navigation.replace).not.toHaveBeenCalled();
    expect((nameInput() as HTMLInputElement).value).toBe('정기권2');
    await waitFor(() => expect((submitButton() as HTMLButtonElement).disabled).toBe(false));
  });
});

describe('삭제', () => {
  const openDeleteDialog = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole('button', { name: '이용권 삭제' }));
    return screen.findByRole('alertdialog');
  };

  test('삭제 아이콘을 누르면 `이용권을 삭제할까요?`, `이미 충전한 이용권은 그대로 사용할 수 있어요`, `닫기`, `삭제하기` 모달이 보인다', async () => {
    const user = userEvent.setup();
    await renderEdit();

    const dialog = await openDeleteDialog(user);

    expect(within(dialog).getByText(ownerPassTemplateContent.deleteTitle)).toBeTruthy();
    expect(within(dialog).getByText(ownerPassTemplateContent.deleteDescription)).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: '닫기' })).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: '삭제하기' })).toBeTruthy();
  });

  test('모달에서 `닫기`를 누르면 모달만 닫히고 수정 화면과 입력값이 그대로 남는다', async () => {
    const user = userEvent.setup();
    await renderEdit();
    await user.type(nameInput(), '2');
    const dialog = await openDeleteDialog(user);

    await user.click(within(dialog).getByRole('button', { name: '닫기' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect((nameInput() as HTMLInputElement).value).toBe('정기권2');
    expect(mockedDelete).not.toHaveBeenCalled();
  });

  test('삭제 요청 중에는 `삭제하기`를 다시 눌러도 요청이 한 번만 나간다', async () => {
    const user = userEvent.setup();
    mockedDelete.mockReturnValue(new Promise(() => {}));
    await renderEdit();
    const dialog = await openDeleteDialog(user);
    const confirmButton = within(dialog).getByRole('button', { name: '삭제하기' });

    await user.click(confirmButton);
    await user.click(confirmButton);

    expect(mockedDelete).toHaveBeenCalledTimes(1);
  });

  test('삭제에 성공하면 목록으로 돌아가 해당 항목이 빠지고 `이용권을 삭제했어요` 토스트를 보여 준다', async () => {
    const user = userEvent.setup();
    const other = { ...savedDto, id: 13, name: '남는 이용권' };
    mockedGet.mockResolvedValueOnce({ templates: [savedDto, other] }).mockResolvedValue({ templates: [other] });
    mockedDelete.mockResolvedValue(undefined);
    routeParams = { id: '12' };
    renderWithQueryClient(
      <OverlayProvider>
        <OwnerPassTemplateListPage />
        <OwnerPassTemplateFormPage mode='edit' />
      </OverlayProvider>
    );
    await screen.findAllByDisplayValue('정기권');
    const dialog = await openDeleteDialog(user);

    await user.click(within(dialog).getByRole('button', { name: '삭제하기' }));

    expect(mockedDelete).toHaveBeenCalledWith('12');
    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith({ pathname: LIST_PATH }));
    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(1));
    // 삭제 뒤 목록이 갱신돼도 `찾을 수 없어요` 토스트·이동이 한 번 더 나오지 않는다
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(mockedToast).toHaveBeenCalledTimes(1);
    expect(mockedToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));
    expect(navigation.replace).toHaveBeenCalledTimes(1);
  });

  test('삭제에 성공하면 목록 갱신이 끝나기 전에도 바로 목록으로 이동해 `이용권을 삭제했어요` 토스트를 보여 준다', async () => {
    const user = userEvent.setup();
    mockedDelete.mockResolvedValue(undefined);
    await renderEdit();
    mockedGet.mockReturnValue(new Promise(() => {}));
    const dialog = await openDeleteDialog(user);

    await user.click(within(dialog).getByRole('button', { name: '삭제하기' }));

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith({ pathname: LIST_PATH }));
    expect(mockedToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));
  });

  test('마지막 남은 템플릿(기본 템플릿 포함)을 삭제하면 목록이 빈 상태로 보인다', async () => {
    const user = userEvent.setup();
    mockedGet.mockResolvedValueOnce({ templates: [savedDto] }).mockResolvedValue({ templates: [] });
    mockedDelete.mockResolvedValue(undefined);
    routeParams = { id: '12' };
    renderWithQueryClient(
      <OverlayProvider>
        <OwnerPassTemplateListPage />
        <OwnerPassTemplateFormPage mode='edit' />
      </OverlayProvider>
    );
    await screen.findAllByDisplayValue('정기권');
    const dialog = await openDeleteDialog(user);

    await user.click(within(dialog).getByRole('button', { name: '삭제하기' }));

    expect(await screen.findByText(ownerPassTemplateContent.emptyTitle)).toBeTruthy();
    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith({ pathname: LIST_PATH }));
  });

  test('삭제에 실패하면 모달을 닫고 수정 화면과 입력값을 유지하며 `이용권을 삭제하지 못했어요` 토스트를 보여 준다', async () => {
    const user = userEvent.setup();
    mockedDelete.mockRejectedValue(new ApiError(500, 'UNKNOWN_ERROR', '실패'));
    await renderEdit();
    await user.type(nameInput(), '2');
    const dialog = await openDeleteDialog(user);

    await user.click(within(dialog).getByRole('button', { name: '삭제하기' }));

    await waitFor(() => expect(mockedToast).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(navigation.replace).not.toHaveBeenCalled();
    expect((nameInput() as HTMLInputElement).value).toBe('정기권2');
  });
});

describe('뒤로가기와 작성 중 이탈', () => {
  const exitDialog = () => screen.findByRole('alertdialog');

  test('등록·수정 화면에서 바뀐 값 없이 뒤로가기를 하면 목록으로 이동한다', async () => {
    const user = userEvent.setup();
    renderForm('create');

    await user.click(backButton());

    expect(navigation.back).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  test('등록·수정 화면에서 값을 바꾼 뒤 뒤로가기를 하면 `이용권을 저장하지 않고 나갈까요?` 모달이 보인다', async () => {
    const user = userEvent.setup();
    renderForm('create');
    await user.type(nameInput(), '정기권');

    await user.click(backButton());

    const dialog = await exitDialog();
    expect(within(dialog).getByText(ownerPassTemplateContent.unsavedTitle)).toBeTruthy();
    expect(navigation.back).not.toHaveBeenCalled();
  });

  test('이탈 확인 모달에서 나가기를 고르면 저장하지 않고 목록으로 이동한다', async () => {
    const user = userEvent.setup();
    renderForm('create');
    await user.type(nameInput(), '정기권');
    await user.click(backButton());
    const dialog = await exitDialog();

    await user.click(within(dialog).getByRole('button', { name: '나가기' }));

    await waitFor(() => expect(navigation.back).toHaveBeenCalledTimes(1));
    expect(mockedPost).not.toHaveBeenCalled();
  });

  test('이탈 확인 모달에서 계속 작성을 고르면 화면과 입력값이 그대로 남는다', async () => {
    const user = userEvent.setup();
    renderForm('create');
    await user.type(nameInput(), '정기권');
    await user.click(backButton());
    const dialog = await exitDialog();

    await user.click(within(dialog).getByRole('button', { name: '닫기' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect((nameInput() as HTMLInputElement).value).toBe('정기권');
    expect(navigation.back).not.toHaveBeenCalled();
  });

  test('삭제 확인 모달이 열린 상태에서 뒤로가기를 하면 모달만 닫히고 수정 화면이 남는다', async () => {
    const user = userEvent.setup();
    await renderEdit();
    await user.click(screen.getByRole('button', { name: '이용권 삭제' }));
    await screen.findByRole('alertdialog');

    act(() => {
      window.dispatchEvent(new Event(NATIVE_BACK_EVENT, { cancelable: true }));
    });

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(navigation.back).not.toHaveBeenCalled();
    expect((nameInput() as HTMLInputElement).value).toBe('정기권');
  });

  test('브라우저 뒤로가기와 네이티브 뒤로가기도 상단 뒤로가기와 같은 순서(모달 닫기 → 이탈 확인 → 이전 화면)로 동작한다', async () => {
    const user = userEvent.setup();
    renderForm('create');
    await user.type(nameInput(), '정기권');

    // 네이티브 뒤로가기: 값이 바뀐 상태 → 이탈 확인 모달
    act(() => {
      window.dispatchEvent(new Event(NATIVE_BACK_EVENT, { cancelable: true }));
    });
    const nativeDialog = await exitDialog();
    await user.click(within(nativeDialog).getByRole('button', { name: '닫기' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());

    // 브라우저 뒤로가기: 같은 이탈 확인 모달
    act(() => {
      window.history.back();
    });
    const browserDialog = await exitDialog();
    expect(within(browserDialog).getByText(ownerPassTemplateContent.unsavedTitle)).toBeTruthy();
    expect(navigation.back).not.toHaveBeenCalled();
  });
});
