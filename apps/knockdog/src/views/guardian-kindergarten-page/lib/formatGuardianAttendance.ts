const KST_TIME_ZONE = 'Asia/Seoul';

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

function getNumberPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) {
  return Number(parts.find((part) => part.type === type)?.value);
}

/** API Date(KST wall→UTC)를 Asia/Seoul 기준으로 시·분 추출 */
function getKstTimeParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: KST_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  return {
    hour: getNumberPart(parts, 'hour'),
    minute: getNumberPart(parts, 'minute'),
  };
}

/** Asia/Seoul 기준 `YYYY-MM-DD` */
function formatKstDateKey(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: KST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** 오전/오후 h:mm (KST) */
function formatKoreanAmPmTime(date: Date) {
  const { hour: hours, minute: minutes } = getKstTimeParts(date);
  const period = hours < 12 ? '오전' : '오후';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${period} ${hour12}:${pad2(minutes)}`;
}

/** 등원한 지 N시간 M분째 */
function formatAttendingDuration(checkInAt: Date, now = new Date()) {
  const diffMs = Math.max(0, now.getTime() - checkInAt.getTime());
  const totalMinutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) return `등원한 지 ${minutes}분째`;
  return `등원한 지 ${hours}시간 ${minutes}분째`;
}

export { formatAttendingDuration, formatKoreanAmPmTime, formatKstDateKey };
