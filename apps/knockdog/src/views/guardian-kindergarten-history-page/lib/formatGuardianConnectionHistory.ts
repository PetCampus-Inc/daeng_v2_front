/** `YYYY-MM-DD` → `2025년 12월 6일` */
function formatKoreanHistoryDate(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  if (!year || !month || !day) return dateKey;
  return `${year}년 ${month}월 ${day}일`;
}

export { formatKoreanHistoryDate };
