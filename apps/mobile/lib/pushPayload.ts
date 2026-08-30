export type PushDestination =
  | { kind: 'guardianKindergarten'; petId: string; date?: string; dedupeKey: string }
  | { kind: 'attendanceRecord'; petId: string; date: string; dedupeKey: string }
  | { kind: 'ownerMemberApprovals'; dedupeKey: string }
  | { kind: 'connectionApplyStatus'; dedupeKey: string }
  | { kind: 'album'; schoolId: string; date: string; petId?: string; dedupeKey: string }
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
  'SCHOOL_MEMBERSHIP_DISCONNECTED',
  'SCHOOL_MEMBERSHIP_SERVICE_ENDED',
  'connection_completed',
]);

const CONNECTION_APPLY_TYPES = new Set(['connection_apply_sent', 'SCHOOL_MEMBERSHIP_REJECTED']);

const ALBUM_TYPES = new Set(['album_photo_uploaded', 'ALBUM_PHOTO_UPLOADED']);

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function parseJsonRecord(value: unknown): UnknownRecord | null {
  if (isRecord(value)) return value;
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed.startsWith('{')) return null;

  try {
    const parsed: unknown = JSON.parse(trimmed);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function normalizePushPayload(value: unknown): UnknownRecord | null {
  const root = parseJsonRecord(value);
  if (!root) return null;

  const flattened: UnknownRecord = { ...root };
  for (const [key, raw] of Object.entries(root)) {
    const parsed = parseJsonRecord(raw);
    if (parsed) flattened[key] = parsed;
  }

  const nested = [flattened.payload, flattened.data, flattened.body]
    .map(parseJsonRecord)
    .filter((item): item is UnknownRecord => item !== null);

  return nested.reduce((merged, item) => ({ ...item, ...merged }), flattened);
}

function toPositiveId(value: unknown): string | null {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return Number.isSafeInteger(parsed) && parsed > 0 ? String(parsed) : null;
}

function toDateKey(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const day = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const [yearText, monthText, dayText] = day.split('-');
  const date = new Date(Number(yearText), Number(monthText) - 1, Number(dayText));
  return date.getFullYear() === Number(yearText) && date.getMonth() === Number(monthText) - 1 && date.getDate() === Number(dayText)
    ? day
    : null;
}

function toNonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function isSupportedPayloadVersion(value: unknown) {
  return (typeof value === 'string' ? Number(value) : value) === 1;
}

/** FCM data는 문자열로 전달되므로 type별 최소 라우팅 식별자만 검증한다. */
export function resolvePushDestination(value: unknown): PushDestination {
  const payload = normalizePushPayload(value);
  if (!payload || !isSupportedPayloadVersion(payload.payloadVersion) || typeof payload.type !== 'string') {
    return { kind: 'fallback' };
  }

  if (ATTENDANCE_STATUS_TYPES.has(payload.type)) {
    const petId = toPositiveId(payload.petId);
    const date = toDateKey(payload.date);
    const eventId = toNonEmptyString(payload.eventId);
    return petId && date && eventId
      ? { kind: 'guardianKindergarten', petId, date, dedupeKey: eventId }
      : { kind: 'fallback' };
  }

  if (ATTENDANCE_RECORD_TYPES.has(payload.type)) {
    const petId = toPositiveId(payload.petId);
    const date = toDateKey(payload.date);
    return petId && date
      ? { kind: 'attendanceRecord', petId, date, dedupeKey: `${payload.type}:${petId}:${date}` }
      : { kind: 'fallback' };
  }

  if (OWNER_MEMBER_APPROVAL_TYPES.has(payload.type)) {
    return { kind: 'ownerMemberApprovals', dedupeKey: payload.type };
  }

  if (CONNECTION_APPLY_TYPES.has(payload.type)) {
    return { kind: 'connectionApplyStatus', dedupeKey: payload.type };
  }

  if (GUARDIAN_KINDERGARTEN_TYPES.has(payload.type)) {
    const petId = toPositiveId(payload.petId);
    return petId
      ? { kind: 'guardianKindergarten', petId, dedupeKey: `${payload.type}:${petId}` }
      : { kind: 'fallback' };
  }

  if (ALBUM_TYPES.has(payload.type)) {
    const schoolId = toPositiveId(payload.schoolId);
    const date = toDateKey(payload.date);
    const petId = toPositiveId(payload.petId);
    return schoolId && date
      ? { kind: 'album', schoolId, date, petId: petId ?? undefined, dedupeKey: `${payload.type}:${schoolId}:${date}` }
      : { kind: 'fallback' };
  }

  return { kind: 'fallback' };
}
