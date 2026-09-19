/** 알림함 알림 타입 (알림장 PRD + 서버 FCM type) */
const NOTIFICATION_INBOX_TYPE = {
  CONNECTION_COMPLETED: 'connection_completed',
  DAILY_NOTICE_ARRIVED: 'daily_notice_arrived',
  CONNECTION_APPLY_SENT: 'connection_apply_sent',
  ALBUM_PHOTO_UPLOADED: 'album_photo_uploaded',
  SCHOOL_MEMBERSHIP_APPROVED: 'SCHOOL_MEMBERSHIP_APPROVED',
  /** 보호자 측 — 유치원 연결 해제 완료 */
  SCHOOL_MEMBERSHIP_DISCONNECTED: 'SCHOOL_MEMBERSHIP_DISCONNECTED',
  /** 원장 측 — 보호자가 연결 해제 */
  GUARDIAN_MEMBERSHIP_DISCONNECTED: 'GUARDIAN_MEMBERSHIP_DISCONNECTED',
  ATTENDANCE_RECORD_CREATED: 'ATTENDANCE_RECORD_CREATED',
  ATTENDANCE_RECORD_UPDATED: 'ATTENDANCE_RECORD_UPDATED',
  GUARDIAN_APPLICATION_REQUESTED: 'GUARDIAN_APPLICATION_REQUESTED',
} as const;

type NotificationInboxType = string;

interface NotificationInboxItem {
  id: string;
  type: NotificationInboxType;
  title: string;
  body: string;
  kindergartenName: string;
  kindergartenImageUrl?: string;
  petName: string;
  /** ISO datetime — 발송 시각 */
  sentAt: string;
  isRead: boolean;
  payload?: Record<string, unknown>;
  /** 대상 페이지 접근 권한 없음 / 데이터 삭제 — M-05 */
  isTargetUnavailable?: boolean;
}

export { NOTIFICATION_INBOX_TYPE };
export type { NotificationInboxType, NotificationInboxItem };
