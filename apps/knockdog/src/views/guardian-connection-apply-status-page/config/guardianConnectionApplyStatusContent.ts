const guardianConnectionApplyStatusContent = {
  pageTitle: '연결 신청 현황',
  /** 초대 신청 완료 CTA로 진입한 경우 뒤로가기 분기용 */
  entryFromInviteComplete: 'invite-complete',
  empty: {
    imageSrc: '/images/image_guardian_kindergarten_apply_none.png',
    imageAlt: '연결 신청 내역 없음',
    title: '연결 신청 내역이 없어요',
    description: '다니는 유치원에 초대를 요청해 보세요.',
  },
  statusLabel: {
    pending: '승인 대기',
    rejected: '승인 거절',
    approved: '승인 완료',
    cancelled: '신청 취소',
  },
  cancelButtonLabel: '신청 취소',
  appliedAtSuffix: '신청',
  cancelSheet: {
    title: '신청을 취소할까요?',
    closeLabel: '닫기',
    confirmLabel: '신청 취소',
  },
  cancelFailToast: '일시적 오류로 요청을 완료하지 못했어요',
  /** 원장 알림(퍼블리싱: 실제 전송은 API 연동 시) */
  directorCancelNotification: {
    title: '보호자가 등록 신청을 취소했어요',
    body: (petName: string) => `${petName}가 승인 대기 목록에서 제외됐어요.`,
  },
} as const;

export { guardianConnectionApplyStatusContent };
