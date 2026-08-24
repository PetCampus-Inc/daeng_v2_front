/**
 * 보호자 유치원 연결 신청 내역 API
 * `GET /api/v0/guardian/applications`
 */

const GUARDIAN_APPLICATION_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  REJECTED: 'rejected',
  DISCONNECTED: 'disconnected',
  CANCELLED: 'cancelled',
} as const;

type GuardianApplicationStatus =
  (typeof GUARDIAN_APPLICATION_STATUS)[keyof typeof GUARDIAN_APPLICATION_STATUS];

const GUARDIAN_APPLICATION_GENDER = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
} as const;

type GuardianApplicationGender =
  (typeof GUARDIAN_APPLICATION_GENDER)[keyof typeof GUARDIAN_APPLICATION_GENDER];

interface GuardianApplicationPetDto {
  petId?: number | string | null;
  name?: string | null;
  profileImage?: string | null;
  gender?: string | null;
  breed?: string | null;
}

interface GuardianApplicationSchoolDto {
  schoolId?: number | string | null;
  name?: string | null;
}

/** ISO 문자열 또는 Jackson LocalDateTime `[y,m,d,h,mi,s,nano]` (KST wall) */
type GuardianApplicationDateTime = string | number[];

interface GuardianApplicationDto {
  membershipId?: number | string | null;
  appliedAt?: GuardianApplicationDateTime | null;
  status?: string | null;
  pet?: GuardianApplicationPetDto | null;
  school?: GuardianApplicationSchoolDto | null;
  cancellable?: boolean | null;
}

interface GuardianApplicationsDataDto {
  applications?: GuardianApplicationDto[] | null;
}

/** `POST /api/v0/guardian/applications` 요청 본문 */
interface CreateGuardianApplicationRequest {
  token: string;
  petIds: number[];
}

/** 펫별 유치원 연결 신청 결과 */
interface CreateGuardianApplicationResult {
  petId: number;
  success: boolean;
  membershipId: number | null;
  reason: string | null;
}

interface CreateGuardianApplicationResponse {
  results: CreateGuardianApplicationResult[];
}

interface GuardianApplicationPet {
  id: string;
  name: string;
  gender?: GuardianApplicationGender;
  breed: string;
  imageUrl?: string;
}

interface GuardianApplication {
  id: string;
  status: GuardianApplicationStatus;
  /** ISO datetime — 신청일시 */
  appliedAt: string;
  pet: GuardianApplicationPet;
  kindergartenName: string;
  cancellable: boolean;
}

const STATUS_BY_API: Record<string, GuardianApplicationStatus> = {
  PENDING: GUARDIAN_APPLICATION_STATUS.PENDING,
  ACTIVE: GUARDIAN_APPLICATION_STATUS.ACTIVE,
  REJECTED: GUARDIAN_APPLICATION_STATUS.REJECTED,
  DISCONNECTED: GUARDIAN_APPLICATION_STATUS.DISCONNECTED,
  CANCELLED: GUARDIAN_APPLICATION_STATUS.CANCELLED,
};

function normalizeGender(value: unknown): GuardianApplicationGender | undefined {
  if (value === GUARDIAN_APPLICATION_GENDER.MALE) return GUARDIAN_APPLICATION_GENDER.MALE;
  if (value === GUARDIAN_APPLICATION_GENDER.FEMALE) return GUARDIAN_APPLICATION_GENDER.FEMALE;
  return undefined;
}

function toAbsoluteImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (/^(https?:|blob:|data:)/i.test(url)) return url;
  const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? '';
  return `${base}${url}`;
}

function toApplicationStatus(value: string | null | undefined): GuardianApplicationStatus | null {
  if (!value) return null;
  return STATUS_BY_API[value.toUpperCase()] ?? null;
}

function parseAppliedAt(value: GuardianApplicationDateTime | null | undefined): string {
  if (value == null) return '';

  if (typeof value === 'string') {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString();
  }

  if (!Array.isArray(value) || value.length < 5) return '';

  const [year, month, day, hour, minute, second = 0, nano = 0] = value;
  if (
    typeof year !== 'number' ||
    typeof month !== 'number' ||
    typeof day !== 'number' ||
    typeof hour !== 'number' ||
    typeof minute !== 'number' ||
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    return '';
  }

  const normalizedSecond = typeof second === 'number' && Number.isFinite(second) ? second : 0;
  const normalizedNano = typeof nano === 'number' && Number.isFinite(nano) ? nano : 0;
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    normalizedSecond < 0 ||
    normalizedSecond > 59 ||
    normalizedNano < 0 ||
    normalizedNano > 999_999_999
  ) {
    return '';
  }

  const millisecond = Math.floor(normalizedNano / 1_000_000);
  const date = new Date(Date.UTC(year, month - 1, day, hour - 9, minute, normalizedSecond, millisecond));
  if (Number.isNaN(date.getTime())) return '';

  // Date.UTC 정규화(2/31→3/3 등) 거부 — KST wall(hour-9)을 되돌린 값과 원본 비교
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  if (
    kst.getUTCFullYear() !== year ||
    kst.getUTCMonth() + 1 !== month ||
    kst.getUTCDate() !== day ||
    kst.getUTCHours() !== hour ||
    kst.getUTCMinutes() !== minute ||
    kst.getUTCSeconds() !== normalizedSecond
  ) {
    return '';
  }

  return date.toISOString();
}

function toGuardianApplication(dto: GuardianApplicationDto): GuardianApplication | null {
  if (dto.membershipId === null || dto.membershipId === undefined) return null;

  const status = toApplicationStatus(dto.status);
  if (!status) return null;

  const appliedAt = parseAppliedAt(dto.appliedAt);
  const imageUrl = toAbsoluteImageUrl(dto.pet?.profileImage);
  const gender = normalizeGender(dto.pet?.gender);

  return {
    id: String(dto.membershipId),
    status,
    appliedAt,
    pet: {
      id: dto.pet?.petId != null ? String(dto.pet.petId) : '',
      name: dto.pet?.name ?? '',
      ...(gender ? { gender } : {}),
      breed: dto.pet?.breed ?? '',
      ...(imageUrl ? { imageUrl } : {}),
    },
    kindergartenName: dto.school?.name ?? '',
    cancellable: dto.cancellable ?? status === GUARDIAN_APPLICATION_STATUS.PENDING,
  };
}

function toGuardianApplications(data: GuardianApplicationsDataDto | null | undefined) {
  const list = data?.applications ?? [];
  return list
    .map((item) => toGuardianApplication(item))
    .filter((item): item is GuardianApplication => item != null);
}

export {
  GUARDIAN_APPLICATION_GENDER,
  GUARDIAN_APPLICATION_STATUS,
  toGuardianApplication,
  toGuardianApplications,
};
export type {
  GuardianApplication,
  GuardianApplicationDto,
  GuardianApplicationGender,
  GuardianApplicationPet,
  GuardianApplicationPetDto,
  GuardianApplicationSchoolDto,
  GuardianApplicationStatus,
  GuardianApplicationsDataDto,
  CreateGuardianApplicationRequest,
  CreateGuardianApplicationResult,
  CreateGuardianApplicationResponse,
};
