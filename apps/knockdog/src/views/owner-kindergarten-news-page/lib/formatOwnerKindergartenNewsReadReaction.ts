import {
  formatKstDayLabel,
  formatKstTimeLabel,
  getKstDateKey,
  getKstDateParts,
} from '@shared/lib/calendar-date';

/**
 * 읽음 시각 표기
 * - 당일: n분 전 / n시간 전
 * - 그 외: M월 D일 (요일) 오전/오후 H시 mm분
 */
function formatOwnerKindergartenNewsReadAt(readAt: Date, now = new Date()) {
  if (getKstDateKey(readAt) === getKstDateKey(now)) {
    const elapsedMs = Math.max(now.getTime() - readAt.getTime(), 0);
    const elapsedMinutes = Math.floor(elapsedMs / (60 * 1000));

    if (elapsedMinutes < 60) return `${elapsedMinutes}분 전`;

    const elapsedHours = Math.floor(elapsedMinutes / 60);
    return `${elapsedHours}시간 전`;
  }

  const { month, day } = getKstDateParts(readAt);
  const timeLabel = formatKstTimeLabel(readAt).replace(':', '시 ') + '분';

  return `${month}월 ${day}일 ${formatKstDayLabel(readAt)} ${timeLabel}`;
}

function formatOwnerKindergartenNewsDogLabel(dogNames: string[]) {
  const primary = dogNames[0];
  if (!primary) return '';

  const others = dogNames.length - 1;
  if (others <= 0) return primary;

  return `${primary} 외 ${others}마리`;
}

export { formatOwnerKindergartenNewsReadAt, formatOwnerKindergartenNewsDogLabel };
