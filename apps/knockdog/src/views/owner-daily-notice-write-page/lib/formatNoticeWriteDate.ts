const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

/** 알림장 작성 시트 상단 날짜  */
function formatNoticeWriteDate(date: Date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = WEEKDAY_LABELS[date.getDay()] ?? '';

  return `${month}월 ${day}일 (${weekday})`;
}

export { formatNoticeWriteDate };
