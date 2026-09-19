/** `YYYY-MM-DD` →  보호자 연결 이력과 동일 표기 */
function formatKoreanHistoryDate(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  if (!year || !month || !day) return dateKey;
  return `${year}년 ${month}월 ${day}일`;
}

export { formatKoreanHistoryDate };
