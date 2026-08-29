type NotificationInboxDestination =
  | { kind: 'attendanceRecord'; petId: string; date: string }
  | { kind: 'guardianKindergarten'; petId: string; date?: string }
  | { kind: 'ownerMemberApprovals' }
  | { kind: 'connectionApplyStatus' }
  | { kind: 'album'; petId?: string; schoolId?: string; date?: string }
  | { kind: 'unavailable' };

const ATTENDANCE_STATUS_TYPES = new Set([
  'ATTENDANCE_CHECK_IN',
  'ATTENDANCE_CANCEL_CHECK_IN',
  'ATTENDANCE_CHECK_OUT',
  'ATTENDANCE_CANCEL_CHECK_OUT',
]);

const ATTENDANCE_RECORD_TYPES = new Set(['ATTENDANCE_RECORD_CREATED', 'ATTENDANCE_RECORD_UPDATED']);

const OWNER_MEMBER_APPROVAL_TYPES = new Set([
  'GUARDIAN_APPLICATION_REQUESTED',
  'GUARDIAN_APPLICATION_CANCELLED',
]);

const GUARDIAN_KINDERGARTEN_TYPES = new Set([
  'SCHOOL_MEMBERSHIP_APPROVED',
  'SCHOOL_MEMBERSHIP_DISCONNECTED',
  'SCHOOL_MEMBERSHIP_SERVICE_ENDED',
  'connection_completed',
]);

const CONNECTION_APPLY_TYPES = new Set(['connection_apply_sent', 'SCHOOL_MEMBERSHIP_REJECTED']);

const ALBUM_TYPES = new Set(['album_photo_uploaded', 'ALBUM_PHOTO_UPLOADED']);

function toPositiveId(value: unknown): string | null {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return Number.isSafeInteger(parsed) && parsed > 0 ? String(parsed) : null;
}

function toDateKey(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const [yearText, monthText, dayText] = value.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;

  const date = new Date(year, month - 1, day);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return value;
}

/** 알림 type + payload로 이동 대상을 고른다. FCM 라우팅과 동일한 계약. */
function resolveNotificationInboxDestination(
  type: string,
  payload: Record<string, unknown> = {}
): NotificationInboxDestination {
  const petId = toPositiveId(payload.petId);
  const schoolId = toPositiveId(payload.schoolId);
  const date = toDateKey(payload.date);

  if (ATTENDANCE_RECORD_TYPES.has(type)) {
    return petId && date ? { kind: 'attendanceRecord', petId, date } : { kind: 'unavailable' };
  }

  if (ATTENDANCE_STATUS_TYPES.has(type)) {
    return petId ? { kind: 'guardianKindergarten', petId, date: date ?? undefined } : { kind: 'unavailable' };
  }

  if (GUARDIAN_KINDERGARTEN_TYPES.has(type)) {
    return petId ? { kind: 'guardianKindergarten', petId } : { kind: 'unavailable' };
  }

  if (OWNER_MEMBER_APPROVAL_TYPES.has(type)) {
    return { kind: 'ownerMemberApprovals' };
  }

  if (CONNECTION_APPLY_TYPES.has(type)) {
    return { kind: 'connectionApplyStatus' };
  }

  if (ALBUM_TYPES.has(type)) {
    return { kind: 'album', petId: petId ?? undefined, schoolId: schoolId ?? undefined, date: date ?? undefined };
  }

  return { kind: 'unavailable' };
}

export { resolveNotificationInboxDestination };
export type { NotificationInboxDestination };
