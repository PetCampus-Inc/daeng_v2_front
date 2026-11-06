const DAY_OF_WEEK = {
  MONDAY: '월요일',
  TUESDAY: '화요일',
  WEDNESDAY: '수요일',
  THURSDAY: '목요일',
  FRIDAY: '금요일',
  SATURDAY: '토요일',
  SUNDAY: '일요일',
} as const;

const DAY_OF_WEEK_ORDER = Object.keys(DAY_OF_WEEK) as (keyof typeof DAY_OF_WEEK)[];

/** 월→일 순으로 정렬. 요일 키가 아닌 값(HOLIDAY 등)은 뒤로 */
function sortDaysOfWeek(days: string[]): string[] {
  return [...days].sort((a, b) => {
    const aIndex = DAY_OF_WEEK_ORDER.indexOf(a as keyof typeof DAY_OF_WEEK);
    const bIndex = DAY_OF_WEEK_ORDER.indexOf(b as keyof typeof DAY_OF_WEEK);
    const aRank = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
    const bRank = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
    if (aRank !== bRank) return aRank - bRank;
    return a.localeCompare(b);
  });
}

export { DAY_OF_WEEK, sortDaysOfWeek };
