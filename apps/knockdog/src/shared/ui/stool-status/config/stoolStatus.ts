const STOOL_STATUS = {
  NONE: 'NONE',
  NORMAL: 'NORMAL',
  SOFT: 'SOFT',
  HARD: 'HARD',
  CAUTION: 'CAUTION',
  ABNORMAL: 'ABNORMAL',
} as const;

type StoolStatus = (typeof STOOL_STATUS)[keyof typeof STOOL_STATUS];

const STOOL_STATUS_LABEL: Record<StoolStatus, string> = {
  NONE: '배변 없음',
  NORMAL: '건강함',
  SOFT: '묽음',
  HARD: '딱딱함',
  CAUTION: '주의 필요',
  ABNORMAL: '갈색이 아닌',
};

/** 선택 UI 표시 순서 (왼쪽 → 오른쪽 정렬) */
const STOOL_STATUS_OPTIONS = [
  STOOL_STATUS.NORMAL,
  STOOL_STATUS.HARD,
  STOOL_STATUS.SOFT,
  STOOL_STATUS.ABNORMAL,
  STOOL_STATUS.CAUTION,
  STOOL_STATUS.NONE,
] as const satisfies readonly StoolStatus[];

/** 선택/활성 상태 이미지 */
const STOOL_STATUS_IMAGE: Record<StoolStatus, string> = {
  NONE: '/images/stoolstatus_none.png',
  NORMAL: '/images/stoolstatus_normal.png',
  SOFT: '/images/stoolstatus_soft.png',
  HARD: '/images/stoolstatus_hard.png',
  CAUTION: '/images/stoolstatus_caution.png',
  ABNORMAL: '/images/stoolstatus_abnormal.png',
};

/** 미선택/기본 상태 이미지 */
const STOOL_STATUS_DEFAULT_IMAGE: Record<StoolStatus, string> = {
  NONE: '/images/stoolstatus_none_default.png',
  NORMAL: '/images/stoolstatus_normal_default.png',
  SOFT: '/images/stoolstatus_soft_default.png',
  HARD: '/images/stoolstatus_hard_default.png',
  CAUTION: '/images/stoolstatus_caution_default.png',
  ABNORMAL: '/images/stoolstatus_abnormal_default.png',
};

function getStoolStatusImage(status: StoolStatus, isSelected = true) {
  return isSelected ? STOOL_STATUS_IMAGE[status] : STOOL_STATUS_DEFAULT_IMAGE[status];
}

export {
  STOOL_STATUS,
  STOOL_STATUS_DEFAULT_IMAGE,
  STOOL_STATUS_IMAGE,
  STOOL_STATUS_LABEL,
  STOOL_STATUS_OPTIONS,
  getStoolStatusImage,
  type StoolStatus,
};
