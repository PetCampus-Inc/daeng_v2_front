export type PushDestination =
  | { kind: 'attendanceRecord'; attendanceRecordId: number; petId: number; date: string; schoolId: number }
  | { kind: 'fallback' };

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toPositiveInteger(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function toDateKey(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : value;
}

/**
 * Push data는 FCM을 거치며 모두 string일 수 있으므로 runtime에서 엄격히 검증한다.
 * 검증 실패는 예외가 아니라 fallback 목적지로 귀결되어야 한다.
 */
export function resolvePushDestination(value: unknown): PushDestination {
  if (!isRecord(value)) return { kind: 'fallback' };

  const payloadVersion = toPositiveInteger(value.payloadVersion);
  if (payloadVersion !== 1 || value.type !== 'ATTENDANCE_RECORD') return { kind: 'fallback' };

  const attendanceRecordId = toPositiveInteger(value.attendanceRecordId);
  const petId = toPositiveInteger(value.petId);
  const schoolId = toPositiveInteger(value.schoolId);
  const date = toDateKey(value.date);

  if (!attendanceRecordId || !petId || !schoolId || !date) return { kind: 'fallback' };

  return { kind: 'attendanceRecord', attendanceRecordId, petId, schoolId, date };
}
