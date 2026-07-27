import { STOOL_STATUS_OPTIONS, type StoolStatus } from '@shared/ui/stool-status';

export const ownerDailyNoticeWriteContent = Object.freeze({
  pageTitle: '알림장 작성',
  draftSaveLabel: '임시저장',
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
