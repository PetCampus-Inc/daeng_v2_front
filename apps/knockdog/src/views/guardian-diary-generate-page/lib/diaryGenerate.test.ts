import { describe, expect, test } from 'vitest';

import { getDiaryDialogCopy, getDiarySaveToast, getGenerateButtonLabel, revealDiaryText } from './diaryGenerate';

describe('일기 생성 문구', () => {
  test('생성 중 버튼은 강아지 이름과 이탈 여부에 맞춘다', () => {
    expect(getGenerateButtonLabel('콩이', false)).toBe('콩이가 열심히 일기를 쓰고 있어요');
    expect(getGenerateButtonLabel('콩이', true)).toBe('콩이가 아직 일기를 쓰고 있어요');
    expect(getGenerateButtonLabel('봄', false)).toBe('봄이 열심히 일기를 쓰고 있어요');
  });

  test('저장 확인과 이탈 확인은 버튼 문구를 나눈다', () => {
    expect(getDiaryDialogCopy('leave').title).toBe('저장하지 않고 나갈까요?');
    expect(getDiaryDialogCopy('leave').confirmLabel).toBe('나가기');
    expect(getDiaryDialogCopy('save').title).toBe('이대로 저장할까요?');
    expect(getDiaryDialogCopy('save').confirmLabel).toBe('저장하기');
  });

  test('저장 토스트는 강아지 이름을 앞에 둔다', () => {
    expect(getDiarySaveToast('콩이')).toEqual({
      name: '콩이',
      suffix: '의 일기를 저장했어요',
      nativeTitle: '콩이의 일기를 저장했어요',
    });
  });

  test('완료 본문은 단어 수만큼 보여 준다', () => {
    expect(revealDiaryText('오늘은 낙엽을 밟았어', 1)).toBe('오늘은 ');
    expect(revealDiaryText('오늘은 낙엽을 밟았어', 3)).toBe('오늘은 낙엽을 밟았어');
  });
});
