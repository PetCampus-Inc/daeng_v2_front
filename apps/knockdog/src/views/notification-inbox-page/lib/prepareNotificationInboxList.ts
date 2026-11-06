import { NOTIFICATION_INBOX_RETENTION_DAYS } from '@views/notification-inbox-page/config/notificationInboxConstants';
import type { NotificationInboxItem } from '@views/notification-inbox-page/config/notificationInboxTypes';

const RETENTION_MS = NOTIFICATION_INBOX_RETENTION_DAYS * 24 * 60 * 60 * 1000;

/**
 * 발송 시점 기준 14일(rolling) 미경과 알림만 유지.
 * KST wall-clock과 동일한 절대 구간(14×24h)으로 판정한다.
 */
function isWithinNotificationInboxRetention(sentAt: string, now: Date = new Date()) {
  const sent = new Date(sentAt);
  if (Number.isNaN(sent.getTime())) return false;
  return now.getTime() - sent.getTime() < RETENTION_MS;
}

function filterNotificationInboxByRetention(
  items: NotificationInboxItem[],
  now: Date = new Date()
) {
  return items.filter((item) => isWithinNotificationInboxRetention(item.sentAt, now));
}

function sortNotificationInboxBySentAtDesc(items: NotificationInboxItem[]) {
  return [...items].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
}

export {
  filterNotificationInboxByRetention,
  isWithinNotificationInboxRetention,
  sortNotificationInboxBySentAtDesc,
};
