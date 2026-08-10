import {
  GUARDIAN_INVITE_RESULT_STATUS,
  type GuardianInviteResultStatus,
} from './guardianInviteResultStatus';

interface GuardianInviteResultContent {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
  primaryButtonLabel: string;
  secondaryButtonLabel?: string;
}

const guardianInviteResultContent: Readonly<Record<GuardianInviteResultStatus, GuardianInviteResultContent>> = Object.freeze({
  [GUARDIAN_INVITE_RESULT_STATUS.SUCCESS]: {
    imageSrc: '/images/img_invite_application_complete.png',
    imageAlt: '유치원 연결 신청 완료',
    title: '연결 신청을 완료했어요!',
    description: '유치원에서 승인하면 최종 완료돼요.',
    primaryButtonLabel: '신청 내역 보기',
    secondaryButtonLabel: '홈으로 이동하기',
  },
  [GUARDIAN_INVITE_RESULT_STATUS.INVALID_INVITE]: {
    imageSrc: '/images/img_invite_invalid.png',
    imageAlt: '유효하지 않은 초대',
    title: '유효하지 않은 초대예요',
    description: '초대받은 유치원에 문의해 주세요.',
    primaryButtonLabel: '홈으로 이동하기',
  },
  [GUARDIAN_INVITE_RESULT_STATUS.APPLICATION_FAILED]: {
    imageSrc: '/images/img_invite_application_failed.png',
    imageAlt: '유치원 연결 신청 실패',
    title: '신청을 완료하지 못했어요',
    description: '아래 강아지의 유치원 등록을 다시 시도해 주세요.',
    primaryButtonLabel: '다시 시도',
    secondaryButtonLabel: '홈으로 이동하기',
  },
});

export { guardianInviteResultContent, type GuardianInviteResultContent };
