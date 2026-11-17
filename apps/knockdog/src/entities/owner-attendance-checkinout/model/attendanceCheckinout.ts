type CheckinoutStatus = 'NOT_CHECKED_IN' | 'CHECKED_IN' | 'CHECKED_OUT' | 'ABSENT';
type TodayAttendanceFilter = 'CURRENTLY_IN' | 'UNSENT_RECORD' | 'ABSENT';
type ApiDateTime = string | number[];

interface AttendanceCheckinoutCandidateDto {
  petId: number;
  name: string;
  breed: string | null;
  gender: 'MALE' | 'FEMALE' | string | null;
  weight: number | null;
  birthYear?: number | null;
  profileImage: string | null;
  reservationId?: number | null;
  /** 등원 예정 시간 (KST, `HH:mm`) */
  reservedTime?: string | null;
  requestMemo?: string | null;
  firstAttendance?: boolean | null;
  status: CheckinoutStatus | string;
  checkInAt?: ApiDateTime | null;
  checkOutAt?: ApiDateTime | null;
}

interface AttendanceCheckinoutCandidatesDto {
  totalCount?: number;
  items?: AttendanceCheckinoutCandidateDto[] | null;
}

interface AttendanceCheckinoutTodayItemDto extends AttendanceCheckinoutCandidateDto {
  tag?: string | null;
  disconnected?: boolean | null;
  attendanceRecordSent?: boolean | null;
  attendanceRecordId?: number | null;
}

interface AttendanceCheckinoutTodayCountsDto {
  all?: number | null;
  currentlyIn?: number | null;
  unsentRecord?: number | null;
  absent?: number | null;
}

interface AttendanceCheckinoutTodayDto {
  totalCount?: number;
  counts?: AttendanceCheckinoutTodayCountsDto | null;
  items?: AttendanceCheckinoutTodayItemDto[] | null;
}

interface AttendanceCheckinoutSummaryDto {
  date?: string | number[] | null;
  reservationSettingConfigured?: boolean | null;
  /** 하루 정원. null이면 제한 없음 */
  dailyCapacity?: number | null;
  reservedCount?: number | null;
  checkedInCount?: number | null;
  absentCount?: number | null;
  checkedOutCount?: number | null;
  notCheckedOutCount?: number | null;
}

interface AttendanceCheckinoutCandidate {
  petId: string;
  name: string;
  gender: 'MALE' | 'FEMALE' | null;
  breed: string;
  weightKg: number | null;
  birthYear: number | null;
  profileImageUrl: string | null;
  reservationId: string | null;
  reservedTime: string;
  requestMemo: string | null;
  firstAttendance: boolean;
  status: CheckinoutStatus;
  checkInAt: string | null;
  checkOutAt: string | null;
}

interface AttendanceCheckinoutTodayItem extends AttendanceCheckinoutCandidate {
  disconnected: boolean;
  attendanceRecordSent: boolean;
  attendanceRecordId: string | null;
}

interface AttendanceCheckinoutTodayCounts {
  all: number;
  currentlyIn: number;
  unsentRecord: number;
  absent: number;
}

interface AttendanceCheckinoutCandidates {
  totalCount: number;
  items: AttendanceCheckinoutCandidate[];
}

interface AttendanceCheckinoutToday {
  totalCount: number;
  counts: AttendanceCheckinoutTodayCounts;
  items: AttendanceCheckinoutTodayItem[];
}

interface AttendanceCheckinoutSummary {
  date: string | null;
  /** false면 일과 화면 대신 등원 가능 시간 설정 안내를 보여준다 */
  reservationSettingConfigured: boolean;
  /** 하루 정원. null이면 제한 없음 */
  dailyCapacity: number | null;
  reservedCount: number;
  checkedInCount: number;
  absentCount: number;
  checkedOutCount: number;
  notCheckedOutCount: number;
}

function normalizeCheckinoutStatus(value: unknown): CheckinoutStatus {
  if (value === 'CHECKED_IN') return 'CHECKED_IN';
  if (value === 'CHECKED_OUT') return 'CHECKED_OUT';
  if (value === 'ABSENT') return 'ABSENT';
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
      Date.UTC(year, month - 1, day, hour - 9, minute, second, Math.floor(nanosecond / 1_000_000))
    ).toISOString();
  }

  return null;
}

function toCount(value: unknown) {
  return typeof value === 'number' ? value : 0;
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
    birthYear: typeof dto.birthYear === 'number' ? dto.birthYear : null,
    profileImageUrl: dto.profileImage ?? null,
    reservationId: dto.reservationId != null ? String(dto.reservationId) : null,
    reservedTime: dto.reservedTime ?? '',
    requestMemo: dto.requestMemo?.trim() ? dto.requestMemo : null,
    firstAttendance: dto.firstAttendance === true,
    status: normalizeCheckinoutStatus(dto.status),
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
    disconnected: dto.disconnected === true,
    attendanceRecordSent: dto.attendanceRecordSent === true,
    attendanceRecordId: dto.attendanceRecordId != null ? String(dto.attendanceRecordId) : null,
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

function toAttendanceCheckinoutToday(dto: AttendanceCheckinoutTodayDto | null | undefined): AttendanceCheckinoutToday {
  const items = (dto?.items ?? [])
    .map(toAttendanceCheckinoutTodayItem)
    .filter((item): item is AttendanceCheckinoutTodayItem => item != null);

  return {
    totalCount: typeof dto?.totalCount === 'number' ? dto.totalCount : items.length,
    counts: {
      all: toCount(dto?.counts?.all),
      currentlyIn: toCount(dto?.counts?.currentlyIn),
      unsentRecord: toCount(dto?.counts?.unsentRecord),
      absent: toCount(dto?.counts?.absent),
    },
    items,
  };
}

function toAttendanceCheckinoutSummary(
  dto: AttendanceCheckinoutSummaryDto | null | undefined
): AttendanceCheckinoutSummary {
  return {
    date: normalizeDateKey(dto?.date),
    reservationSettingConfigured: dto?.reservationSettingConfigured === true,
    dailyCapacity: typeof dto?.dailyCapacity === 'number' ? dto.dailyCapacity : null,
    reservedCount: toCount(dto?.reservedCount),
    checkedInCount: toCount(dto?.checkedInCount),
    absentCount: toCount(dto?.absentCount),
    checkedOutCount: toCount(dto?.checkedOutCount),
    notCheckedOutCount: toCount(dto?.notCheckedOutCount),
  };
}

export {
  toAttendanceCheckinoutCandidate,
  toAttendanceCheckinoutCandidates,
  toAttendanceCheckinoutSummary,
  toAttendanceCheckinoutToday,
  toAttendanceCheckinoutTodayItem,
};
export type {
  AttendanceCheckinoutCandidate,
  AttendanceCheckinoutCandidateDto,
  AttendanceCheckinoutCandidates,
  AttendanceCheckinoutCandidatesDto,
  AttendanceCheckinoutSummary,
  AttendanceCheckinoutSummaryDto,
  AttendanceCheckinoutToday,
  AttendanceCheckinoutTodayCounts,
  AttendanceCheckinoutTodayCountsDto,
  AttendanceCheckinoutTodayDto,
  AttendanceCheckinoutTodayItem,
  AttendanceCheckinoutTodayItemDto,
  CheckinoutStatus,
  TodayAttendanceFilter,
};
