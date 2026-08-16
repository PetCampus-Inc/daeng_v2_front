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

interface GuardianApplicationDto {
  membershipId?: number | string | null;
  appliedAt?: string | null;
  status?: string | null;
  pet?: GuardianApplicationPetDto | null;
  school?: GuardianApplicationSchoolDto | null;
  cancellable?: boolean | null;
}

interface GuardianApplicationsDataDto {
  applications?: GuardianApplicationDto[] | null;
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

function toApplicationStatus(value: string | null | undefined): GuardianApplicationStatus {
  if (!value) return GUARDIAN_APPLICATION_STATUS.PENDING;
  return STATUS_BY_API[value.toUpperCase()] ?? GUARDIAN_APPLICATION_STATUS.PENDING;
}

function toGuardianApplication(dto: GuardianApplicationDto): GuardianApplication | null {
  if (dto.membershipId === null || dto.membershipId === undefined) return null;

  const appliedAt = dto.appliedAt ?? '';
  const status = toApplicationStatus(dto.status);
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
};
