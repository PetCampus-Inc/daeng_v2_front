interface GuardianAttendanceDayMock {
  /** 원장 등원처리 시각. null이면 등원 전 */
  checkInAt: string | null;
  /** 헤더 알림 뱃지(AlarmLineActive) */
  hasUnreadAlarm: boolean;
  /** 알림장 유무. false면 note empty */
  hasDailyNotice: boolean;
  /**
   * 오늘 앨범 사진 수, 화면에 표시되는 사진 수임(0~3).
   * 실제 이미지는 선택견 profileImage로 mock 채움
   */
  albumPhotoCount: 0 | 1 | 2 | 3;
}

/**
 * API 연동 전 등원일 mock.
 * checkInAt만 채우면 등원 중 화면으로 분기됨
 */
const MOCK_ATTENDANCE_DAY: GuardianAttendanceDayMock = {
  // 오늘 오전 9시 등원 — 경과 시간 뱃지용
  checkInAt: (() => {
    const date = new Date();
    date.setHours(9, 0, 0, 0);
    return date.toISOString();
  })(),
  hasUnreadAlarm: true,
  hasDailyNotice: false,
  albumPhotoCount: 1,
};

export type { GuardianAttendanceDayMock };
export { MOCK_ATTENDANCE_DAY };
