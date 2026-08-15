/** 알림함 리스트 페이지당 조회 건수 */
const NOTIFICATION_INBOX_PAGE_SIZE = 30;

/**
 * 발송 시점 기준 KST 14일 경과 알림은 리스트 조회에서 제외.
 * (서버 알림 로그는 삭제하지 않고 누적 저장)
 */
const NOTIFICATION_INBOX_RETENTION_DAYS = 14;

export { NOTIFICATION_INBOX_PAGE_SIZE, NOTIFICATION_INBOX_RETENTION_DAYS };
