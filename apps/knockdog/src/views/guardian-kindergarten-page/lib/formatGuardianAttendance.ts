function pad2(value: number) {
  return String(value).padStart(2, '0');
}

/** 오전/오후 h:mm */
function formatKoreanAmPmTime(date: Date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
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

export { formatAttendingDuration, formatKoreanAmPmTime };
