import { addDays, formatDateKey, startOfDay } from '@shared/lib/calendar-date';

import type { GuardianDailyNoticeMock } from './guardianAttendanceMock';

interface GuardianDisconnectedDayMock {
  checkInAt: string;
  checkOutAt: string;
  dailyNotice: GuardianDailyNoticeMock | null;
}

interface GuardianDisconnectedMock {
  /** 연결 해제일 `YYYY-MM-DD` — 당일 포함 선택 가능, 이후 비활성 */
  disconnectedAt: string;
  /** 마지막 앨범 사진 수 (연결 기간 내 마지막 날짜 1~3장) */
  lastAlbumPhotoCount: 0 | 1 | 2 | 3;
  /** 등원 기록 마커 날짜 */
  recordDateKeys: string[];
  /** 날짜별 등하원·알림장 (연결 해제 이전만) */
  daysByDateKey: Record<string, GuardianDisconnectedDayMock>;
}

function createDateKeyDaysBefore(base: Date, daysBefore: number) {
  return formatDateKey(addDays(startOfDay(base), -daysBefore));
}

/** mock 연결 해제일: 2026-06-17 */
const MOCK_DISCONNECTED_AT = '2026-06-17';

const MOCK_DISCONNECTED_NOTICE: GuardianDailyNoticeMock = {
  writtenAt: new Date(`${MOCK_DISCONNECTED_AT}T16:30:00`).toISOString(),
  conditionLabel: '평소와 같음',
  stoolLabel: '딱딱함',
  body: '안녕하세요 뭉치 어머니! 뭉치가 오늘 친구들과 운동장에서 아주 활발하게 뛰어놀았어요. 특히 보더콜리 친구와 공놀이하는 걸 무척 좋아하더라고요! 점심도 남김없이 다 먹었고, 오후 낮잠 시간에는 아주 깊게 잠들었습니다. 집에 가서 푹 쉴 수 있게 해주세요!!',
};

const disconnectedDay = startOfDay(new Date(`${MOCK_DISCONNECTED_AT}T00:00:00`));
const noNoticeDayKey = createDateKeyDaysBefore(disconnectedDay, 1);

/**
 * API 연동 전 연결 해제 화면 mock.
 * 해제일 이후 업로드/기록은 노출하지 않음.
 */
const MOCK_DISCONNECTED: GuardianDisconnectedMock = {
  disconnectedAt: MOCK_DISCONNECTED_AT,
  lastAlbumPhotoCount: 3,
  recordDateKeys: [
    createDateKeyDaysBefore(disconnectedDay, 3),
    createDateKeyDaysBefore(disconnectedDay, 2),
    noNoticeDayKey,
    MOCK_DISCONNECTED_AT,
  ],
  daysByDateKey: {
    [noNoticeDayKey]: {
      checkInAt: new Date(`${noNoticeDayKey}T09:00:00`).toISOString(),
      checkOutAt: new Date(`${noNoticeDayKey}T17:05:00`).toISOString(),
      dailyNotice: null,
    },
    [MOCK_DISCONNECTED_AT]: {
      checkInAt: new Date(`${MOCK_DISCONNECTED_AT}T09:00:00`).toISOString(),
      checkOutAt: new Date(`${MOCK_DISCONNECTED_AT}T17:05:00`).toISOString(),
      dailyNotice: MOCK_DISCONNECTED_NOTICE,
    },
  },
};

export type { GuardianDisconnectedDayMock, GuardianDisconnectedMock };
export { MOCK_DISCONNECTED, MOCK_DISCONNECTED_AT };
