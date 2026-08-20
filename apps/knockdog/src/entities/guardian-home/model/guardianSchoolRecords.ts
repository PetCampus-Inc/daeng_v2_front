import { parseApiDateTime } from './guardianHome';
import type { GuardianCalendarDailyNotice } from './guardianCalendarDetail';

type GuardianSchoolMembershipEvent = 'CONNECTED' | 'DISCONNECTED' | string;

interface GuardianSchoolRecordsMonthDto {
  year?: number | null;
  month?: string | null;
  monthValue?: number | null;
}

interface GuardianSchoolRecordNoteDto {
  condition?: string | null;
  poop?: string | null;
  content?: string | null;
  sentAt?: string | number[] | null;
}

interface GuardianSchoolRecordDayDto {
  date?: string | null;
  checkInAt?: string | number[] | null;
  checkOutAt?: string | number[] | null;
  note?: GuardianSchoolRecordNoteDto | null;
  albumFirstPhotoUrl?: string | null;
  membershipEvent?: GuardianSchoolMembershipEvent | null;
}

interface GuardianSchoolRecordsDto {
  yearMonth?: GuardianSchoolRecordsMonthDto | number[] | null;
  firstAvailableMonth?: GuardianSchoolRecordsMonthDto | number[] | null;
  lastAvailableMonth?: GuardianSchoolRecordsMonthDto | number[] | null;
  days?: GuardianSchoolRecordDayDto[] | null;
}

interface GuardianSchoolRecordDay {
  dateKey: string;
  date: Date;
  checkInAt: Date | null;
  checkOutAt: Date | null;
  dailyNotice: GuardianCalendarDailyNotice | null;
  thumbnailUrl: string | null;
  membershipEvent: GuardianSchoolMembershipEvent | null;
}

interface GuardianSchoolRecords {
  yearMonth: Date | null;
  firstAvailableMonth: Date | null;
  lastAvailableMonth: Date | null;
  days: GuardianSchoolRecordDay[];
}

const CONDITION_LABELS: Record<string, string> = {
  ENERGETIC: '활력 넘치게 지냈어요',
  USUAL: '평소와 비슷했어요',
  RESTED: '차분히 휴식했어요',
  WATCH_AFTER_RETURN: '귀가 후 확인이 필요해요',
};

const POOP_LABELS: Record<string, string> = {
  HEALTHY: '건강함',
  HARD: '딱딱함',
  LOOSE: '묽음',
  NEEDS_ATTENTION: '주의 필요',
  NONE: '배변 없음',
};

function toMonthDate(dto: GuardianSchoolRecordsMonthDto | number[] | null | undefined): Date | null {
  if (!dto) return null;

  if (Array.isArray(dto)) {
    const [year, month] = dto;
    if (!Number.isFinite(year) || !Number.isFinite(month)) return null;
    const zeroBasedMonth = Number(month) - 1;
    if (zeroBasedMonth < 0 || zeroBasedMonth > 11) return null;
    return new Date(Number(year), zeroBasedMonth, 1);
  }

  if (!Number.isFinite(dto.year)) return null;
  const year = Number(dto.year);
  const monthValueRaw = dto.monthValue ?? null;
  if (!Number.isFinite(monthValueRaw)) return null;
  const monthValue = Number(monthValueRaw);
  const zeroBasedMonth = monthValue >= 1 && monthValue <= 12 ? monthValue - 1 : monthValue;
  if (zeroBasedMonth < 0 || zeroBasedMonth > 11) return null;
  return new Date(year, zeroBasedMonth, 1);
}

function toDailyNotice(
  dto: GuardianSchoolRecordNoteDto | null | undefined
): GuardianCalendarDailyNotice | null {
  if (!dto) return null;
  const writtenAt = parseApiDateTime(dto.sentAt);
  if (!writtenAt) return null;

  const conditionKey = typeof dto.condition === 'string' ? dto.condition.toUpperCase() : '';
  const poopKey = typeof dto.poop === 'string' ? dto.poop.toUpperCase() : '';
  const conditionLabel = CONDITION_LABELS[conditionKey] ?? '';
  const stoolLabel = POOP_LABELS[poopKey] ?? '';

  return {
    writtenAt: writtenAt.toISOString(),
    updatedAt: null,
    conditionLabel,
    stoolLabel,
    poop: stoolLabel ? poopKey : null,
    snack: '',
    poopMemo: '',
    body: dto.content?.trim() ?? '',
  };
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toGuardianSchoolRecordDay(
  dto: GuardianSchoolRecordDayDto | null | undefined
): GuardianSchoolRecordDay | null {
  if (!dto) return null;
  const date = parseApiDateTime(dto.date);
  if (!date) return null;

  return {
    dateKey: toDateKey(date),
    date,
    checkInAt: parseApiDateTime(dto.checkInAt),
    checkOutAt: parseApiDateTime(dto.checkOutAt),
    dailyNotice: toDailyNotice(dto.note),
    thumbnailUrl: dto.albumFirstPhotoUrl?.trim() || null,
    membershipEvent: dto.membershipEvent ?? null,
  };
}

function toGuardianSchoolRecords(dto: GuardianSchoolRecordsDto | null | undefined): GuardianSchoolRecords {
  const days = (dto?.days ?? [])
    .map(toGuardianSchoolRecordDay)
    .filter((item): item is GuardianSchoolRecordDay => item != null)
    .sort((left, right) => right.date.getTime() - left.date.getTime());

  return {
    yearMonth: toMonthDate(dto?.yearMonth),
    firstAvailableMonth: toMonthDate(dto?.firstAvailableMonth),
    lastAvailableMonth: toMonthDate(dto?.lastAvailableMonth),
    days,
  };
}

export { toGuardianSchoolRecords };
export type {
  GuardianSchoolMembershipEvent,
  GuardianSchoolRecordDay,
  GuardianSchoolRecordDayDto,
  GuardianSchoolRecordNoteDto,
  GuardianSchoolRecords,
  GuardianSchoolRecordsDto,
  GuardianSchoolRecordsMonthDto,
};
