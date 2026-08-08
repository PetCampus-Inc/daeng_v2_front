import { formatDateKey, addDays, startOfDay } from '@shared/lib/calendar-date';

interface GuardianDailyNoticeMock {
  /** 알림장 작성/도착 시각 */
  writtenAt: string;
  conditionLabel: string;
  stoolLabel: string;
  body: string;
}

interface GuardianAttendanceDayMock {
  /** 원장 등원처리 시각. null이면 등원 전 */
  checkInAt: string | null;
  /** 원장 하원처리 시각. checkInAt과 함께 있으면 하원 완료 */
  checkOutAt: string | null;
  /** 헤더 알림 뱃지(AlarmLineActive) */
  hasUnreadAlarm: boolean;
  /** 알림장 유무. false면 note empty */
  hasDailyNotice: boolean;
  /** 알림장 내용 mock. hasDailyNotice=true일 때 사용 */
  dailyNotice: GuardianDailyNoticeMock | null;
  /**
   * 오늘 앨범 사진 수, 화면에 표시되는 사진 수임(0~3).
   * 실제 이미지는 선택견 profileImage로 mock 채움
   */
  albumPhotoCount: 0 | 1 | 2 | 3;
  /** 등원 기록이 있는 날짜 `YYYY-MM-DD` — 캘린더 주황 점 */
  recordDateKeys: string[];
}

function createTodayAt(hours: number, minutes = 0) {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

function createDateKeyDaysAgo(daysAgo: number) {
  return formatDateKey(addDays(startOfDay(new Date()), -daysAgo));
}

/** mock용 최근 등원 기록 날짜 (오늘·그제·3일 전) */
const MOCK_RECORD_DATE_KEYS = [
  createDateKeyDaysAgo(0),
  createDateKeyDaysAgo(2),
  createDateKeyDaysAgo(3),
];

const MOCK_DAILY_NOTICE: GuardianDailyNoticeMock = {
  writtenAt: createTodayAt(17, 30),
  conditionLabel: '평소와 같음',
  stoolLabel: '딱딱함',
  body: '안녕하세요 뭉치 어머니! 뭉치가 오늘 친구들과 운동장에서 아주 활발하게 뛰어놀았어요. 특히 보더콜리 친구와 공놀이하는 걸 무척 좋아하더라고요! 점심도 남김없이 다 먹었고, 오후 낮잠 시간에는 아주 깊게 잠들었습니다. 집에 가서 푹 쉴 수 있게 해주세요!!',
};

/**
 * API 연동 전 등원일 mock.
 * - checkInAt만 → 등원 중
 * - checkInAt + checkOutAt → 하원 완료
 */
const MOCK_ATTENDANCE_DAY: GuardianAttendanceDayMock = {
  checkInAt: createTodayAt(9, 0),
  checkOutAt: null,
  hasUnreadAlarm: true,
  hasDailyNotice: true,
  dailyNotice: MOCK_DAILY_NOTICE,
  albumPhotoCount: 1,
  recordDateKeys: MOCK_RECORD_DATE_KEYS,
};

export type { GuardianAttendanceDayMock, GuardianDailyNoticeMock };
export {
  MOCK_ATTENDANCE_DAY,
  MOCK_DAILY_NOTICE,
  MOCK_RECORD_DATE_KEYS,
  createTodayAt,
  createDateKeyDaysAgo,
};
