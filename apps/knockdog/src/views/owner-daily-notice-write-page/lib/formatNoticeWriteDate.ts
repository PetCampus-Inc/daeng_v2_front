const KST_TIME_ZONE = 'Asia/Seoul';

const KST_WEEKDAY_FORMATTER = new Intl.DateTimeFormat('ko-KR', {
  timeZone: KST_TIME_ZONE,
  weekday: 'short',
});

function getNumberPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) {
  return Number(parts.find((part) => part.type === type)?.value);
}

function getKstDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: KST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  return {
    year: getNumberPart(parts, 'year'),
    month: getNumberPart(parts, 'month'),
    day: getNumberPart(parts, 'day'),
  };
}

/** KST 기준 YYYY-MM-DD (표시·전송 공통 키) */
function getNoticeWriteDateKey(date: Date = new Date()) {
  const { year, month, day } = getKstDateParts(date);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** 알림장 작성 시트 상단 날짜 (KST) */
function formatNoticeWriteDate(date: Date = new Date()) {
  const { month, day } = getKstDateParts(date);
  const weekday = KST_WEEKDAY_FORMATTER.format(date);

  return `${month}월 ${day}일 (${weekday})`;
}

function createNoticeWriteDate(date: Date = new Date()) {
  return {
    dateKey: getNoticeWriteDateKey(date),
    label: formatNoticeWriteDate(date),
  };
}

export { createNoticeWriteDate, formatNoticeWriteDate, getNoticeWriteDateKey };
