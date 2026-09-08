import type { NotificationType } from '@shared/lib/analytics';

const ATTENDANCE_TYPES = new Set([
  'ATTENDANCE_CHECK_IN',
  'ATTENDANCE_CANCEL_CHECK_IN',
  'ATTENDANCE_CHECK_OUT',
  'ATTENDANCE_CANCEL_CHECK_OUT',
]);

const NOTEBOOK_TYPES = new Set([
  'ATTENDANCE_RECORD_CREATED',
  'ATTENDANCE_RECORD_UPDATED',
  'DAILY_NOTICE_ARRIVED',
]);

const CONNECTION_TYPES = new Set([
  'GUARDIAN_APPLICATION_REQUESTED',
  'GUARDIAN_APPLICATION_CANCELLED',
  'SCHOOL_MEMBERSHIP_APPROVED',
  'SCHOOL_MEMBERSHIP_DISCONNECTED',
  'SCHOOL_MEMBERSHIP_SERVICE_ENDED',
  'SCHOOL_MEMBERSHIP_REJECTED',
  'CONNECTION_COMPLETED',
  'CONNECTION_APPLY_SENT',
]);

const ALBUM_TYPES = new Set(['ALBUM_PHOTO_UPLOADED']);

function resolveNotificationGaType(type: string): NotificationType | null {
  const normalized = type.trim().toUpperCase();

  if (ATTENDANCE_TYPES.has(normalized)) return 'attendance';
  if (NOTEBOOK_TYPES.has(normalized)) return 'notebook';
  if (CONNECTION_TYPES.has(normalized)) return 'connection';
  if (ALBUM_TYPES.has(normalized)) return 'album';

  console.warn('[analytics] unmapped notification type for notification_open', type);
  return null;
}

export { resolveNotificationGaType };
