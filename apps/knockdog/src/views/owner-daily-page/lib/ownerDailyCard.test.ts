import { describe, expect, test } from 'vitest';

import { formatKstTimeLabel } from '@views/owner-daily-page/lib/ownerDailyDate';
import {
  getCheckInChip,
  getPastDayTag,
  getTodayListCardView,
} from '@views/owner-daily-page/lib/ownerDailyAttendance';
import { formatKstClock24 } from '@views/owner-daily-page/lib/ownerDailyTime';

describe('등원처리 탭 카드 표시', () => {
  test('등원 시각을 한국 시간 24시간제 `HH:MM`으로 바꾼다 (앞자리 0 채움: 9시 5분 → `09:05`)', () => {
    // UTC 00:05 = KST 09:05
    expect(formatKstClock24('2026-11-10T00:05:00Z')).toBe('09:05');
    // UTC 14:30 = KST 23:30
    expect(formatKstClock24('2026-11-10T14:30:00Z')).toBe('23:30');
  });

  test('등원 전·지각 원생은 `지각` 칩만 보이고 지각이 아닌 등원 전 원생은 칩이 없다', () => {
    expect(getCheckInChip({ status: 'NOT_CHECKED_IN', isLate: true })).toBe('late');
    expect(getCheckInChip({ status: 'NOT_CHECKED_IN', isLate: false })).toBeNull();
  });

  test('등원 완료 원생은 지각했어도 `등원완료` 칩이다', () => {
    expect(getCheckInChip({ status: 'CHECKED_IN', isLate: true })).toBe('checkedIn');
    expect(getCheckInChip({ status: 'CHECKED_IN', isLate: false })).toBe('checkedIn');
  });

  test('결석 원생은 `결석` 칩이다', () => {
    expect(getCheckInChip({ status: 'ABSENT', isLate: true })).toBe('absent');
  });
});

describe('등원목록 탭 — 상태 태그와 버튼', () => {
  test('재원 중이고 알림장을 아직 안 보냈으면 `등원완료` 태그와 알림장 작성하기(보조)·하원처리(주요) 버튼이다', () => {
    expect(getTodayListCardView({ status: 'CHECKED_IN', recordSent: false, disconnected: false })).toEqual({
      tag: 'checkedIn',
      buttons: [
        { kind: 'writeRecord', variant: 'grayFilled' },
        { kind: 'checkOut', variant: 'orangeFilled' },
      ],
    });
  });

  test('재원 중이고 알림장을 보냈으면 `발송완료` 태그와 알림장 보기·하원처리 버튼이다', () => {
    expect(getTodayListCardView({ status: 'CHECKED_IN', recordSent: true, disconnected: false })).toEqual({
      tag: 'recordSent',
      buttons: [
        { kind: 'viewRecord', variant: 'grayOutline' },
        { kind: 'checkOut', variant: 'orangeFilled' },
      ],
    });
  });

  test('하원했고 알림장을 아직 안 보냈으면 `하원완료` 태그와 알림장 작성하기(주요)·하원 취소 버튼이다', () => {
    expect(getTodayListCardView({ status: 'CHECKED_OUT', recordSent: false, disconnected: false })).toEqual({
      tag: 'checkedOut',
      buttons: [
        { kind: 'writeRecord', variant: 'orangeFilled' },
        { kind: 'cancelCheckOut', variant: 'grayOutline' },
      ],
    });
  });

  test('하원했고 알림장을 보냈으면 `일과 완료` 태그와 알림장 보기·하원 취소 버튼이다', () => {
    expect(getTodayListCardView({ status: 'CHECKED_OUT', recordSent: true, disconnected: false })).toEqual({
      tag: 'dayCompleted',
      buttons: [
        { kind: 'viewRecord', variant: 'grayOutline' },
        { kind: 'cancelCheckOut', variant: 'grayOutline' },
      ],
    });
  });

  test('연결이 해제된 원생은 출결 상태와 상관없이 `연결해제` 태그이고 버튼이 없다', () => {
    expect(getTodayListCardView({ status: 'CHECKED_OUT', recordSent: true, disconnected: true })).toEqual({
      tag: 'disconnected',
      buttons: [],
    });
  });

  test('시각을 `오전/오후 h:mm` 형식으로 바꾼다. 낮 12시는 `오후 12:00`, 밤 12시 30분은 `오전 12:30`이다', () => {
    // UTC 03:00 = KST 12:00
    expect(formatKstTimeLabel(new Date('2026-11-10T03:00:00Z'))).toBe('오후 12:00');
    // UTC 전날 15:30 = KST 00:30
    expect(formatKstTimeLabel(new Date('2026-11-09T15:30:00Z'))).toBe('오전 12:30');
  });
});

describe('지난 날짜 일과', () => {
  test('그날의 최종 상태 태그는 연결해제 > 결석 > 일과 완료 > 발송완료 > 하원완료 순으로 하나만 정한다', () => {
    expect(getPastDayTag({ status: 'ABSENT', recordSent: true, disconnected: true })).toBe('disconnected');
    expect(getPastDayTag({ status: 'ABSENT', recordSent: false, disconnected: false })).toBe('absent');
    expect(getPastDayTag({ status: 'CHECKED_OUT', recordSent: true, disconnected: false })).toBe('dayCompleted');
    expect(getPastDayTag({ status: 'CHECKED_IN', recordSent: true, disconnected: false })).toBe('recordSent');
    expect(getPastDayTag({ status: 'CHECKED_OUT', recordSent: false, disconnected: false })).toBe('checkedOut');
  });

  test('등원 기록만 있는 원생은 태그가 없다', () => {
    expect(getPastDayTag({ status: 'CHECKED_IN', recordSent: false, disconnected: false })).toBeNull();
  });
});
