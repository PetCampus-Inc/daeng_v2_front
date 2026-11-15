import type { OwnerDailyTab } from '@views/owner-daily-page/config/ownerDailyContent';
import { createDateFromDateKey } from '@views/owner-daily-page/lib/ownerDailyDate';

import type { TodayAttendanceFilter } from '@entities/owner-attendance-checkinout';

import { formatDateKey } from '@shared/lib/calendar-date';

/** 일과 화면의 날짜·탭·필터·검색어를 담는 주소 query 이름. 홈·알림이 열 때 보내는 이름과 같다. */
const OWNER_DAILY_QUERY_KEY = {
  date: 'date',
  tab: 'tab',
  lateOnly: 'lateOnly',
  todayFilter: 'todayFilter',
  keyword: 'q',
} as const;

const OWNER_DAILY_TABS: readonly OwnerDailyTab[] = ['attendance-check', 'attendance-list'];
const TODAY_ATTENDANCE_FILTERS: readonly TodayAttendanceFilter[] = ['CURRENTLY_IN', 'UNSENT_RECORD', 'ABSENT'];
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** 주소의 `date` 값을 날짜로 바꾼다. `YYYY-MM-DD` 형식이고 실제로 있는 날짜가 아니면 null이다. */
const parseOwnerDailyDateParam = (value: string | null): Date | null => {
  if (!value || !DATE_KEY_PATTERN.test(value)) return null;

  const date = createDateFromDateKey(value);
  return formatDateKey(date) === value ? date : null;
};

/** 주소의 `tab` 값이 일과 탭 이름이면 돌려주고, 아니면 null(날짜에 따른 기본 탭)이다. */
const parseOwnerDailyTabParam = (value: string | null): OwnerDailyTab | null =>
  OWNER_DAILY_TABS.find((tab) => tab === value) ?? null;

/** 주소의 `todayFilter` 값이 등원목록 필터 이름이면 돌려주고, 아니면 undefined(`전체`)이다. */
const parseOwnerDailyFilterParam = (value: string | null): TodayAttendanceFilter | undefined =>
  TODAY_ATTENDANCE_FILTERS.find((filter) => filter === value);

/** 주소의 `lateOnly` 값은 정확히 `true`일 때만 켜진 것으로 본다. */
const parseOwnerDailyLateOnlyParam = (value: string | null): boolean => value === 'true';

export {
  OWNER_DAILY_QUERY_KEY,
  parseOwnerDailyDateParam,
  parseOwnerDailyLateOnlyParam,
  parseOwnerDailyTabParam,
  parseOwnerDailyFilterParam,
};
