type NotificationInboxDestination =
  | { kind: 'attendanceRecord'; petId: string; date: string }
  | { kind: 'guardianKindergarten'; petId: string; date?: string }
  | { kind: 'ownerMemberApprovals' }
  | { kind: 'ownerMembers' }
  | { kind: 'connectionApplyStatus' }
  | { kind: 'album'; petId?: string; schoolId?: string; date?: string }
  | { kind: 'kindergartenNews'; newsId: string; schoolId?: string }
  | { kind: 'guardianReservation'; petId?: string }
  | { kind: 'guardianReservationDetail'; petId: string; reservationId: string }
  | { kind: 'guardianTicketDetail'; petId: string; ticketId: string }
  | { kind: 'guardianConnectionHistory' }
  | { kind: 'ownerExpiringMembers' }
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

/** 원장 구성원 목록 — 보호자가 연결을 해제한 알림 */
const OWNER_MEMBERS_TYPES = new Set(['GUARDIAN_MEMBERSHIP_DISCONNECTED', 'GUARDIAN_DISCONNECTED']);

const GUARDIAN_KINDERGARTEN_TYPES = new Set([
  'SCHOOL_MEMBERSHIP_APPROVED',
  'SCHOOL_MEMBERSHIP_SERVICE_ENDED',
  'connection_completed',
]);

/** 원장이 연결을 해제하면 유치원 연결 이력 */
const CONNECTION_HISTORY_TYPES = new Set(['SCHOOL_MEMBERSHIP_DISCONNECTED']);

const CONNECTION_APPLY_TYPES = new Set(['connection_apply_sent', 'SCHOOL_MEMBERSHIP_REJECTED']);

const ALBUM_TYPES = new Set(['album_photo_uploaded', 'ALBUM_PHOTO_UPLOADED']);

const KINDERGARTEN_NEWS_TYPES = new Set([
  'KINDERGARTEN_NEWS_CREATED',
  'KINDERGARTEN_NEWS_UPDATED',
  'KINDERGARTEN_NEWS_REMINDED',
]);

/** 보호자 이용권 알림 — 예약 탭. petId가 있으면 그 강아지를 맞춘다. */
const GUARDIAN_TICKET_TYPES = new Set([
  'PET_TICKET_CHARGED',
  'PET_TICKET_HOLD_CANCELED',
  'PET_TICKET_HOLD_ENDED',
  'PET_TICKET_EXPIRY_EXTENDED',
  'PET_TICKET_EXPIRING',
  'PET_TICKET_ONE_LEFT',
  'PET_TICKET_STARTED',
]);

/** 이용권을 모두 쓴 알림 — 그 이용권 상세 */
const TICKET_DETAIL_TYPES = new Set(['PET_TICKET_EXHAUSTED']);

/** 등원 전날 리마인드 — 예약 상세 */
const RESERVATION_DETAIL_TYPES = new Set(['RESERVATION_REMINDER']);

/** 원장 이용권 만료 예정 — 구성원 목록(만료예정) */
const OWNER_TICKET_EXPIRING_TYPES = new Set(['PET_TICKET_EXPIRING_OWNER']);

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
  const newsId = toPositiveId(payload.newsId);
  const reservationId = toPositiveId(payload.reservationId);
  const ticketId = toPositiveId(payload.ticketId);
  const date = toDateKey(payload.date);

  if (ATTENDANCE_RECORD_TYPES.has(type)) {
    return petId && date ? { kind: 'attendanceRecord', petId, date } : { kind: 'unavailable' };
  }

  if (ATTENDANCE_STATUS_TYPES.has(type)) {
    return petId ? { kind: 'guardianKindergarten', petId, date: date ?? undefined } : { kind: 'unavailable' };
  }

  if (CONNECTION_HISTORY_TYPES.has(type)) {
    return { kind: 'guardianConnectionHistory' };
  }

  if (GUARDIAN_KINDERGARTEN_TYPES.has(type)) {
    return petId ? { kind: 'guardianKindergarten', petId } : { kind: 'unavailable' };
  }

  if (OWNER_MEMBER_APPROVAL_TYPES.has(type)) {
    return { kind: 'ownerMemberApprovals' };
  }

  if (OWNER_MEMBERS_TYPES.has(type)) {
    return { kind: 'ownerMembers' };
  }

  if (CONNECTION_APPLY_TYPES.has(type)) {
    return { kind: 'connectionApplyStatus' };
  }

  if (ALBUM_TYPES.has(type)) {
    return { kind: 'album', petId: petId ?? undefined, schoolId: schoolId ?? undefined, date: date ?? undefined };
  }

  if (KINDERGARTEN_NEWS_TYPES.has(type)) {
    return newsId
      ? { kind: 'kindergartenNews', newsId, schoolId: schoolId ?? undefined }
      : { kind: 'unavailable' };
  }

  if (RESERVATION_DETAIL_TYPES.has(type)) {
    return petId && reservationId
      ? { kind: 'guardianReservationDetail', petId, reservationId }
      : { kind: 'unavailable' };
  }

  if (TICKET_DETAIL_TYPES.has(type)) {
    return petId && ticketId ? { kind: 'guardianTicketDetail', petId, ticketId } : { kind: 'unavailable' };
  }

  if (GUARDIAN_TICKET_TYPES.has(type)) {
    return { kind: 'guardianReservation', petId: petId ?? undefined };
  }

  if (OWNER_TICKET_EXPIRING_TYPES.has(type)) {
    return { kind: 'ownerExpiringMembers' };
  }

  return { kind: 'unavailable' };
}

export { resolveNotificationInboxDestination };
export type { NotificationInboxDestination };
