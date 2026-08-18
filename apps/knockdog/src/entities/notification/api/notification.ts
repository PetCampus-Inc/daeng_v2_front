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

export { getNotifications };
export type { GetNotificationsParams };
