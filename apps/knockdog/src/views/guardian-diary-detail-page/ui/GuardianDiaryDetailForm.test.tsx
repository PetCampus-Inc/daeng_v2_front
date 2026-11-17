// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { GuardianDiaryDetailForm, type GuardianDiaryDetailFormProps } from './GuardianDiaryDetailForm';

function renderForm(override: Partial<GuardianDiaryDetailFormProps> = {}) {
  const props: GuardianDiaryDetailFormProps = {
    dateLabel: '2026년 6월 16일 화요일',
    photos: ['/images/diary-sample/leaf.png'],
    body: '오늘은 낙엽을 밟았어',
    isEditing: false,
    isMenuOpen: false,
    isDeleteOpen: false,
    onBack: vi.fn(),
    onMenu: vi.fn(),
    onCloseMenu: vi.fn(),
    onEdit: vi.fn(),
    onBodyChange: vi.fn(),
    onSave: vi.fn(),
    onAskDelete: vi.fn(),
    onCancelDelete: vi.fn(),
    onDelete: vi.fn(),
    ...override,
  };
  render(<GuardianDiaryDetailForm {...props} />);
  return props;
}

describe('일기 상세', () => {
  afterEach(() => {
    cleanup();
  });

  test('날짜와 본문을 보여 주고 더보기를 연다', () => {
    const props = renderForm();

    expect(screen.getByRole('heading', { name: '일기장' })).toBeTruthy();
    expect(screen.getByText('2026년 6월 16일 화요일')).toBeTruthy();
    expect(screen.getByText('오늘은 낙엽을 밟았어')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '더보기' }));
    expect(props.onMenu).toHaveBeenCalledTimes(1);
  });

  test('더보기에서 수정과 삭제를 고른다', () => {
    const props = renderForm({ isMenuOpen: true });

    fireEvent.click(screen.getByRole('button', { name: '수정하기' }));
    expect(props.onEdit).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: '삭제하기' }));
    expect(props.onAskDelete).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: '메뉴 닫기' }));
    expect(props.onCloseMenu).toHaveBeenCalledTimes(1);
  });

  test('수정 중에는 본문을 고치고 저장한다', () => {
    const props = renderForm({ isEditing: true });
    const field = screen.getByRole('textbox') as HTMLTextAreaElement;

    expect(field.value).toBe('오늘은 낙엽을 밟았어');
    fireEvent.change(field, { target: { value: '고친 일기' } });
    expect(props.onBodyChange).toHaveBeenCalledWith('고친 일기');

    fireEvent.click(screen.getByRole('button', { name: '저장하기' }));
    expect(props.onSave).toHaveBeenCalledTimes(1);
  });

  test('삭제는 닫기와 삭제하기로 나눈다', () => {
    const props = renderForm({ isDeleteOpen: true });

    expect(screen.getByText('이 일기를 삭제할까요?')).toBeTruthy();
    expect(screen.getByText(/다시 만들면 오늘 남은 횟수가 1번 줄어요/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(props.onCancelDelete).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: '삭제하기' }));
    expect(props.onDelete).toHaveBeenCalledTimes(1);
  });
});
