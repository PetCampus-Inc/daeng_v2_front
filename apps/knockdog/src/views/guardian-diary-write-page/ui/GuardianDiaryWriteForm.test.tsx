// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { DIARY_PROMPT_INTERVAL_MS } from '../lib/diaryWriteForm';
import { GuardianDiaryWriteForm, type GuardianDiaryWriteFormProps } from './GuardianDiaryWriteForm';

function renderForm(override: Partial<GuardianDiaryWriteFormProps> = {}) {
  const props: GuardianDiaryWriteFormProps = {
    dogName: '콩이',
    photos: [],
    text: '',
    isTextRequired: true,
    isImportVisible: false,
    importedNotice: null,
    onAddPhoto: vi.fn(),
    onRemovePhoto: vi.fn(),
    onTextChange: vi.fn(),
    onDismissImport: vi.fn(),
    onImportNotice: vi.fn(),
    onRemoveNotice: vi.fn(),
    onSubmit: vi.fn(),
    onBack: vi.fn(),
    ...override,
  };
  render(<GuardianDiaryWriteForm {...props} />);
  return props;
}

describe('일기 쓰기 화면', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  test('알림장이 없으면 사진과 글을 써야 일기를 만들 수 있다', () => {
    const props = renderForm();

    expect(screen.getByText(/사진을 올려주세요/).parentElement?.textContent).toContain('*');
    expect(document.querySelector('label[for="diary-write-text"]')?.textContent).toContain('*');
    expect(screen.getByPlaceholderText(/고구마 냄새/)).toBeTruthy();
    expect((screen.getByRole('button', { name: '일기 만들기' }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: '0/3' }));
    expect(props.onAddPhoto).toHaveBeenCalledTimes(1);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: `${'가'.repeat(301)}` } });
    expect(props.onTextChange).toHaveBeenCalledWith('가'.repeat(300));
  });

  test('사진과 글이 있으면 만들기를 누를 수 있다', () => {
    const props = renderForm({
      photos: [{ id: 'leaf', src: '/images/diary-sample/leaf.png' }],
      text: '낙엽을 밟았다',
    });

    const submit = screen.getByRole('button', { name: '일기 만들기' }) as HTMLButtonElement;
    expect(submit.disabled).toBe(false);
    fireEvent.click(submit);
    expect(props.onSubmit).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    expect(props.onRemovePhoto).toHaveBeenCalledWith('leaf');
  });

  test('알림장을 불러오면 글 없이 사진을 올리고 알림장 칸을 지울 수 있다', () => {
    const props = renderForm({
      isTextRequired: false,
      isImportVisible: false,
      photos: [{ id: 'leaf', src: '/images/diary-sample/leaf.png' }],
      importedNotice: { date: '2026년 6월 17일 수요일', body: '친구들과 운동장에서 뛰어놀았어요.' },
    });

    expect(document.querySelector('label[for="diary-write-text"]')?.textContent).not.toContain('*');
    expect(screen.getByText('친구들과 운동장에서 뛰어놀았어요.')).toBeTruthy();
    expect((screen.getByRole('button', { name: '일기 만들기' }) as HTMLButtonElement).disabled).toBe(false);

    const note = screen.getByText('친구들과 운동장에서 뛰어놀았어요.').closest('article');
    fireEvent.click(note?.querySelector('[aria-label="삭제"]') as Element);
    expect(props.onRemoveNotice).toHaveBeenCalledTimes(1);
  });

  test('알림장 배너에서 불러오기와 닫기를 구분한다', () => {
    const props = renderForm({ isImportVisible: true });

    expect(screen.getByText('AI가 오늘의 알림장을 읽고 콩이의 일기를 써줘요.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '불러오기' }));
    expect(props.onImportNotice).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(props.onDismissImport).toHaveBeenCalledTimes(1);
  });

  test('안내 문구는 3초마다 바뀐다', () => {
    vi.useFakeTimers();
    renderForm();

    expect(screen.getByText('콩이가 오늘 가장 기뻐했던 순간은 무엇인가요?')).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(DIARY_PROMPT_INTERVAL_MS);
    });
    expect(screen.getByText('콩이가 오늘 가장 맛있게 먹은 것은 뭔가요?')).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(DIARY_PROMPT_INTERVAL_MS);
    });
    expect(screen.getByText('콩이는 오늘 산책에서 무엇을 가장 좋아했나요?')).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(DIARY_PROMPT_INTERVAL_MS);
    });
    expect(screen.getByText('오늘 콩이를 보며 무슨 생각을 했나요?')).toBeTruthy();
  });

  test('사진은 3장까지만 추가할 수 있다', () => {
    renderForm({
      photos: [
        { id: '1', src: '/a.png' },
        { id: '2', src: '/b.png' },
        { id: '3', src: '/c.png' },
      ],
    });

    expect(screen.queryByRole('button', { name: '3/3' })).toBeNull();
    expect(screen.getAllByRole('button', { name: '삭제' })).toHaveLength(3);
  });
});
