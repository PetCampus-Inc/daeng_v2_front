import type { KindergartenComparison } from '../model/compare';
import { CLOSED_DAYS } from '../model/constants/compare';

/**
 * 시간 문자열을 분으로 변환합니다.
 * @param timeStr "2시간 49분" 형식의 문자열
 * @returns 총 분 단위 (예: 169)
 */
function parseTimeStrToMinutes(timeStr: string): number {
  if (!timeStr) return 0;

  let totalMinutes = 0;
  const hourMatch = timeStr.match(/(\d+)시간/);
  const minMatch = timeStr.match(/(\d+)분/);

  if (hourMatch) totalMinutes += parseInt(hourMatch[1] || '0') * 60;
  if (minMatch) totalMinutes += parseInt(minMatch[1] || '0');

  return totalMinutes;
}

/**
 * 분 단위를 시간 문자열로 변환합니다.
 * @param minutes 분 단위 (예: 169)
 * @returns "2시간 49분" 형식의 문자열
 */
function parseMinutesToTimeStr(minutes: number): string {
  if (!minutes) {
    return '-';
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours}시간`);
  }
  if (mins > 0) {
    parts.push(`${mins}분`);
  }

  return parts.join(' ');
}

/**
 * 휴무일 목록을 텍스트로 변환합니다.
 * @param kg KindergartenComparison 객체
 * @returns "월요일, 화요일, 수요일" 형식의 문자열
 */
function getClosedDaysText(kg?: KindergartenComparison | null): string {
  return (kg?.operatingSchedule?.closedDays ?? []).map((dayKey) => CLOSED_DAYS[dayKey]).join(', ') || '-';
}

export { parseTimeStrToMinutes, parseMinutesToTimeStr, getClosedDaysText };
