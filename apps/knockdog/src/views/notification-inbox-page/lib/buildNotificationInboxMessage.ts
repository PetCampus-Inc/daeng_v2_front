import {
  NOTIFICATION_INBOX_TYPE,
} from '@views/notification-inbox-page/config/notificationInboxTypes';
import { ellipsisText } from '@shared/utils';

interface NotificationInboxMessage {
  title: string;
  body: string;
}

interface BuildNotificationInboxMessageOptions {
  schoolName?: string;
}

/**
 * 알림장 PRD 알림 문구.
 * API 연동 시 서버 문구를 우선하고, 없으면 이 템플릿으로 폴백한다.
 */
function buildNotificationInboxMessage(
  type: string,
  petName: string,
  options: BuildNotificationInboxMessageOptions = {}
): NotificationInboxMessage {
  const schoolName = options.schoolName?.trim() || '유치원';
  const displaySchoolName = ellipsisText(schoolName, 10);

  switch (type) {
    case NOTIFICATION_INBOX_TYPE.CONNECTION_COMPLETED:
    case NOTIFICATION_INBOX_TYPE.SCHOOL_MEMBERSHIP_APPROVED:
      return {
        title: '유치원 연결이 완료됐어요',
        body: '이제 똑독에서 유치원 생활을 모아볼 수 있어요',
      };
    case NOTIFICATION_INBOX_TYPE.DAILY_NOTICE_ARRIVED:
    case NOTIFICATION_INBOX_TYPE.ATTENDANCE_RECORD_CREATED:
    case NOTIFICATION_INBOX_TYPE.ATTENDANCE_RECORD_UPDATED:
      return {
        title: `${petName}의 알림장이 도착했어요`,
        body: '우리 아이의 하루를 똑독에서 확인해 보세요.',
      };
    case NOTIFICATION_INBOX_TYPE.CONNECTION_APPLY_SENT:
    case NOTIFICATION_INBOX_TYPE.GUARDIAN_APPLICATION_REQUESTED:
      return {
        title: `유치원에 ${petName}의 연결 신청을 보냈어요`,
        body: '원장님이 확인 중이에요. 연결이 완료 되면 알려드릴게요.',
      };
    case NOTIFICATION_INBOX_TYPE.ALBUM_PHOTO_UPLOADED:
      return {
        title: `${petName}의 사진이 올라왔어요`,
        body: '우리 아이의 모습을 똑독에서 확인해 보세요.',
      };
    case NOTIFICATION_INBOX_TYPE.SCHOOL_MEMBERSHIP_DISCONNECTED:
      return {
        title: `${displaySchoolName}과의 연결이 해제됐어요`,
        body: `${petName}의 유치원 소식을 더 이상 받아볼 수 없어요.`,
      };
    case NOTIFICATION_INBOX_TYPE.GUARDIAN_MEMBERSHIP_DISCONNECTED:
      return {
        title: '보호자가 유치원과의 연결을 해제했어요',
        body: `${petName}가 구성원 목록에서 제외됐어요.`,
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
