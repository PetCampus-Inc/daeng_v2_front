// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

vi.mock('@shared/ui/bottom-sheet', async () => ({
  BottomSheet: await import('@views/owner-daily-page/lib/fakeBottomSheet'),
}));

import { DiaryNoticeImportSheet } from './DiaryNoticeImportSheet';

const notice = {
  date: '2026년 6월 17일 수요일',
};

function renderSheet(hasPhoto: boolean) {
  const props = {
    isOpen: true,
    hasPhoto,
    date: notice.date,
    onClose: vi.fn(),
    onAddToDiary: vi.fn(),
    onCreateDiary: vi.fn(),
  };
  render(<DiaryNoticeImportSheet {...props} />);
  return props;
}

describe('알림장 불러오기 시트', () => {
  afterEach(() => {
    cleanup();
  });

  test('사진이 있으면 목업 알림장과 글 추가, 바로 만들기를 나눈다', () => {
    const props = renderSheet(true);
    const body = screen.getByText(/운동장에서 아주 활발하게/);

    expect(screen.getByRole('heading', { name: /알림장을 불러왔어요/ }).textContent).toContain(
      '글과 사진을 직접 추가할 수 있어요'
    );
    expect(body.className).not.toContain('blur');
    expect(screen.queryByRole('button', { name: '더보기' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: '글·사진 추가하기' }));
    expect(props.onAddToDiary).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: '바로 일기 만들기' }));
    expect(props.onCreateDiary).toHaveBeenCalledTimes(1);
  });

  test('사진이 없으면 사진 추가만 열고 알림장을 붙인다', () => {
    const props = renderSheet(false);

    expect(screen.getByRole('heading', { name: /알림장을 불러왔어요/ }).textContent).toContain(
      '사진만 고르면 일기를 완성할 수 있어요'
    );
    expect(screen.queryByRole('button', { name: '바로 일기 만들기' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: '사진 추가하기' }));
    expect(props.onAddToDiary).toHaveBeenCalledTimes(1);
  });
});
