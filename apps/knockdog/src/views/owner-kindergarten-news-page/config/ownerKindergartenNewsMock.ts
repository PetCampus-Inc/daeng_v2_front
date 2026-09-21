import type { OwnerKindergartenNewsItem } from '@views/owner-kindergarten-news-page/model/ownerKindergartenNews';

const MOCK_THUMB = '/images/image_owner_kindergarten_news_thumb_mock.png';

/**
 * 유치원 소식 목록
 * 소식 없음: `/owner/news?empty=1`
 */
const MOCK_OWNER_KINDERGARTEN_NEWS: OwnerKindergartenNewsItem[] = [
  {
    id: 'news-1',
    isAnnouncement: true,
    isUnread: false,
    publishedAtLabel: '6월 22일 (목) 오전 12:57',
    readCount: 1,
    title: '[9월 일정] 공지합니다.',
    body: '안녕하세요? 공지사항 내용이고요.\n엔터 줄바꿈 적용합니다. 2줄까지 보입니다. 확인 부탁드려요.',
    thumbnailUrl: MOCK_THUMB,
  },
  {
    id: 'news-2',
    isAnnouncement: false,
    isUnread: true,
    publishedAtLabel: '1분 전',
    readCount: 1,
    title: '[9월 일정] 공지합니다.',
    body: '공지 내용 1줄 적용하고\n이모지도 여기에선 적용합니다 🐶',
    thumbnailUrl: MOCK_THUMB,
  },
  {
    id: 'news-3',
    isAnnouncement: false,
    isUnread: false,
    publishedAtLabel: '6월 22일 (목) 오전 12:57',
    readCount: 1,
    title: '[9월 일정] 공지합니다.',
    body: '1줄 입력시엔 이렇게, 이미지 등록하지 않았을 땐 이렇게 보입니다.',
    thumbnailUrl: null,
  },
  {
    id: 'news-4',
    isAnnouncement: false,
    isUnread: false,
    publishedAtLabel: '9월 5일 (목) 오전 12:57',
    readCount: 1,
    title: '[9월 일정] 공지합니다.',
    body: '1줄 등록시엔 이렇게 보입니다',
    thumbnailUrl: MOCK_THUMB,
  },
  {
    id: 'news-5',
    isAnnouncement: false,
    isUnread: false,
    publishedAtLabel: '9월 5일 (목) 오전 12:57',
    readCount: 1,
    title: '[9월 일정] 공지합니다.',
    body: '안녕하세요? 공지사항 내용이고요.\n엔터 줄바꿈 적용합니다. 2줄까지 보입니다. 확인 부탁드려요.',
    thumbnailUrl: MOCK_THUMB,
  },
];

export { MOCK_OWNER_KINDERGARTEN_NEWS };
