// @vitest-environment jsdom
import { afterEach, describe, expect, test, vi } from 'vitest';

import { parseDiaryGenerateDraft, readDiaryGenerateDraft, saveDiaryGenerateDraft } from './diaryGenerateDraft';

describe('일기 생성 초안', () => {
  test('새 WebView의 sessionStorage가 비어 있어도 전달받은 초안을 사용한다', () => {
    const draft = {
      date: '2026-11-18',
      dogName: '콩이',
      petId: '12',
      photos: ['https://example.test/photo.jpg'],
      photoKeys: ['diary/photo'],
      text: '즐거운 하루',
    };
    const params = JSON.parse(JSON.stringify({ draft }));
    window.sessionStorage.clear();
    expect(parseDiaryGenerateDraft(params.draft)).toMatchObject(draft);
  });

  test('초안이 없거나 강아지 ID가 없으면 생성을 허용하지 않는다', () => {
    expect(parseDiaryGenerateDraft(undefined)).toBeNull();
    expect(parseDiaryGenerateDraft({ date: '2026-11-18', dogName: '콩이', photos: [] })).toBeNull();
  });
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

    expect(() => saveDiaryGenerateDraft({ date: '2026-06-16', dogName: '콩이', photos: [] })).toThrow('blocked');
  });
});
