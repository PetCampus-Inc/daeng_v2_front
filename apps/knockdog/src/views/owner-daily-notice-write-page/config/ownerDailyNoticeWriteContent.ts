import { STOOL_STATUS_OPTIONS, type StoolStatus } from '@shared/ui/stool-status';

export const ownerDailyNoticeWriteContent = Object.freeze({
  pageTitle: '알림장 작성',
  draftSaveLabel: '임시저장',
  editButtonLabel: '수정하기',
  conditionSectionLabel: '컨디션',
  snackSectionLabel: '간식',
  snackPlaceholder: '최대 50자까지 작성 가능해요',
  snackMaxLength: 50,
  stoolSectionLabel: '배변',
  stoolMemoPlaceholder: '최대 50자까지 작성 가능해요',
  stoolMemoMaxLength: 50,
  noticeSectionLabel: '알림장',
  noticePlaceholder: '700자 이내로 작성해 주세요',
  noticeMaxLength: 700,
  loadTemplateLabel: '템플릿 불러오기',
  sendButtonLabel: '알림장 보내기',
  guardianLabel: '보호자',
  emptyDraftTitle: '작성한 내용이 없어요',
  emptyDraftDescription: '내용을 입력한 뒤 다시 시도해 주세요.',
  emptyDraftConfirmLabel: '확인',
  sendConfirmTitle: '알림장을 보낼까요?',
  sendConfirmDescription: '빠진 내용은 없는지 다시 한번 확인해 주세요.',
  editSendConfirmTitle: '수정한 알림장을 보낼까요?',
  editSendConfirmDescription: '보내면 보호자에게 수정 알림이 가요.',
  sendConfirmCloseLabel: '닫기',
  sendConfirmActionLabel: '보내기',
  sendFailedTitle: '알림장을 보내지 못했어요',
  sendFailedDescription: '작성한 내용은 임시저장했어요.\n잠시 후 다시 시도해 주세요.',
  sendFailedCloseLabel: '닫기',
  sendFailedRetryLabel: '다시 시도',
  loadTemplateConfirmTitle: '템플릿을 불러올까요?',
  loadTemplateConfirmDescription: '불러오면 현재 작성 중인 내용이 사라져요.',
  loadTemplateConfirmNoLabel: '아니요',
  loadTemplateConfirmYesLabel: '예',
  resumeDraftTitle: '작성하던 알림장이 있어요.',
  resumeDraftDescription: '임시저장한 내용을 이어서 쓸까요?',
  resumeDraftNewLabel: '새로 쓰기',
  resumeDraftContinueLabel: '이어 쓰기',
  expiredTitle: '작성 가능한 시간이 지났어요',
  expiredDescription: '지난 알림장은\n원생 프로필에서 확인할 수 있어요.',
  expiredConfirmLabel: '확인',
});

/** 퍼블리싱용 목 원생 정보 (API 연동 전) */
interface NoticeWriteMockStudent {
  name: string;
  gender: 'MALE' | 'FEMALE';
  breed: string;
  weightKg: number;
  age: number;
  profileImageUrl: string;
  guardianName: string;
}

const NOTICE_WRITE_MOCK_STUDENT: NoticeWriteMockStudent = {
  name: '뽀삐',
  gender: 'FEMALE',
  breed: '시베리안 허스키',
  weightKg: 8,
  age: 3,
  profileImageUrl: '',
  guardianName: '김민지',
};

const CONDITION_OPTIONS = [
  { id: 'ENERGETIC', label: '활력 넘치게 지냈어요' },
  { id: 'NORMAL', label: '평소와 비슷했어요' },
  { id: 'CALM', label: '차분히 휴식했어요' },
  { id: 'CHECK_AFTER_RETURN', label: '귀가 후 살펴봐 주세요' },
] as const;

type ConditionOptionId = (typeof CONDITION_OPTIONS)[number]['id'];

/** 알림장 작성용 배변 옵션 순서 */
const NOTICE_WRITE_STOOL_OPTIONS = STOOL_STATUS_OPTIONS;

type NoticeWriteStoolStatus = StoolStatus;

export {
  CONDITION_OPTIONS,
  NOTICE_WRITE_MOCK_STUDENT,
  NOTICE_WRITE_STOOL_OPTIONS,
  type ConditionOptionId,
  type NoticeWriteStoolStatus,
};
