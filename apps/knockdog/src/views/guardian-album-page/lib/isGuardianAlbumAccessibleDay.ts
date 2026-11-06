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
 * 유치원에서 업로드한 사진이 있으면 등원 여부와 무관하게 접근 가능.
 * 등원 뱃지는 UI에서 `isAttended`로만 표시한다.
 * 오늘은 today API `isAttendedToday`도 허용(사진 업로드 전 등원 상태).
 */
function isGuardianAlbumAccessibleDay(
  day: GuardianAlbumAccessibleDay,
  { todayDateKey, isAttendedToday }: GuardianAlbumAccessibleDayContext
): boolean {
  if ((day.photoCount ?? 0) > 0) return true;
  if (day.dateKey === todayDateKey && isAttendedToday) return true;
  return day.isAttended;
}

export { isGuardianAlbumAccessibleDay };
export type { GuardianAlbumAccessibleDay, GuardianAlbumAccessibleDayContext };
