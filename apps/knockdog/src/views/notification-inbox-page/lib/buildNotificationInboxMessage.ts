import {
  NOTIFICATION_INBOX_TYPE,
  type NotificationInboxType,
} from '@views/notification-inbox-page/config/notificationInboxTypes';

interface NotificationInboxMessage {
  title: string;
  body: string;
}

/**
 * 알림장 PRD 알림 문구 
 * API 연동 시 서버 문구를 우선하고, 없으면 이 템플릿으로 폴백한다.
 */
function buildNotificationInboxMessage(
  type: NotificationInboxType,
  petName: string
): NotificationInboxMessage {
  switch (type) {
    case NOTIFICATION_INBOX_TYPE.CONNECTION_COMPLETED:
      return {
        title: '유치원 연결이 완료됐어요',
        body: '이제 똑독에서 유치원 생활을 모아볼 수 있어요',
      };
    case NOTIFICATION_INBOX_TYPE.DAILY_NOTICE_ARRIVED:
      return {
        title: `${petName}의 알림장이 도착했어요`,
        body: '우리 아이의 하루를 똑독에서 확인해 보세요.',
      };
    case NOTIFICATION_INBOX_TYPE.CONNECTION_APPLY_SENT:
      return {
        title: `유치원에 ${petName}의 연결 신청을 보냈어요`,
        body: '원장님이 확인 중이에요. 연결이 완료 되면 알려드릴게요.',
      };
    case NOTIFICATION_INBOX_TYPE.ALBUM_PHOTO_UPLOADED:
      return {
        title: `${petName}의 사진이 올라왔어요`,
        body: '우리 아이의 모습을 똑독에서 확인해 보세요.',
      };
    default:
      return {
        title: '알림이 도착했어요',
        body: '자세한 내용을 확인해 보세요.',
      };
  }
}

export { buildNotificationInboxMessage };
export type { NotificationInboxMessage };
