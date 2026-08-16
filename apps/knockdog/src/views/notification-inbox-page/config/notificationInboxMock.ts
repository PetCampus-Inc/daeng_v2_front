import {
  NOTIFICATION_INBOX_TYPE,
  type NotificationInboxItem,
} from '@views/notification-inbox-page/config/notificationInboxTypes';

/**
 * - `?mock=empty` → empty
 * - 기본 / `?mock=list` → 리스트
 * - `?mock=mark-all-fail` → 모두읽음 API 실패
 * - `?mock=page-not-found` → M-05
 * - `?mock=error` → 최초 조회 실패 (공통 PageError)
 */
const MOCK_NOTIFICATION_INBOX_LIST = true;

/** true면 모두읽음 API가 항상 실패하는 것으로 처리 */
const MOCK_NOTIFICATION_MARK_ALL_READ_FAIL = false;

const MOCK_NOTIFICATION_INBOX_QUERY = {
  list: 'list',
  empty: 'empty',
  markAllFail: 'mark-all-fail',
  pageNotFound: 'page-not-found',
  error: 'error',
} as const;

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function daysAgo(days: number) {
  return minutesAgo(days * 24 * 60);
}

/** 샘플 mock */
const MOCK_NOTIFICATION_INBOX_ITEMS: NotificationInboxItem[] = [
  {
    id: 'noti-1',
    type: NOTIFICATION_INBOX_TYPE.CONNECTION_COMPLETED,
    kindergartenName: '코코스퀘어 강아지유치원&애견미용 플래그십 스토어',
    petName: '몽이',
    sentAt: minutesAgo(5),
    isRead: false,
  },
  {
    id: 'noti-2',
    type: NOTIFICATION_INBOX_TYPE.DAILY_NOTICE_ARRIVED,
    kindergartenName: '디그닥 유치원',
    petName: '니콜라스',
    sentAt: minutesAgo(19),
    isRead: false,
  },
  {
    id: 'noti-3',
    type: NOTIFICATION_INBOX_TYPE.DAILY_NOTICE_ARRIVED,
    kindergartenName: '디그닥 유치원',
    petName: '세바스찬',
    sentAt: minutesAgo(30),
    isRead: true,
  },
  {
    id: 'noti-4',
    type: NOTIFICATION_INBOX_TYPE.CONNECTION_APPLY_SENT,
    kindergartenName: '코코스퀘어 강아지유치원&애견미용 플래그십 스토어',
    petName: '몽이',
    sentAt: minutesAgo(60),
    isRead: true,
  },
  {
    id: 'noti-5',
    type: NOTIFICATION_INBOX_TYPE.ALBUM_PHOTO_UPLOADED,
    kindergartenName: '가나다라마바사 유치원',
    petName: '다닥',
    sentAt: daysAgo(3),
    isRead: false,
  },
];

/** Figma M-05 샘플 — 대상 페이지 접근 불가 */
const MOCK_NOTIFICATION_INBOX_PAGE_NOT_FOUND_ITEMS: NotificationInboxItem[] = [
  {
    id: 'noti-m05',
    type: NOTIFICATION_INBOX_TYPE.CONNECTION_COMPLETED,
    kindergartenName: '코코스퀘어 강아지유치원&애견미용 플래그십 스토어',
    petName: '몽이',
    sentAt: minutesAgo(5),
    isRead: true,
    isTargetUnavailable: true,
  },
];

function isNotificationInboxEmptyMock(mockQuery: string | null) {
  return mockQuery === MOCK_NOTIFICATION_INBOX_QUERY.empty;
}

function isNotificationInboxErrorMock(mockQuery: string | null) {
  return mockQuery === MOCK_NOTIFICATION_INBOX_QUERY.error;
}

function isNotificationMarkAllReadFailMock(mockQuery: string | null) {
  return (
    MOCK_NOTIFICATION_MARK_ALL_READ_FAIL ||
    mockQuery === MOCK_NOTIFICATION_INBOX_QUERY.markAllFail
  );
}

function isNotificationPageNotFoundMock(mockQuery: string | null) {
  return mockQuery === MOCK_NOTIFICATION_INBOX_QUERY.pageNotFound;
}

function isNotificationInboxListMock(mockQuery: string | null) {
  if (isNotificationInboxEmptyMock(mockQuery) || isNotificationInboxErrorMock(mockQuery)) {
    return false;
  }
  return (
    MOCK_NOTIFICATION_INBOX_LIST ||
    mockQuery === MOCK_NOTIFICATION_INBOX_QUERY.list ||
    mockQuery === MOCK_NOTIFICATION_INBOX_QUERY.markAllFail ||
    mockQuery === MOCK_NOTIFICATION_INBOX_QUERY.pageNotFound
  );
}

function getMockNotificationInboxItems(mockQuery: string | null) {
  if (isNotificationPageNotFoundMock(mockQuery)) {
    return MOCK_NOTIFICATION_INBOX_PAGE_NOT_FOUND_ITEMS;
  }
  return MOCK_NOTIFICATION_INBOX_ITEMS;
}

export {
  MOCK_NOTIFICATION_INBOX_ITEMS,
  MOCK_NOTIFICATION_INBOX_LIST,
  MOCK_NOTIFICATION_INBOX_PAGE_NOT_FOUND_ITEMS,
  getMockNotificationInboxItems,
  isNotificationInboxEmptyMock,
  isNotificationInboxErrorMock,
  isNotificationInboxListMock,
  isNotificationMarkAllReadFailMock,
  isNotificationPageNotFoundMock,
};
