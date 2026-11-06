const STOOL_STATUS = {
  HEALTHY: 'HEALTHY',
  HARD: 'HARD',
  LOOSE: 'LOOSE',
  NEEDS_ATTENTION: 'NEEDS_ATTENTION',
  NONE: 'NONE',
} as const;

type StoolStatus = (typeof STOOL_STATUS)[keyof typeof STOOL_STATUS];

const STOOL_STATUS_LABEL: Record<StoolStatus, string> = {
  HEALTHY: '건강함',
  HARD: '딱딱함',
  LOOSE: '묽음',
  NEEDS_ATTENTION: '주의 필요',
  NONE: '배변 없음',
};

/** 선택 UI 표시 순서 (왼쪽 → 오른쪽 정렬) */
const STOOL_STATUS_OPTIONS = [
  STOOL_STATUS.HEALTHY,
  STOOL_STATUS.HARD,
  STOOL_STATUS.LOOSE,
  STOOL_STATUS.NEEDS_ATTENTION,
  STOOL_STATUS.NONE,
] as const satisfies readonly StoolStatus[];

function isStoolStatus(value: unknown): value is StoolStatus {
  return typeof value === 'string' && value in STOOL_STATUS_LABEL;
}

/** 선택/활성 상태 이미지 */
const STOOL_STATUS_IMAGE: Record<StoolStatus, string> = {
  HEALTHY: '/images/stoolstatus_normal.png',
  HARD: '/images/stoolstatus_hard.png',
  LOOSE: '/images/stoolstatus_soft.png',
  NEEDS_ATTENTION: '/images/stoolstatus_caution.png',
  NONE: '/images/stoolstatus_none.png',
};

/** 미선택/기본 상태 이미지 */
const STOOL_STATUS_DEFAULT_IMAGE: Record<StoolStatus, string> = {
  HEALTHY: '/images/stoolstatus_normal_default.png',
  HARD: '/images/stoolstatus_hard_default.png',
  LOOSE: '/images/stoolstatus_soft_default.png',
  NEEDS_ATTENTION: '/images/stoolstatus_caution_default.png',
  NONE: '/images/stoolstatus_none_default.png',
};

/** 알림장 뱃지용 주황 아이콘 (SVG) */
const STOOL_STATUS_ACCENT_ICON: Record<StoolStatus, string> = {
  HEALTHY: '/images/stool_icon_healthy.svg',
  HARD: '/images/stool_icon_hard.svg',
  LOOSE: '/images/stool_icon_loose.svg',
  NEEDS_ATTENTION: '/images/stool_icon_needs_attention.svg',
  NONE: '/images/stool_icon_none.svg',
};

function getStoolStatusImage(status: StoolStatus, isSelected = true) {
  return isSelected ? STOOL_STATUS_IMAGE[status] : STOOL_STATUS_DEFAULT_IMAGE[status];
}

function getStoolStatusAccentIcon(status: StoolStatus) {
  return STOOL_STATUS_ACCENT_ICON[status];
}

export {
  STOOL_STATUS,
  STOOL_STATUS_ACCENT_ICON,
  STOOL_STATUS_DEFAULT_IMAGE,
  STOOL_STATUS_IMAGE,
  STOOL_STATUS_LABEL,
  STOOL_STATUS_OPTIONS,
  getStoolStatusAccentIcon,
  getStoolStatusImage,
  isStoolStatus,
  type StoolStatus,
};
