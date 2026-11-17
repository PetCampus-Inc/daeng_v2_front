import { WEEKDAY_LABELS } from '@shared/lib/calendar-date';

const WEEKDAY_FULL_LABELS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'] as const;

/**
 * 일과 화면 날짜 줄 문구. `{M}월 {D}일 {요일}` (예: `6월 18일 화요일`)
 * 오늘과 연도가 다르면 앞에 `{YYYY}년 `을 붙인다.
 */
const formatOwnerDailyDateLabel = (date: Date, today: Date): string => {
  const yearLabel = date.getFullYear() === today.getFullYear() ? '' : `${date.getFullYear()}년 `;

  return `${yearLabel}${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAY_FULL_LABELS[date.getDay()]}`;
};

/** 날짜 선택 시트 하단 버튼 문구. `{YYYY}년 {M}월 {D}일 ({요일}) 검색` */
const formatOwnerDailyPickerLabel = (date: Date): string =>
  `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAY_LABELS[date.getDay()]}) 검색`;

export { formatOwnerDailyDateLabel, formatOwnerDailyPickerLabel };
