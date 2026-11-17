type DatePart = 'year' | 'month' | 'day';

/**
 * 해당 달의 일수를 돌려준다.
 * @param year 연도
 * @param monthIndex 0부터 시작하는 월 (0 = 1월)
 */
function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * 날짜의 연·월·일 중 하나만 offset만큼 바꾼다.
 * 바꾼 달에 없는 일(예: 11월 31일)이면 그 달의 마지막 날로 보정하고, 일 휠은 그 달 안에서만 돈다.
 */
function getDateWithPartChanged(date: Date, part: DatePart, offset: number) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  if (part === 'year') {
    const nextYear = year + offset;
    return new Date(nextYear, month, Math.min(day, getDaysInMonth(nextYear, month)));
  }

  if (part === 'month') {
    const nextMonth = (((month + offset) % 12) + 12) % 12;
    return new Date(year, nextMonth, Math.min(day, getDaysInMonth(year, nextMonth)));
  }

  const daysInMonth = getDaysInMonth(year, month);
  const nextDay = ((day - 1 + offset + daysInMonth) % daysInMonth) + 1;
  return new Date(year, month, nextDay);
}

export { getDateWithPartChanged, getDaysInMonth };
export type { DatePart };
