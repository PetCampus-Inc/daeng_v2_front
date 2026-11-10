import { describe, expect, test } from 'vitest';

import { collectImageUrls, isHttpUrl, isRecord, isShowableImage } from './richContent';

const image = (extra: Record<string, unknown> = {}) => ({ type: 'img', children: [{ text: '' }], ...extra });

describe('isHttpUrl', () => {
  test('http와 https만 허용한다', () => {
    expect(isHttpUrl('https://knockdog.net/a?x=1')).toBe(true);
    expect(isHttpUrl('http://knockdog.net')).toBe(true);
    expect(isHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isHttpUrl('data:image/png;base64,AAAA')).toBe(false);
    expect(isHttpUrl('/relative/path')).toBe(false);
    expect(isHttpUrl(null)).toBe(false);
    expect(isHttpUrl(123)).toBe(false);
  });
});

describe('isRecord', () => {
  test('배열과 null은 객체로 보지 않는다', () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord([])).toBe(false);
    expect(isRecord(null)).toBe(false);
    expect(isRecord('text')).toBe(false);
  });
});

describe('isShowableImage', () => {
  test('img/image 타입이고 사용 가능하며 http(s) URL이 있어야 한다', () => {
    expect(isShowableImage(image({ url: 'https://e.com/a.jpg' }))).toBe(true);
    expect(isShowableImage({ type: 'image', url: 'https://e.com/a.jpg' })).toBe(true);
    expect(isShowableImage(image({ url: 'https://e.com/a.jpg', unavailable: true }))).toBe(false);
    expect(isShowableImage(image({ url: null }))).toBe(false);
    expect(isShowableImage(image({ url: 'javascript:alert(1)' }))).toBe(false);
    expect(isShowableImage({ type: 'paragraph', url: 'https://e.com/a.jpg' })).toBe(false);
  });
});

describe('collectImageUrls', () => {
  test('본문 순서대로 보여줄 수 있는 이미지 URL만 모은다', () => {
    const body = {
      schemaVersion: 1,
      blocks: [
        image({ url: 'https://e.com/1.jpg' }),
        { type: 'paragraph', children: [{ text: '사이' }] },
        image({ url: null, unavailable: true }),
        image({ url: 'https://e.com/2.jpg' }),
      ],
    };

    expect(collectImageUrls(body)).toEqual(['https://e.com/1.jpg', 'https://e.com/2.jpg']);
  });

  test('표 안처럼 중첩된 이미지도 children을 따라가 모은다', () => {
    const table = {
      type: 'table',
      children: [{ type: 'tr', children: [{ type: 'td', children: [image({ url: 'https://e.com/in.jpg' })] }] }],
    };

    expect(collectImageUrls([table])).toEqual(['https://e.com/in.jpg']);
  });

  test('이미지가 없거나 문자열 본문이면 빈 배열이다', () => {
    expect(collectImageUrls('문자열 본문')).toEqual([]);
    expect(collectImageUrls(null)).toEqual([]);
    expect(collectImageUrls({ blocks: [] })).toEqual([]);
  });
});
