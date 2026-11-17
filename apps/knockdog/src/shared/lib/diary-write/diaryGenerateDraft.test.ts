// @vitest-environment jsdom
import { afterEach, describe, expect, test, vi } from 'vitest';

import { readDiaryGenerateDraft, saveDiaryGenerateDraft } from './diaryGenerateDraft';

describe('일기 생성 초안', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.sessionStorage.clear();
  });

  test('저장소 읽기 실패는 초안 없음으로 본다', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(readDiaryGenerateDraft()).toBeNull();
  });

  test('저장 실패는 호출자가 처리할 수 있게 전달한다', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(() =>
      saveDiaryGenerateDraft({ date: '2026-06-16', dogName: '콩이', photos: [] })
    ).toThrow('blocked');
  });
});
