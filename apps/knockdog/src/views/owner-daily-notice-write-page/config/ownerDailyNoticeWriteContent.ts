import { STOOL_STATUS, type StoolStatus } from '@shared/ui/stool-status';

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
  noticePlaceholder: '최대 700자까지 작성 가능해요',
  noticeMaxLength: 700,
  loadTemplateLabel: '템플릿 불러오기',
});

const CONDITION_OPTIONS = [
  { id: 'ENERGETIC', label: '활력 넘치게 지냈어요' },
  { id: 'NORMAL', label: '평소와 비슷했어요' },
  { id: 'CALM', label: '차분히 휴식했어요' },
  { id: 'CHECK_AFTER_RETURN', label: '귀가 후 살펴봐 주세요' },
] as const;

type ConditionOptionId = (typeof CONDITION_OPTIONS)[number]['id'];

/** 알림장 작성용 배변 옵션 (Figma 순서, ABNORMAL 제외) */
const NOTICE_WRITE_STOOL_OPTIONS = [
  STOOL_STATUS.NORMAL,
  STOOL_STATUS.HARD,
  STOOL_STATUS.SOFT,
  STOOL_STATUS.NONE,
  STOOL_STATUS.CAUTION,
] as const satisfies readonly StoolStatus[];

type NoticeWriteStoolStatus = (typeof NOTICE_WRITE_STOOL_OPTIONS)[number];

export {
  CONDITION_OPTIONS,
  NOTICE_WRITE_STOOL_OPTIONS,
  type ConditionOptionId,
  type NoticeWriteStoolStatus,
};
