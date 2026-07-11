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
