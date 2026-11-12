// @vitest-environment jsdom
import { afterEach, describe, expect, test } from 'vitest';

import { readDiaryRecord, removeDiaryRecord, saveDiaryHomeReturn, saveDiaryRecord, takeDiaryHomeDate } from './diaryRecord';

const record = {
  dateKey: '2026-06-16',
  dogName: '가나디',
  body: '오늘은 낙엽을 밟았어',
  photos: ['/images/diary-sample/leaf.png'],
};

describe('저장된 일기', () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  test('같은 날짜는 덮어쓰고 지우면 없어진다', () => {
    saveDiaryRecord(record);
    saveDiaryRecord({ ...record, body: '수정한 일기' });

    expect(readDiaryRecord('2026-06-16')?.body).toBe('수정한 일기');

    removeDiaryRecord('2026-06-16');
    expect(readDiaryRecord('2026-06-16')).toBeNull();
  });

  test('일기장으로 돌아갈 날짜는 한 번만 읽힌다', () => {
    saveDiaryHomeReturn('2026-06-16');

    expect(takeDiaryHomeDate()).toBe('2026-06-16');
    expect(takeDiaryHomeDate()).toBeNull();
  });
});
