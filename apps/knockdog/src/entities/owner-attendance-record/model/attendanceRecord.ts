
import { formatKstTimeLabel } from '@shared/lib/calendar-date';

type AttendanceRecordPoop =
  | 'HEALTHY'
  | 'HARD'
  | 'LOOSE'
  | 'NONE'
  | 'NEEDS_ATTENTION';

type AttendanceRecordCondition =
  | 'ENERGETIC'
  | 'USUAL'
  | 'RESTED'
  | 'WATCH_AFTER_RETURN';

type AttendanceRecordStatus = 'DRAFT' | 'SENT';

type AttendanceRecordDateTime = string | number[];

interface AttendanceRecordPayload {
  petId: number;
  date: string;
  condition: AttendanceRecordCondition | null;
  snack: string;
  poop: AttendanceRecordPoop | null;
  poopMemo: string;
  note: string;
}

interface AttendanceRecordDto {
  petId: number | string;
  date: string;
  checkInAt?: AttendanceRecordDateTime | null;
  checkOutAt?: AttendanceRecordDateTime | null;
  condition: AttendanceRecordCondition | string | null;
  snack: string | null;
  poop: AttendanceRecordPoop | string | null;
  poopMemo: string | null;
  note: string | null;
  status?: AttendanceRecordStatus | string | null;
}

interface AttendanceRecord {
  petId: number;
  date: string;
  /** 화면 표기용 등원 시각 (예: `오전 9:00`) */
  checkIn: string | null;
  /** 화면 표기용 하원 시각 (예: `오후 5:05`) */
  checkOut: string | null;
  condition: AttendanceRecordCondition | null;
  snack: string;
  poop: AttendanceRecordPoop | null;
  poopMemo: string;
  note: string;
  status: AttendanceRecordStatus;
}

interface BuildAttendanceRecordPayloadInput {
  petId: string;
  date: string;
  condition: AttendanceRecordCondition | null;
  snack: string;
  poop: AttendanceRecordPoop | null;
  poopMemo: string;
  note: string;
}

const ATTENDANCE_RECORD_CONDITIONS = new Set<string>([
  'ENERGETIC',
  'USUAL',
  'RESTED',
  'WATCH_AFTER_RETURN',
]);

const ATTENDANCE_RECORD_POOPS = new Set<string>([
  'HEALTHY',
  'HARD',
  'LOOSE',
  'NONE',
  'NEEDS_ATTENTION',
]);

function normalizeAttendanceRecordCondition(value: unknown): AttendanceRecordCondition | null {
  if (typeof value !== 'string') return null;
  if (!ATTENDANCE_RECORD_CONDITIONS.has(value)) return null;
  return value as AttendanceRecordCondition;
}

function normalizeAttendanceRecordPoop(value: unknown): AttendanceRecordPoop | null {
  if (typeof value !== 'string') return null;
  if (!ATTENDANCE_RECORD_POOPS.has(value)) return null;
  return value as AttendanceRecordPoop;
}

function normalizeAttendanceRecordStatus(value: unknown): AttendanceRecordStatus {
  if (typeof value !== 'string') return 'DRAFT';

  const normalized = value.toUpperCase();
  if (normalized === 'DRAFT') return 'DRAFT';
  if (normalized === 'SENT') return 'SENT';

  return 'DRAFT';
}

function getRecordCandidate(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;
  const nestedRecord = record.attendanceRecord ?? record.record ?? record.result;

  if (nestedRecord && typeof nestedRecord === 'object') {
    return nestedRecord as Record<string, unknown>;
  }

  return record;
}

/** LocalDateTime string  → Date */
function normalizeDateTime(value: unknown): Date | null {
  if (typeof value === 'string' && value.length > 0) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (Array.isArray(value) && value.length >= 5) {
    const [year, month, day, hour, minute, second = 0, nanosecond = 0] = value;
    const parts = [year, month, day, hour, minute, second, nanosecond];
    if (!parts.every((part) => typeof part === 'number' && Number.isFinite(part))) return null;

    const date = new Date(
      Date.UTC(
        year,
        month - 1,
        day,
        hour - 9,
        minute,
        second,
        Math.floor(nanosecond / 1_000_000)
      )
    );
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

/** `checkInAt` / `checkOutAt`  */
function toAttendanceTimeLabel(value: unknown): string | null {
  const date = normalizeDateTime(value);
  return date ? formatKstTimeLabel(date) : null;
}

/** LocalDate `[y, m, d]` / `YYYY-MM-DD` */
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

function getNumberLikeValue(record: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'number' && Number.isFinite(value)) return value;

    if (typeof value === 'string') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return null;
}

function buildAttendanceRecordPayload(
  input: BuildAttendanceRecordPayloadInput
): AttendanceRecordPayload {
  const trimmedPetId = input.petId.trim();
  const petId = Number(trimmedPetId);

  if (!trimmedPetId || !Number.isFinite(petId)) {
    throw new Error('유효하지 않은 petId 입니다.');
  }

  return {
    petId,
    date: input.date,
    condition: normalizeAttendanceRecordCondition(input.condition),
    snack: input.snack.trim(),
    poop: normalizeAttendanceRecordPoop(input.poop),
    poopMemo: input.poopMemo.trim(),
    note: input.note.trim(),
  };
}

function toAttendanceRecord(
  dto: unknown,
  lookup?: { petId?: string; date?: string }
): AttendanceRecord | null {
  const record = getRecordCandidate(dto);
  if (!record) return null;

  const petId =
    getNumberLikeValue(record, ['petId', 'petID', 'pet_id']) ??
    (lookup?.petId != null ? getNumberLikeValue({ petId: lookup.petId }, ['petId']) : null);
  const date =
    normalizeDateKey(record.date) ??
    normalizeDateKey(record.recordDate) ??
    normalizeDateKey(record.attendanceDate) ??
    normalizeDateKey(lookup?.date);

  if (petId === null || date === null) return null;

  return {
    petId,
    date,
    checkIn: toAttendanceTimeLabel(record.checkInAt),
    checkOut: toAttendanceTimeLabel(record.checkOutAt),
    condition: normalizeAttendanceRecordCondition(record.condition),
    snack: typeof record.snack === 'string' ? record.snack : '',
    poop: normalizeAttendanceRecordPoop(record.poop),
    poopMemo: typeof record.poopMemo === 'string' ? record.poopMemo : '',
    note: typeof record.note === 'string' ? record.note : '',
    status: normalizeAttendanceRecordStatus(
      record.status ?? record.recordStatus ?? record.sendStatus
    ),
  };
}

function toAttendanceRecordDtoFromPayload(
  payload: AttendanceRecordPayload,
  status: AttendanceRecordStatus
): AttendanceRecordDto {
  return {
    petId: payload.petId,
    date: payload.date,
    condition: payload.condition,
    snack: payload.snack,
    poop: payload.poop,
    poopMemo: payload.poopMemo,
    note: payload.note,
    status,
  };
}

export {
  buildAttendanceRecordPayload,
  toAttendanceRecord,
  toAttendanceRecordDtoFromPayload,
  normalizeAttendanceRecordCondition,
  normalizeAttendanceRecordPoop,
  type AttendanceRecord,
  type AttendanceRecordCondition,
  type AttendanceRecordDto,
  type AttendanceRecordPayload,
  type AttendanceRecordPoop,
  type AttendanceRecordStatus,
  type BuildAttendanceRecordPayloadInput,
};
