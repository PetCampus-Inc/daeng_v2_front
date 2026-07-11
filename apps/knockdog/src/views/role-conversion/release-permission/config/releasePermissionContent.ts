export const releasePermissionContent = Object.freeze({
  headerTitle: '원장 권한 해제',
  imageSrc: '/images/img_signup_blocked.png',
  imageAlt: '원장 권한 해제',
  title: '권한을 해제할까요?',
  descriptionLine1: '해제 후 해당 유치원 관련 모든 권한을 잃고',
  descriptionLine2: '보호자 계정으로 전환돼요.',
  cancelButtonLabel: '아니오',
  confirmButtonLabel: '예',
  reasonTitle: '해제 이유를 알려 주세요',
  reasonEtcLabel: '사유',
  reasonEtcPlaceholder: '500자 이내로 입력해 주세요',
  reasonEtcMaxLength: 500,
  nextButtonLabel: '다음',
  exitModalTitle: '저장하지 않고 나갈까요?',
  exitModalDescription: '변경한 내용이 저장되지 않아요.',
  exitModalCancelLabel: '닫기',
  exitModalConfirmLabel: '나가기',
  verifyTitleLine1: '아래 유치원명을',
  verifyTitleLine2: '정확히 입력해 주세요',
  verifyInputPlaceholder: '이름을 입력해 주세요',
  releaseButtonLabel: '권한 해제하기',
  completeTitleLine1: '유치원 운영 권한이',
  completeTitleLine2: '해제됐어요',
  completeImageSrc: '/images/img_comingsoon.png',
  completeImageAlt: '운영 권한 해제 완료',
  completeHomeButtonLabel: '홈으로 이동하기',
});

export const RELEASE_PERMISSION_REASON = {
  CLOSURE: 'CLOSURE',
  SERVICE_STOP: 'SERVICE_STOP',
  ETC: 'ETC',
} as const;

export type ReleasePermissionReason =
  (typeof RELEASE_PERMISSION_REASON)[keyof typeof RELEASE_PERMISSION_REASON];

export const releasePermissionReasonOptions: {
  value: ReleasePermissionReason;
  label: string;
}[] = [
  { value: RELEASE_PERMISSION_REASON.CLOSURE, label: '폐업' },
  { value: RELEASE_PERMISSION_REASON.SERVICE_STOP, label: '서비스 사용 중지' },
  { value: RELEASE_PERMISSION_REASON.ETC, label: '기타' },
];
