import type { NotificationInboxDto } from '../model/notification';

import { api, type ApiResponse } from '@shared/api';

interface GetNotificationsParams {
  cursor?: string;
  size?: number;
}

/** `GET` - 인증 사용자 알림함 조회 (최근 14일, cursor 페이지네이션) */
function getNotifications({ cursor, size = 30 }: GetNotificationsParams = {}) {
  return api
    .get('notifications', {
      searchParams: {
        size,
        ...(cursor ? { cursor } : {}),
      },
    })
    .json<ApiResponse<NotificationInboxDto>>();
}

/** `PATCH` - 알림 단건 읽음 처리 */
function patchNotificationRead(notificationId: string) {
  return api.patch(`notifications/${notificationId}`).json<ApiResponse<null>>();
}

/** `PATCH` - 최근 알림 전체 읽음 처리 */
function patchNotificationsReadAll() {
  return api.patch('notifications').json<ApiResponse<null>>();
}

export { getNotifications, patchNotificationRead, patchNotificationsReadAll };
export type { GetNotificationsParams };
