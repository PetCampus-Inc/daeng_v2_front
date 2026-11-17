// @vitest-environment jsdom
import { afterEach, describe, expect, test, vi } from 'vitest';

import {
  isDiaryRemoved,
  isVisibleDiary,
  markDiaryRemoved,
  readDiaryRecord,
  readDiaryRecords,
  removeDiaryRecord,
  saveDiaryHomeReturn,
  saveDiaryRecord,
  takeDiaryHomeDate,
} from './diaryRecord';

const record = {
  dateKey: '2026-06-16',
  petId: 'pet-1',
  dogName: '가나디',
  body: '오늘은 낙엽을 밟았어',
  photos: ['/images/diary-sample/leaf.png'],
};

describe('저장된 일기', () => {
  afterEach(() => {
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  test('같은 날짜는 덮어쓰고 지우면 없어진다', () => {
    saveDiaryRecord(record);
    saveDiaryRecord({ ...record, body: '수정한 일기' });

    expect(readDiaryRecord('2026-06-16', 'pet-1')?.body).toBe('수정한 일기');

    removeDiaryRecord('2026-06-16', 'pet-1');
    expect(readDiaryRecord('2026-06-16', 'pet-1')).toBeNull();
  });

  test('지운 일기만 그 강아지 달력에서 숨긴다', () => {
    markDiaryRemoved('pet-1', '2026-06-16', 'diary-1');

    expect(isDiaryRemoved('pet-1', 'diary-1')).toBe(true);
    expect(isDiaryRemoved('pet-1', 'diary-2')).toBe(false);
    expect(isDiaryRemoved('pet-2', 'diary-1')).toBe(false);
  });

  test('삭제 표시를 저장하지 못해도 예외를 올리지 않는다', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(() => markDiaryRemoved('pet-1', '2026-06-16', 'diary-1')).not.toThrow();
    vi.restoreAllMocks();
  });

  test('달력은 같은 강아지와 강아지 없는 기록을 보여 준다', () => {
    expect(isVisibleDiary(record, 'pet-1')).toBe(true);
    expect(isVisibleDiary(record, 'pet-2')).toBe(false);
    expect(isVisibleDiary({ ...record, petId: null }, 'pet-1')).toBe(true);
    expect(isVisibleDiary({ ...record, petId: '1' }, 1 as unknown as string)).toBe(true);
  });

  test('강아지 정보가 없어도 그 날짜 일기를 읽는다', () => {
    saveDiaryRecord({ ...record, petId: null, body: '저장된 일기', photos: ['/images/diary-sample/leaf.png'] });

    expect(readDiaryRecord('2026-06-16')?.body).toBe('저장된 일기');
    expect(readDiaryRecord('2026-06-16', '다른-강아지')?.photos).toEqual(['/images/diary-sample/leaf.png']);
  });

  test('같은 날짜의 다른 강아지 일기는 남긴다', () => {
    saveDiaryRecord(record);
    saveDiaryRecord({ ...record, petId: 'pet-2', body: '다른 강아지 일기' });

    expect(readDiaryRecord('2026-06-16', 'pet-1')?.body).toBe('오늘은 낙엽을 밟았어');
    expect(readDiaryRecord('2026-06-16', 'pet-2')?.body).toBe('다른 강아지 일기');
  });

  test('읽기 실패는 빈 목록이고 저장 실패는 전달한다', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(readDiaryRecords()).toEqual([]);
    vi.restoreAllMocks();

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => saveDiaryRecord(record)).toThrow('blocked');
    vi.restoreAllMocks();
  });

  test('일기장으로 돌아갈 날짜는 한 번만 읽힌다', () => {
    saveDiaryHomeReturn('2026-06-16');

    expect(takeDiaryHomeDate()).toBe('2026-06-16');
    expect(takeDiaryHomeDate()).toBeNull();
  });
});
