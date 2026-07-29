import type { StoolStatus } from '@shared/ui/stool-status';

/** API 배변 상태 — swagger `HEALTHY` 기준, 묽음은 `LOOSE` (SOFT 아님) */
type AttendanceRecordPoop =
  | 'HEALTHY'
  | 'HARD'
  | 'LOOSE'
  | 'ABNORMAL'
  | 'CAUTION'
  | 'NONE';

type AttendanceRecordCondition =
  | 'ENERGETIC'
  | 'NORMAL'
  | 'CALM'
  | 'CHECK_AFTER_RETURN';

type AttendanceRecordStatus = 'DRAFT' | 'SENT';

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
  condition: AttendanceRecordCondition | null;
  snack: string | null;
  poop: AttendanceRecordPoop | string | null;
  poopMemo: string | null;
  note: string | null;
  status?: AttendanceRecordStatus | string | null;
}

interface AttendanceRecord {
  petId: number;
  date: string;
  condition: AttendanceRecordCondition | null;
  snack: string;
  poop: StoolStatus | null;
  poopMemo: string;
  note: string;
  status: AttendanceRecordStatus;
}

interface BuildAttendanceRecordPayloadInput {
  petId: string;
  date: string;
  condition: AttendanceRecordCondition | null;
  snack: string;
  poop: StoolStatus | null;
  poopMemo: string;
  note: string;
}

const STOOL_STATUS_TO_POOP: Record<StoolStatus, AttendanceRecordPoop> = {
  NORMAL: 'HEALTHY',
  HARD: 'HARD',
  SOFT: 'LOOSE',
  ABNORMAL: 'ABNORMAL',
  CAUTION: 'CAUTION',
  NONE: 'NONE',
};

const POOP_TO_STOOL_STATUS: Record<string, StoolStatus> = {
  HEALTHY: 'NORMAL',
  HARD: 'HARD',
  LOOSE: 'SOFT',
  SOFT: 'SOFT', // legacy 응답 호환
  ABNORMAL: 'ABNORMAL',
  CAUTION: 'CAUTION',
  NONE: 'NONE',
};

const ATTENDANCE_RECORD_CONDITIONS = new Set<AttendanceRecordCondition>([
  'ENERGETIC',
  'NORMAL',
  'CALM',
  'CHECK_AFTER_RETURN',
]);

const ATTENDANCE_RECORD_POOPS = new Set<string>([
  'HEALTHY',
  'HARD',
  'LOOSE',
  'SOFT',
  'ABNORMAL',
  'CAUTION',
  'NONE',
]);

function isAttendanceRecordCondition(value: unknown): value is AttendanceRecordCondition {
  return typeof value === 'string' && ATTENDANCE_RECORD_CONDITIONS.has(value as AttendanceRecordCondition);
}

function isAttendanceRecordPoop(value: unknown): value is string {
  return typeof value === 'string' && ATTENDANCE_RECORD_POOPS.has(value);
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

function getStringValue(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.length > 0) return value;
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
    condition: input.condition,
    snack: input.snack.trim(),
    poop: input.poop ? STOOL_STATUS_TO_POOP[input.poop] : null,
    poopMemo: input.poopMemo.trim(),
    note: input.note.trim(),
  };
}

function toAttendanceRecord(dto: unknown): AttendanceRecord | null {
  const record = getRecordCandidate(dto);
  if (!record) return null;

  const petId = getNumberLikeValue(record, ['petId', 'petID', 'pet_id']);
  const date =
    getStringValue(record, ['date', 'recordDate', 'attendanceDate']) ??
    new Date().toISOString().slice(0, 10);

  if (petId === null) return null;

  const condition = isAttendanceRecordCondition(record.condition) ? record.condition : null;
  const poop = isAttendanceRecordPoop(record.poop)
    ? (POOP_TO_STOOL_STATUS[record.poop] ?? null)
    : null;

  return {
    petId,
    date,
    condition,
    snack: typeof record.snack === 'string' ? record.snack : '',
    poop,
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
  type AttendanceRecord,
  type AttendanceRecordCondition,
  type AttendanceRecordDto,
  type AttendanceRecordPayload,
  type AttendanceRecordPoop,
  type AttendanceRecordStatus,
  type BuildAttendanceRecordPayloadInput,
};
