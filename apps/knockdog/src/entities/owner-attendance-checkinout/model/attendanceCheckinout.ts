type CheckinoutStatus = 'NOT_CHECKED_IN' | 'CHECKED_IN' | 'CHECKED_OUT';

interface AttendanceCheckinoutCandidateDto {
  petId: number;
  name: string;
  breed: string | null;
  gender: 'MALE' | 'FEMALE' | string | null;
  weight: number | null;
  age: number | null;
  profileImage: string | null;
  checkinoutStatus: CheckinoutStatus | string;
}

interface AttendanceCheckinoutCandidatesDto {
  totalCount?: number;
  items?: AttendanceCheckinoutCandidateDto[] | null;
}

interface AttendanceCheckinoutSummaryDto {
  date?: string | number[] | null;
  checkedInCount?: number | null;
  currentlyInCount?: number | null;
  unsentAttendanceRecordCount?: number | null;
}

interface AttendanceCheckinoutActionDto {
  petId?: number | string;
  checkinoutStatus?: CheckinoutStatus | string | null;
  checkInAt?: string | null;
  checkOutAt?: string | null;
}

interface AttendanceCheckinoutCandidate {
  petId: string;
  name: string;
  gender: 'MALE' | 'FEMALE' | null;
  breed: string;
  weightKg: number | null;
  age: number | null;
  profileImageUrl: string | null;
  checkinoutStatus: CheckinoutStatus;
}

interface AttendanceCheckinoutCandidates {
  totalCount: number;
  items: AttendanceCheckinoutCandidate[];
}

interface AttendanceCheckinoutSummary {
  date: string | null;
  checkedInCount: number;
  currentlyInCount: number;
  unsentAttendanceRecordCount: number;
}

interface AttendanceCheckinoutAction {
  petId: string;
  checkinoutStatus: CheckinoutStatus;
  checkInAt: string | null;
  checkOutAt: string | null;
}

function normalizeCheckinoutStatus(value: unknown): CheckinoutStatus {
  if (value === 'CHECKED_IN') return 'CHECKED_IN';
  if (value === 'CHECKED_OUT') return 'CHECKED_OUT';
  return 'NOT_CHECKED_IN';
}

function normalizeGender(value: unknown): 'MALE' | 'FEMALE' | null {
  if (value === 'MALE') return 'MALE';
  if (value === 'FEMALE') return 'FEMALE';
  return null;
}

function normalizeDateKey(value: unknown): string | null {
  if (typeof value === 'string' && value.length > 0) {
    const datePart = value.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return datePart;
    return null;
  }

  if (Array.isArray(value) && value.length >= 3) {
    const [year, month, day] = value;
    if (
      typeof year === 'number' &&
      typeof month === 'number' &&
      typeof day === 'number' &&
      Number.isFinite(year) &&
      Number.isFinite(month) &&
      Number.isFinite(day)
    ) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  return null;
}

function toAttendanceCheckinoutCandidate(
  dto: AttendanceCheckinoutCandidateDto | null | undefined
): AttendanceCheckinoutCandidate | null {
  if (!dto || dto.petId == null) return null;

  return {
    petId: String(dto.petId),
    name: dto.name ?? '',
    gender: normalizeGender(dto.gender),
    breed: dto.breed ?? '',
    weightKg: typeof dto.weight === 'number' ? dto.weight : null,
    age: typeof dto.age === 'number' ? dto.age : null,
    profileImageUrl: dto.profileImage ?? null,
    checkinoutStatus: normalizeCheckinoutStatus(dto.checkinoutStatus),
  };
}

function toAttendanceCheckinoutCandidates(
  dto: AttendanceCheckinoutCandidatesDto | null | undefined
): AttendanceCheckinoutCandidates {
  const items = (dto?.items ?? [])
    .map(toAttendanceCheckinoutCandidate)
    .filter((item): item is AttendanceCheckinoutCandidate => item != null);

  return {
    totalCount: typeof dto?.totalCount === 'number' ? dto.totalCount : items.length,
    items,
  };
}

function toAttendanceCheckinoutSummary(
  dto: AttendanceCheckinoutSummaryDto | null | undefined
): AttendanceCheckinoutSummary {
  return {
    date: normalizeDateKey(dto?.date),
    checkedInCount: typeof dto?.checkedInCount === 'number' ? dto.checkedInCount : 0,
    currentlyInCount: typeof dto?.currentlyInCount === 'number' ? dto.currentlyInCount : 0,
    unsentAttendanceRecordCount:
      typeof dto?.unsentAttendanceRecordCount === 'number' ? dto.unsentAttendanceRecordCount : 0,
  };
}

function toAttendanceCheckinoutAction(
  dto: AttendanceCheckinoutActionDto | null | undefined
): AttendanceCheckinoutAction | null {
  if (!dto) return null;

  const petId =
    typeof dto.petId === 'number' || typeof dto.petId === 'string' ? String(dto.petId) : null;
  if (!petId) return null;

  return {
    petId,
    checkinoutStatus: normalizeCheckinoutStatus(dto.checkinoutStatus),
    checkInAt: typeof dto.checkInAt === 'string' ? dto.checkInAt : null,
    checkOutAt: typeof dto.checkOutAt === 'string' ? dto.checkOutAt : null,
  };
}

export {
  toAttendanceCheckinoutAction,
  toAttendanceCheckinoutCandidate,
  toAttendanceCheckinoutCandidates,
  toAttendanceCheckinoutSummary,
};
export type {
  AttendanceCheckinoutAction,
  AttendanceCheckinoutActionDto,
  AttendanceCheckinoutCandidate,
  AttendanceCheckinoutCandidateDto,
  AttendanceCheckinoutCandidates,
  AttendanceCheckinoutCandidatesDto,
  AttendanceCheckinoutSummary,
  AttendanceCheckinoutSummaryDto,
  CheckinoutStatus,
};
