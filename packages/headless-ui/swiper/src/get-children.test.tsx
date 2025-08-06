import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getChildren } from './get-children';
import { SwiperRoot as Root, SwiperSlideItem as SlideItem } from './swiper';

describe('getChildren', () => {
  it('유효한 React 엘리먼트들을 배열로 반환해야 한다', () => {
    const children = [
      <SlideItem key='1'>슬라이드1</SlideItem>,
      <SlideItem key='2'>슬라이드2</SlideItem>,
      <SlideItem key='3'>슬라이드3</SlideItem>,
    ];

    const result = getChildren(children);

    expect(result).toHaveLength(3);
    expect(result[0]).toBeDefined();
    expect(result[1]).toBeDefined();
    expect(result[2]).toBeDefined();
  });

  it('빈 children 배열을 받으면 빈 배열을 반환해야 한다', () => {
    const children: React.ReactNode[] = [];
    const result = getChildren(children);
    expect(result).toHaveLength(0);
  });

  it('유효하지 않은 자식 요소를 받으면 빈 배열을 반환해야 한다', () => {
    const children: React.ReactNode[] = [
      <div key='1'>슬라이드1</div>,
      <div key='2'>슬라이드2</div>,
      <div key='3'>슬라이드3</div>,
    ];
    const result = getChildren(children);
    expect(result).toHaveLength(0);
  });

  it('유효하지 않은 자식요소와 유효한 자식요소를 함께 받으면 유효한 자식요소만 반환해야 한다', () => {
    const children: React.ReactNode[] = [
      <div key='1'>슬라이드1</div>,
      <SlideItem key='2'>슬라이드2</SlideItem>,
      <div key='3'>슬라이드3</div>,
    ];
    const result = getChildren(children);
    expect(result).toHaveLength(1);
    expect(result[0]).toBeDefined();
  });
});
