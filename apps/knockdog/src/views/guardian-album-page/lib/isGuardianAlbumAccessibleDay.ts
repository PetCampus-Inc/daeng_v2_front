interface GuardianAlbumAccessibleDay {
  dateKey: string;
  isAttended: boolean;
}

interface GuardianAlbumAccessibleDayContext {
  /** YYYY-MM-DD */
  todayDateKey: string;
  isAttendedToday: boolean;
}

/** 정책: 등원(체크인)한 날만 앨범 사진 접근 가능. 오늘은 today API `isAttendedToday` 우선 */
function isGuardianAlbumAccessibleDay(
  day: GuardianAlbumAccessibleDay,
  { todayDateKey, isAttendedToday }: GuardianAlbumAccessibleDayContext
): boolean {
  if (day.dateKey === todayDateKey) return isAttendedToday;
  return day.isAttended;
}

export { isGuardianAlbumAccessibleDay };
export type { GuardianAlbumAccessibleDay, GuardianAlbumAccessibleDayContext };
