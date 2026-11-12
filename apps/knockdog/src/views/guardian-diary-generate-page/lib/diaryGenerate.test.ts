import { describe, expect, test } from 'vitest';

import { getGenerateButtonLabel, revealDiaryText } from './diaryGenerate';

describe('일기 생성 문구', () => {
  test('생성 중 버튼은 강아지 이름과 이탈 여부에 맞춘다', () => {
    expect(getGenerateButtonLabel('콩이', false)).toBe('콩이가 열심히 일기를 쓰고 있어요');
    expect(getGenerateButtonLabel('콩이', true)).toBe('콩이가 아직 일기를 쓰고 있어요');
    expect(getGenerateButtonLabel('봄', false)).toBe('봄이 열심히 일기를 쓰고 있어요');
  });

  test('완료 본문은 단어 수만큼 보여 준다', () => {
    expect(revealDiaryText('오늘은 낙엽을 밟았어', 1)).toBe('오늘은 ');
    expect(revealDiaryText('오늘은 낙엽을 밟았어', 3)).toBe('오늘은 낙엽을 밟았어');
  });
});
