import { describe, expect, test } from 'vitest';

import { parseDiaryDateStatus, parseDiaryGeneration } from './guardianDiary';

describe('보호자 일기 API', () => {
  test('선택 날짜 상태는 일기와 알림장을 화면 모델로 바꾼다', () => {
    const status = parseDiaryDateStatus({
      status: 200,
      message: '정상 처리되었습니다.',
      data: {
        date: '2026-06-16',
        diary: {
          diaryId: 9,
          title: '낙엽',
          body: '오늘은 낙엽을 밟았어',
          thumbnailUrl: 'https://example.com/leaf.jpg',
          photoCount: 2,
        },
        canWrite: false,
        blockedReason: 'ALREADY_WRITTEN',
        remainingGenerations: 2,
        nextAvailableAt: null,
        attendance: { attendanceRecordId: 4, note: '낮잠 잤어요' },
        onboardingShown: true,
      },
    });

    expect(status.diary?.id).toBe('9');
    expect(status.attendance?.id).toBe('4');
    expect(status.remainingGenerations).toBe(2);
    expect(status.canWrite).toBe(false);
  });

  test('생성 응답은 본문과 생성 ID를 남긴다', () => {
    const generation = parseDiaryGeneration({
      status: 200,
      message: '정상 처리되었습니다.',
      data: { generationId: 3, body: '생성된 일기' },
    });

    expect(generation).toEqual({ id: '3', body: '생성된 일기' });
  });
});
