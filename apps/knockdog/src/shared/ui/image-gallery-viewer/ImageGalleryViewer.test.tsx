// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { ImageGalleryViewer } from './ImageGalleryViewer';

afterEach(cleanup);

const THREE = ['https://e.com/a.jpg', 'https://e.com/b.jpg', 'https://e.com/c.jpg'];

describe('ImageGalleryViewer 사진 영역', () => {
  test('기본은 위에서 183px, 높이 390px 박스를 잘라 채운다 (다른 화면 동작 유지)', () => {
    render(<ImageGalleryViewer isOpen close={vi.fn()} images={THREE} native />);

    const image = screen.getByRole('img', { name: '사진 1' });
    expect(image.className).toContain('object-cover');
    expect(image.parentElement?.className).toContain('top-[183px]');
    expect(image.parentElement?.className).toContain('h-[390px]');
  });

  test('originalRatio는 잘라내지 않고 원본 비율로, 세로 가운데에 보여 준다', () => {
    render(<ImageGalleryViewer isOpen close={vi.fn()} images={THREE} native originalRatio />);

    const image = screen.getByRole('img', { name: '사진 1' });
    expect(image.className).toContain('object-contain');
    expect(image.className).toContain('h-auto');
    expect(image.className).not.toContain('object-cover');

    const box = image.parentElement?.className ?? '';
    expect(box).toContain('top-1/2');
    expect(box).toContain('-translate-y-1/2');
    expect(box).not.toContain('h-[390px]');
  });

  test('originalRatio에서도 이전/다음, 번호, 썸네일, 왼쪽 위 X는 그대로다', () => {
    render(<ImageGalleryViewer isOpen close={vi.fn()} images={THREE} initialIndex={1} native originalRatio />);

    expect(screen.getByRole('img', { name: '사진 2' }).getAttribute('src')).toBe('https://e.com/b.jpg');
    expect(screen.getByText('2/3')).toBeTruthy();
    expect(screen.getByRole('button', { name: '이전 사진' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '다음 사진' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '3번째 사진 보기' })).toBeTruthy();
    const closeButtons = screen.getAllByRole('button', { name: '사진 보기 닫기' });
    expect(
      closeButtons.some((button) => button.className.includes('top-5') && button.className.includes('left-4'))
    ).toBe(true);
  });
});
