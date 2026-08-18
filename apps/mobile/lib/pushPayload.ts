export type PushDestination =
  | { kind: 'guardianKindergarten'; petId: string; date?: string; dedupeKey: string }
  | { kind: 'attendanceRecord'; petId: string; date: string; dedupeKey: string }
  | { kind: 'ownerMemberApprovals'; dedupeKey: string }
  | { kind: 'fallback' };

type UnknownRecord = Record<string, unknown>;

const ATTENDANCE_STATUS_TYPES = new Set([
  'ATTENDANCE_CHECK_IN',
  'ATTENDANCE_CANCEL_CHECK_IN',
  'ATTENDANCE_CHECK_OUT',
  'ATTENDANCE_CANCEL_CHECK_OUT',
]);

const ATTENDANCE_RECORD_TYPES = new Set(['ATTENDANCE_RECORD_CREATED', 'ATTENDANCE_RECORD_UPDATED']);

const OWNER_MEMBER_APPROVAL_TYPES = new Set(['GUARDIAN_APPLICATION_REQUESTED', 'GUARDIAN_APPLICATION_CANCELLED']);

const GUARDIAN_KINDERGARTEN_TYPES = new Set([
  'SCHOOL_MEMBERSHIP_APPROVED',
  'SCHOOL_MEMBERSHIP_REJECTED',
  'SCHOOL_MEMBERSHIP_DISCONNECTED',
]);

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toPositiveId(value: unknown): string | null {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return Number.isSafeInteger(parsed) && parsed > 0 ? String(parsed) : null;
}

function toDateKey(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : value;
}

function toNonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function isSupportedPayloadVersion(value: unknown) {
  return (typeof value === 'string' ? Number(value) : value) === 1;
}

/** FCM data는 문자열로 전달되므로 type별 최소 라우팅 식별자만 검증한다. */
export function resolvePushDestination(value: unknown): PushDestination {
  if (!isRecord(value) || !isSupportedPayloadVersion(value.payloadVersion) || typeof value.type !== 'string') {
    return { kind: 'fallback' };
  }

  if (ATTENDANCE_STATUS_TYPES.has(value.type)) {
    const petId = toPositiveId(value.petId);
    const date = toDateKey(value.date);
    const eventId = toNonEmptyString(value.eventId);
    return petId && date && eventId
      ? { kind: 'guardianKindergarten', petId, date, dedupeKey: eventId }
      : { kind: 'fallback' };
  }

  if (ATTENDANCE_RECORD_TYPES.has(value.type)) {
    const petId = toPositiveId(value.petId);
    const date = toDateKey(value.date);
    return petId && date
      ? { kind: 'attendanceRecord', petId, date, dedupeKey: `${value.type}:${petId}:${date}` }
      : { kind: 'fallback' };
  }

  if (OWNER_MEMBER_APPROVAL_TYPES.has(value.type)) {
    return { kind: 'ownerMemberApprovals', dedupeKey: value.type };
  }

  if (GUARDIAN_KINDERGARTEN_TYPES.has(value.type)) {
    const petId = toPositiveId(value.petId);
    return petId
      ? { kind: 'guardianKindergarten', petId, dedupeKey: `${value.type}:${petId}` }
      : { kind: 'fallback' };
  }

  return { kind: 'fallback' };
}
