import type { Notification } from '@entities/notification';
import type { NotificationInboxItem } from '@views/notification-inbox-page/config/notificationInboxTypes';
import { buildNotificationInboxMessage } from '@views/notification-inbox-page/lib/buildNotificationInboxMessage';

function toNotificationInboxItem(notification: Notification): NotificationInboxItem {
  const fallback = buildNotificationInboxMessage(notification.type, notification.pet?.name ?? '', {
    schoolName: notification.school?.name ?? '',
  });

  return {
    id: notification.id,
    audience: notification.audience,
    type: notification.type,
    title: notification.title || fallback.title,
    body: notification.body || fallback.body,
    kindergartenName: notification.school?.name ?? '',
    kindergartenImageUrl: notification.school?.thumbnailUrl || undefined,
    petName: notification.pet?.name ?? '',
    guardianName: notification.pet?.guardianName ?? '',
    sentAt: notification.createdAt,
    isRead: notification.isRead,
    payload: notification.payload,
  };
}

export { toNotificationInboxItem };
