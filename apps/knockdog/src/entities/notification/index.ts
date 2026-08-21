export { getNotifications, patchNotificationRead, patchNotificationsReadAll } from './api/notification';
export type { GetNotificationsParams } from './api/notification';
export {
  NOTIFICATIONS_QUERY_KEY,
  notificationsQueryKey,
  useNotificationsInfiniteQuery,
} from './api/useNotificationsInfiniteQuery';
export type { NotificationsCache } from './api/useNotificationsInfiniteQuery';
export { useNotificationReadMutation } from './api/useNotificationReadMutation';
export {
  notificationsUnreadQueryKey,
  useHasUnreadNotificationQuery,
} from './api/useHasUnreadNotificationQuery';
export { toNotificationListPage } from './model/notification';
export type {
  Notification,
  NotificationDto,
  NotificationInboxDto,
  NotificationListPage,
  NotificationPet,
  NotificationSchool,
} from './model/notification';
