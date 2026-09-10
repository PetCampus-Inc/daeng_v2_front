interface GuardianAlbumAccessibleDay {
  dateKey: string;
  isAttended: boolean;
  photoCount?: number;
}

interface GuardianAlbumAccessibleDayContext {
  /** YYYY-MM-DD */
  todayDateKey: string;
  isAttendedToday: boolean;
}

/**
 * 정책: 등원(체크인)한 날만 앨범 사진 접근 가능.
 * 오늘은 today API `isAttendedToday` 우선하되,
 * 연결 해제 후 today API attended가 false여도 month day 등원/사진이 있으면 접근 허용.
 */
function isGuardianAlbumAccessibleDay(
  day: GuardianAlbumAccessibleDay,
  { todayDateKey, isAttendedToday }: GuardianAlbumAccessibleDayContext
): boolean {
  if (day.dateKey === todayDateKey) {
    if (isAttendedToday) return true;
    if (day.isAttended) return true;
    if ((day.photoCount ?? 0) > 0) return true;
    return false;
  }
  return day.isAttended;
}

export { isGuardianAlbumAccessibleDay };
export type { GuardianAlbumAccessibleDay, GuardianAlbumAccessibleDayContext };
