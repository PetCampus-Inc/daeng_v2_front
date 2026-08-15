/** 연결 신청 건 상태 (강아지별 1건) */
const GUARDIAN_CONNECTION_APPLY_STATUS = {
  PENDING: 'pending',
  REJECTED: 'rejected',
  APPROVED: 'approved',
  CANCELLED: 'cancelled',
} as const;

type GuardianConnectionApplyStatus =
  (typeof GUARDIAN_CONNECTION_APPLY_STATUS)[keyof typeof GUARDIAN_CONNECTION_APPLY_STATUS];

const GUARDIAN_CONNECTION_APPLY_GENDER = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
} as const;

type GuardianConnectionApplyGender =
  (typeof GUARDIAN_CONNECTION_APPLY_GENDER)[keyof typeof GUARDIAN_CONNECTION_APPLY_GENDER];

interface GuardianConnectionApplyItem {
  id: string;
  status: GuardianConnectionApplyStatus;
  /** ISO datetime — 신청일시 (최신순 정렬 기준) */
  appliedAt: string;
  pet: {
    id: string;
    name: string;
    gender: GuardianConnectionApplyGender;
    breed: string;
    imageUrl?: string;
  };
  kindergartenName: string;
}

export {
  GUARDIAN_CONNECTION_APPLY_STATUS,
  GUARDIAN_CONNECTION_APPLY_GENDER,
  type GuardianConnectionApplyStatus,
  type GuardianConnectionApplyGender,
  type GuardianConnectionApplyItem,
};
