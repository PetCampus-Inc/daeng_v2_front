/** 알림함 알림 타입 (알림장 PRD케이스) */
const NOTIFICATION_INBOX_TYPE = {
  CONNECTION_COMPLETED: 'connection_completed',
  DAILY_NOTICE_ARRIVED: 'daily_notice_arrived',
  CONNECTION_APPLY_SENT: 'connection_apply_sent',
  ALBUM_PHOTO_UPLOADED: 'album_photo_uploaded',
} as const;

type NotificationInboxType =
  (typeof NOTIFICATION_INBOX_TYPE)[keyof typeof NOTIFICATION_INBOX_TYPE];

interface NotificationInboxItem {
  id: string;
  type: NotificationInboxType;
  kindergartenName: string;
  kindergartenImageUrl?: string;
  petName: string;
  /** ISO datetime — 발송 시각 */
  sentAt: string;
  isRead: boolean;
  /** 대상 페이지 접근 권한 없음 / 데이터 삭제 — M-05 */
  isTargetUnavailable?: boolean;
}

export { NOTIFICATION_INBOX_TYPE };
export type { NotificationInboxType, NotificationInboxItem };
