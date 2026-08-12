type CheckinoutStatus = 'NOT_CHECKED_IN' | 'CHECKED_IN' | 'CHECKED_OUT';
type TodayAttendanceFilter = 'CURRENTLY_IN' | 'UNSENT_RECORD';
type ApiDateTime = string | number[];

interface AttendanceCheckinoutCandidateDto {
  petId: number;
  name: string;
  breed: string | null;
  gender: 'MALE' | 'FEMALE' | string | null;
  weight: number | null;
  age: number | null;
  profileImage: string | null;
  checkinoutStatus: CheckinoutStatus | string;
  checkInAt?: ApiDateTime | null;
  checkOutAt?: ApiDateTime | null;
}

interface AttendanceCheckinoutCandidatesDto {
  totalCount?: number;
  items?: AttendanceCheckinoutCandidateDto[] | null;
}

/** candidates 필드 + 등/하원 시각·알림장 발송 여부 */
interface AttendanceCheckinoutTodayItemDto extends AttendanceCheckinoutCandidateDto {
  checkInAt?: ApiDateTime | null;
  checkOutAt?: ApiDateTime | null;
  attendanceRecordSent?: boolean | null;
  hasSentAttendanceRecord?: boolean | null;
  noticeSent?: boolean | null;
}

interface AttendanceCheckinoutTodayDto {
  totalCount?: number;
  items?: AttendanceCheckinoutTodayItemDto[] | null;
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
  checkInAt?: ApiDateTime | null;
  checkOutAt?: ApiDateTime | null;
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
  checkInAt: string | null;
  checkOutAt: string | null;
}

interface AttendanceCheckinoutTodayItem extends AttendanceCheckinoutCandidate {
  checkInAt: string | null;
  checkOutAt: string | null;
  attendanceRecordSent: boolean;
}

interface AttendanceCheckinoutCandidates {
  totalCount: number;
  items: AttendanceCheckinoutCandidate[];
}

interface AttendanceCheckinoutToday {
  totalCount: number;
  items: AttendanceCheckinoutTodayItem[];
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

function normalizeDateTime(value: unknown): string | null {
  if (typeof value === 'string' && value.length > 0) return value;

  if (Array.isArray(value) && value.length >= 5) {
    const [year, month, day, hour, minute, second = 0, nanosecond = 0] = value;
    const parts = [year, month, day, hour, minute, second, nanosecond];
    if (!parts.every((part) => typeof part === 'number' && Number.isFinite(part))) return null;

    return new Date(
      Date.UTC(
        year,
        month - 1,
        day,
        hour - 9,
        minute,
        second,
        Math.floor(nanosecond / 1_000_000)
      )
    ).toISOString();
  }

  return null;
}

function resolveAttendanceRecordSent(
  dto: Pick<
    AttendanceCheckinoutTodayItemDto,
    'attendanceRecordSent' | 'hasSentAttendanceRecord' | 'noticeSent'
  >
) {
  if (typeof dto.attendanceRecordSent === 'boolean') return dto.attendanceRecordSent;
  if (typeof dto.hasSentAttendanceRecord === 'boolean') return dto.hasSentAttendanceRecord;
  if (typeof dto.noticeSent === 'boolean') return dto.noticeSent;
  return false;
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
    checkInAt: normalizeDateTime(dto.checkInAt),
    checkOutAt: normalizeDateTime(dto.checkOutAt),
  };
}

function toAttendanceCheckinoutTodayItem(
  dto: AttendanceCheckinoutTodayItemDto | null | undefined
): AttendanceCheckinoutTodayItem | null {
  if (!dto) return null;

  const base = toAttendanceCheckinoutCandidate(dto);
  if (!base) return null;

  return {
    ...base,
    checkInAt: normalizeDateTime(dto.checkInAt),
    checkOutAt: normalizeDateTime(dto.checkOutAt),
    attendanceRecordSent: resolveAttendanceRecordSent(dto),
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

function toAttendanceCheckinoutToday(
  dto: AttendanceCheckinoutTodayDto | null | undefined
): AttendanceCheckinoutToday {
  const items = (dto?.items ?? [])
    .map(toAttendanceCheckinoutTodayItem)
    .filter((item): item is AttendanceCheckinoutTodayItem => item != null);

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
    checkInAt: normalizeDateTime(dto.checkInAt),
    checkOutAt: normalizeDateTime(dto.checkOutAt),
  };
}

export {
  toAttendanceCheckinoutAction,
  toAttendanceCheckinoutCandidate,
  toAttendanceCheckinoutCandidates,
  toAttendanceCheckinoutSummary,
  toAttendanceCheckinoutToday,
  toAttendanceCheckinoutTodayItem,
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
  AttendanceCheckinoutToday,
  AttendanceCheckinoutTodayDto,
  AttendanceCheckinoutTodayItem,
  AttendanceCheckinoutTodayItemDto,
  CheckinoutStatus,
  TodayAttendanceFilter,
};
