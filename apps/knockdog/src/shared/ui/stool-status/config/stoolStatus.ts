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

const STOOL_STATUS_IMAGE: Record<StoolStatus, string> = {
  NONE: '/images/stoolstatus_none.png',
  NORMAL: '/images/stoolstatus_normal.png',
  SOFT: '/images/stoolstatus_soft.png',
  HARD: '/images/stoolstatus_hard.png',
  CAUTION: '/images/stoolstatus_caution.png',
  ABNORMAL: '/images/stoolstatus_abnormal.png',
};

export { STOOL_STATUS, STOOL_STATUS_IMAGE, STOOL_STATUS_LABEL, type StoolStatus };
