// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { GuardianDiaryGenerateForm, type GuardianDiaryGenerateFormProps } from './GuardianDiaryGenerateForm';

function renderForm(override: Partial<GuardianDiaryGenerateFormProps> = {}) {
  const props: GuardianDiaryGenerateFormProps = {
    dogName: '콩이',
    dateLabel: '2026년 6월 17일 수요일',
    photos: ['/images/diary-sample/leaf.png'],
    status: 'generating',
    body: '',
    isEditing: false,
    isSaved: false,
    hasTriedLeave: false,
    dialog: null,
    onBack: vi.fn(),
    onRetry: vi.fn(),
    onEdit: vi.fn(),
    onBodyChange: vi.fn(),
    onSave: vi.fn(),
    onConfirmSave: vi.fn(),
    onKeepWriting: vi.fn(),
    onLeave: vi.fn(),
    ...override,
  };
  render(<GuardianDiaryGenerateForm {...props} />);
  return props;
}

describe('AI 일기 생성', () => {
  afterEach(() => {
    cleanup();
  });

  test('생성 중에는 로딩 문구와 비활성 버튼을 보여 준다', () => {
    const props = renderForm();

    expect(screen.getByText('2026년 6월 17일 수요일')).toBeTruthy();
    expect(screen.getByText('오늘 밟았던 풀밭 냄새를 떠올리는 중...')).toBeTruthy();
    expect((screen.getByRole('button', { name: '콩이가 열심히 일기를 쓰고 있어요' }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: '뒤로' }));
    expect(props.onBack).toHaveBeenCalledTimes(1);
  });

  test('생성 중에 나가려 하면 버튼만 아직으로 바뀐다', () => {
    renderForm({ hasTriedLeave: true });

    expect(screen.getByRole('button', { name: '콩이가 아직 일기를 쓰고 있어요' })).toBeTruthy();
    expect(screen.queryByText('일기 쓰기를 멈출까요?')).toBeNull();
  });

  test('생성 실패면 다시 시도할 수 있다', () => {
    const props = renderForm({ status: 'error' });

    expect(screen.getByText(/일시적 오류로 일기를 생성하지 못했어요/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '다시 시도하기' }));
    expect(props.onRetry).toHaveBeenCalledTimes(1);
  });

  test('생성이 끝나면 직접 수정하고 저장할 수 있다', () => {
    const props = renderForm({
      status: 'done',
      body: '오늘은 낙엽을 밟았어',
    });

    expect(screen.getByText('오늘은 낙엽을 밟았어')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '직접 수정' }));
    expect(props.onEdit).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: '저장하기' }));
    expect(props.onSave).toHaveBeenCalledTimes(1);
  });

  test('수정 중에는 본문을 고칠 수 있다', () => {
    const props = renderForm({
      status: 'done',
      body: '오늘은 낙엽을 밟았어',
      isEditing: true,
    });

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '오늘은 공원에 갔어' } });
    expect(props.onBodyChange).toHaveBeenCalledWith('오늘은 공원에 갔어');
    expect(screen.queryByRole('button', { name: '직접 수정' })).toBeNull();
    expect(screen.getByRole('textbox').className).toContain('border-line-700');
  });

  test('저장하지 않고 뒤로 가면 나가기 확인을 보여 준다', () => {
    const props = renderForm({ status: 'done', isEditing: true, dialog: 'leave', body: '오늘은 낙엽을 밟았어' });

    expect(screen.getByText('저장하지 않고 나갈까요?')).toBeTruthy();
    expect(screen.getByText(/남은 횟수는 1회 줄어요/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '계속 작성하기' }));
    expect(props.onKeepWriting).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: '나가기' }));
    expect(props.onLeave).toHaveBeenCalledTimes(1);
  });

  test('저장하기는 확인 후 저장한다', () => {
    const props = renderForm({ status: 'done', dialog: 'save', body: '오늘은 낙엽을 밟았어' });

    expect(screen.getByText('이대로 저장할까요?')).toBeTruthy();
    expect(screen.getByText(/내용은 나중에 직접 수정할 수 있어요/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '계속 작성하기' }));
    expect(props.onKeepWriting).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: '저장하기' }));
    expect(props.onConfirmSave).toHaveBeenCalledTimes(1);
  });

  test('저장이 끝나면 본문만 남긴다', () => {
    renderForm({ status: 'done', isSaved: true, body: '오늘은 낙엽을 밟았어' });

    expect(screen.getByText('오늘은 낙엽을 밟았어')).toBeTruthy();
    expect(screen.queryByRole('button', { name: '직접 수정' })).toBeNull();
    expect(screen.queryByRole('button', { name: '저장하기' })).toBeNull();
  });
});
