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
  'daily_notice_arrived',
]);

const CONNECTION_TYPES = new Set([
  'GUARDIAN_APPLICATION_REQUESTED',
  'GUARDIAN_APPLICATION_CANCELLED',
  'SCHOOL_MEMBERSHIP_APPROVED',
  'SCHOOL_MEMBERSHIP_DISCONNECTED',
  'SCHOOL_MEMBERSHIP_SERVICE_ENDED',
  'SCHOOL_MEMBERSHIP_REJECTED',
  'connection_completed',
  'connection_apply_sent',
]);

const ALBUM_TYPES = new Set(['album_photo_uploaded', 'ALBUM_PHOTO_UPLOADED']);

function resolveNotificationGaType(type: string): NotificationType | null {
  if (ATTENDANCE_TYPES.has(type)) return 'attendance';
  if (NOTEBOOK_TYPES.has(type)) return 'notebook';
  if (CONNECTION_TYPES.has(type)) return 'connection';
  if (ALBUM_TYPES.has(type)) return 'album';
  return null;
}

export { resolveNotificationGaType };
