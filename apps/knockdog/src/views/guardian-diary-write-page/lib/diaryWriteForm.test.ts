// @vitest-environment jsdom
import { describe, expect, test } from 'vitest';

import { buildDiaryWriteTarget } from '@shared/lib/diary-write/buildDiaryWriteTarget';

import {
  DIARY_IMPORT_BANNER_KEY,
  buildDiaryPrompts,
  canSubmitDiary,
  dismissDiaryImport,
  formatDiaryObject,
  getDiaryImportSheetCopy,
  hasDismissedDiaryImport,
  hasMockArrivedNotice,
  isDiaryImportVisible,
  parseDiaryDate,
} from './diaryWriteForm';

describe('일기 쓰기 규칙', () => {
  test('알림장이 없으면 사진과 글이 있어야 만들고, 있으면 사진만으로 만든다', () => {
    expect(canSubmitDiary(0, '낙엽을 밟았다', true)).toBe(false);
    expect(canSubmitDiary(1, '   ', true)).toBe(false);
    expect(canSubmitDiary(1, '낙엽을 밟았다', true)).toBe(true);
    expect(canSubmitDiary(1, '', false)).toBe(true);
  });

  test('질문의 이름 조사는 받침에 맞춘다', () => {
    expect(formatDiaryObject('콩이')).toBe('콩이를');
    expect(formatDiaryObject('봄')).toBe('봄을');
    expect(buildDiaryPrompts('콩이')[0]).toBe('콩이가 오늘 가장 기뻐했던 순간은 무엇인가요?');
    expect(buildDiaryPrompts('콩이')[2]).toBe('콩이는 오늘 산책에서 무엇을 가장 좋아했나요?');
    expect(buildDiaryPrompts('봄')[2]).toBe('봄은 오늘 산책에서 무엇을 가장 좋아했나요?');
    expect(buildDiaryPrompts('콩이')[3]).toBe('오늘 콩이를 보며 무슨 생각을 했나요?');
    expect(buildDiaryPrompts('봄')[0]).toBe('봄이 오늘 가장 기뻐했던 순간은 무엇인가요?');
  });

  test('날짜는 작성 화면 쿼리로 만든다', () => {
    expect(parseDiaryDate('2026-06-17')).toEqual(new Date(2026, 5, 17));
    expect(parseDiaryDate('2026-02-31')).toBeNull();
    expect(buildDiaryWriteTarget({ date: new Date(2026, 5, 17), schoolId: 'school-1' })).toEqual({
      pathname: '/kindergarten/diary/write',
      query: { date: '2026-06-17', schoolId: 'school-1' },
    });
    expect(buildDiaryWriteTarget({ date: new Date(2026, 5, 17) }).query.schoolId).toBeUndefined();
  });

  test('알림장이 도착한 오늘은 불러오기 배너를 보여 준다', () => {
    const today = new Date(2026, 10, 12);
    expect(hasMockArrivedNotice(today, today)).toBe(true);
    expect(hasMockArrivedNotice(new Date(2026, 10, 11), today)).toBe(false);
  });

  test('사진이 있으면 글·사진 추가와 바로 만들기를 보여 준다', () => {
    expect(getDiaryImportSheetCopy(true)).toEqual({
      title: '알림장을 불러왔어요',
      description: '글과 사진을 직접 추가할 수 있어요',
      primaryLabel: '바로 일기 만들기',
      secondaryLabel: '글·사진 추가하기',
    });
    expect(getDiaryImportSheetCopy(false)).toEqual({
      title: '알림장을 불러왔어요',
      description: '사진만 고르면 일기를 완성할 수 있어요',
      primaryLabel: '사진 추가하기',
    });
  });

  test('알림장이 있으면 불러오기 배너를 보여 준다', () => {
    const visible = {
      hasNotice: true,
      isImported: false,
      isImportDismissed: false,
    } as const;

    expect(isDiaryImportVisible(visible)).toBe(true);
    expect(isDiaryImportVisible({ ...visible, hasNotice: false })).toBe(false);
    expect(isDiaryImportVisible({ ...visible, isImportDismissed: true })).toBe(false);
    expect(isDiaryImportVisible({ ...visible, isImported: true })).toBe(false);
  });

  test('알림장 배너를 닫으면 다시 보여 주지 않는다', () => {
    window.localStorage.clear();
    expect(hasDismissedDiaryImport()).toBe(false);

    dismissDiaryImport();

    expect(hasDismissedDiaryImport()).toBe(true);
    expect(window.localStorage.getItem(DIARY_IMPORT_BANNER_KEY)).toBe('dismissed');
    window.localStorage.clear();
  });
});
