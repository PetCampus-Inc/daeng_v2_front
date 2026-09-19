const guardianConnectionHistoryContent = {
  pageTitle: '유치원 연결 이력',
  titleSuffix: '다녔던 유치원들이에요',
  subtitle: '그동안의 소중한 기록을 모아봤어요',
  currentLabel: '현재',
  attendanceBadgePrefix: '등원',
  attendanceBadgeSuffix: '회',
  disconnectButtonLabel: '연결 해제',
  disconnectDialog: {
    titleSuffix: '과의 연결을 해제할까요?',
    descriptionPrefix: '연결을 해제하면 ',
    descriptionSuffix: '의\n유치원 소식을 더 이상 받아볼 수 없어요.',
    cancelLabel: '닫기',
    confirmLabel: '연결 해제하기',
    /** 유치원명 10자 초과 시 말줄임 */
    nameMaxLength: 10,
  },
  /** 당일 등원 기록이 있을 때 */
  disconnectBlockedToast: '오늘은 등원 기록이 있어 연결을 해제할 수 없어요',
  /** API/네트워크 실패 */
  disconnectFailToast: '일시적 오류로 요청을 완료하지 못했어요',
  disconnectSuccessToastSuffix: '과의 연결을 해제했어요',
  /** 보호자 알림함/푸시 (서버 발송, 문구 폴백용) */
  guardianDisconnectNotification: {
    titleSuffix: '과의 연결이 해제됐어요',
    bodySuffix: '의 유치원 소식을 더 이상 받아볼 수 없어요.',
  },
  /** 원장 알림(푸시+알림함) — 실제 전송은 disconnect API 성공 시 서버 */
  directorDisconnectNotification: {
    title: '보호자가 유치원과의 연결을 해제했어요',
    body: (petName: string) => `${petName}가 구성원 목록에서 제외됐어요.`,
  },
} as const;

export { guardianConnectionHistoryContent };
