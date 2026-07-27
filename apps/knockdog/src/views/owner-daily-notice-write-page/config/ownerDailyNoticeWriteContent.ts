export const ownerDailyNoticeWriteContent = Object.freeze({
  pageTitle: '알림장 작성',
  draftSaveLabel: '임시저장',
  conditionSectionLabel: '컨디션',
  snackSectionLabel: '간식',
  stoolSectionLabel: '배변',
  noticeSectionLabel: '알림장',
});

const CONDITION_OPTIONS = [
  { id: 'ENERGETIC', label: '활력 넘치게 지냈어요' },
  { id: 'NORMAL', label: '평소와 비슷했어요' },
  { id: 'CALM', label: '차분히 휴식했어요' },
  { id: 'CHECK_AFTER_RETURN', label: '귀가 후 살펴봐 주세요' },
] as const;

type ConditionOptionId = (typeof CONDITION_OPTIONS)[number]['id'];

const NOTICE_WRITE_SECTIONS = [
  { id: 'snack', label: ownerDailyNoticeWriteContent.snackSectionLabel },
  { id: 'stool', label: ownerDailyNoticeWriteContent.stoolSectionLabel },
  { id: 'notice', label: ownerDailyNoticeWriteContent.noticeSectionLabel },
] as const;

export { CONDITION_OPTIONS, NOTICE_WRITE_SECTIONS, type ConditionOptionId };
