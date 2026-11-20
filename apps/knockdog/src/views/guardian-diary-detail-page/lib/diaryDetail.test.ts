import { describe, expect, test } from 'vitest';

import { diaryPreviewTitle, formatDiaryDeleteToast, formatDiaryDetailDate } from './diaryDetail';

describe('일기 상세 문구', () => {
  const date = new Date(2026, 5, 16);

  test('날짜는 요일까지 보여 준다', () => {
    expect(formatDiaryDetailDate(date)).toBe('2026년 6월 16일 화요일');
  });

  test('삭제 토스트는 짧은 요일을 앞에 둔다', () => {
    expect(formatDiaryDeleteToast(date)).toEqual({
      label: '6월 16일 (화)',
      suffix: ' 일기를 삭제했어요',
      nativeTitle: '6월 16일 (화) 일기를 삭제했어요',
    });
  });

  test('미리보기 제목은 첫 문장을 쓴다', () => {
    expect(diaryPreviewTitle('오늘은 낙엽을 밟았어! 내일도 가자')).toBe('오늘은 낙엽을 밟았어');
  });
});
