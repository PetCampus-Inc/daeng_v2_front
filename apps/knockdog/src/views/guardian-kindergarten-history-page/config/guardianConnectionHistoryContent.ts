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
  disconnectFailToast: '유치원 연결 해제에 실패했어요',
} as const;

export { guardianConnectionHistoryContent };
