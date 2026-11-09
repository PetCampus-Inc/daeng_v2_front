const guardianConnectionHistoryContent = {
  pageTitle: '유치원 연결 내역',
  titleSuffix: '다녔던 유치원들이에요',
  subtitle: '그동안의 소중한 기록을 모아봤어요',
  currentLabel: '현재',
  attendanceBadgePrefix: '등원',
  attendanceBadgeSuffix: '회',
  petSelector: {
    listLabel: '강아지 선택 목록',
    closeLabel: '강아지 선택 닫기',
  },
  currentSectionTitle: '지금 다니는 유치원',
  currentEmpty: '연결된 유치원이 없어요.',
  previousSectionTitle: '이전에 다녔던 유치원',
  emptyTitle: '아직 연결된 유치원이 없어요',
  emptyDescription: '다니는 유치원에 똑독을 알려보세요!',
  disconnectButtonLabel: '연결 해제',
  writeReviewButtonLabel: '리뷰 작성',
  disconnectDialog: {
    titleSuffix: '과의 연결을 해제할까요?',
    descriptionPrefix: '연결을 해제하면 ',
    descriptionSuffix: '의\n유치원 소식을 더 이상 받아볼 수 없어요.',
    cancelLabel: '닫기',
    confirmLabel: '연결 해제하기',
    /** 유치원명 10자 초과 시 말줄임 */
    nameMaxLength: 10,
  },
  blockedSheet: {
    title: '아직 연결을 해제할 수 없어요.',
    ticketsBody:
      '사용할 수 있는 이용권이 아직 남아 있어요. \n이용권을 다 쓰거나, 기한이 끝나야 해제할 수 있어요. \n남은 이용권 정리는 유치원에 문의해 주세요.',
    reservationBody:
      '아직 이용이 완료되지 않은 예약이 남아 있어요. \n예약이 이용 완료 상태가 되면 연결을 해제할 수 있어요. ',
    reservationTitleSuffix: ' 예약',
    reservationStatus: '등원 전',
    ticketRemainingSuffix: '회 남음',
    scrollableTicketCount: 3,
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
