import { describe, expect, test } from 'vitest';

import { formatDiaryDogSubject } from '@knockdog/ui';

import { shouldShowDiaryNoteBanner } from './shouldShowDiaryNoteBanner';

describe('shouldShowDiaryNoteBanner', () => {
  test('알림장이 있고 그 날짜 일기를 쓰지 않았으면 배너를 보여 준다', () => {
    expect(shouldShowDiaryNoteBanner(true, false)).toBe(true);
  });

  test('알림장이 없거나 일기를 이미 썼으면 배너를 숨긴다', () => {
    expect(shouldShowDiaryNoteBanner(false, false)).toBe(false);
    expect(shouldShowDiaryNoteBanner(true, true)).toBe(false);
  });
});

describe('formatDiaryDogSubject', () => {
  test('이름 받침에 맞춰 조사를 붙인다', () => {
    expect(formatDiaryDogSubject('콩이')).toBe('콩이가');
    expect(formatDiaryDogSubject('봄')).toBe('봄이');
  });
});
