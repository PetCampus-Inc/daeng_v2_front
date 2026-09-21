import type { OwnerKindergartenNewsItem } from '@views/owner-kindergarten-news-page/model/ownerKindergartenNews';

const MOCK_THUMB = '/images/image_owner_kindergarten_news_thumb_mock.png';
const MOCK_GUARDIAN_TOTAL = 4;

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function daysAgo(days: number, hour = 12, minute = 57) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function yearsAgo(years: number) {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  date.setMonth(5, 22);
  date.setHours(0, 57, 0, 0);
  return date.toISOString();
}

/**
 * 유치원 소식 mock (API 전).
 * - 공지 1건 최상단
 * - 35건으로 페이지(30) 무한스크롤 확인
 * - empty: `/owner/news?empty=1`
 */
const BASE_MOCK_OWNER_KINDERGARTEN_NEWS: OwnerKindergartenNewsItem[] = [
  {
    id: 'news-announcement',
    isAnnouncement: true,
    publishedAt: daysAgo(10, 0, 57),
    readCount: 1,
    guardianTotalCount: MOCK_GUARDIAN_TOTAL,
    title: '[9월 일정] 공지합니다.',
    body: '안녕하세요? 공지사항 내용이고요.\n엔터 줄바꿈 적용합니다. 2줄까지 보입니다. 확인 부탁드려요.',
    thumbnailUrl: MOCK_THUMB,
  },
  {
    id: 'news-new-1',
    isAnnouncement: false,
    publishedAt: hoursAgo(0.02),
    readCount: 1,
    guardianTotalCount: MOCK_GUARDIAN_TOTAL,
    title: '[9월 일정] 공지합니다.',
    body: '공지 내용 1줄 적용하고\n이모지도 여기에선 적용합니다 🐶',
    thumbnailUrl: MOCK_THUMB,
  },
  {
    id: 'news-no-thumb',
    isAnnouncement: false,
    publishedAt: daysAgo(5, 0, 57),
    readCount: 1,
    guardianTotalCount: MOCK_GUARDIAN_TOTAL,
    title: '[9월 일정] 공지합니다.',
    body: '1줄 입력시엔 이렇게, 이미지 등록하지 않았을 땐 이렇게 보입니다.',
    thumbnailUrl: null,
  },
  {
    id: 'news-old-year',
    isAnnouncement: false,
    publishedAt: yearsAgo(1),
    readCount: 12,
    guardianTotalCount: MOCK_GUARDIAN_TOTAL,
    title: '[작년 일정] 연도 표기 확인',
    body: '올해가 아니면 연도까지 표시됩니다.',
    thumbnailUrl: MOCK_THUMB,
  },
];

const FILLER_COUNT = 35 - BASE_MOCK_OWNER_KINDERGARTEN_NEWS.length;

const FILLER_MOCK_OWNER_KINDERGARTEN_NEWS: OwnerKindergartenNewsItem[] = Array.from(
  { length: FILLER_COUNT },
  (_, index) => {
    const n = index + 1;
    return {
      id: `news-filler-${n}`,
      isAnnouncement: false,
      publishedAt: daysAgo(1 + Math.floor(n / 2), 10, (n * 3) % 60),
      readCount: n,
      guardianTotalCount: MOCK_GUARDIAN_TOTAL,
      title: `[소식] mock 목록 ${n}`,
      body:
        n % 2 === 0
          ? `무한스크롤 확인용 본문 ${n}번째입니다.\n두 번째 줄 미리보기입니다.`
          : `무한스크롤 확인용 본문 ${n}번째입니다.`,
      thumbnailUrl: n % 3 === 0 ? null : MOCK_THUMB,
    };
  }
);

const MOCK_OWNER_KINDERGARTEN_NEWS: OwnerKindergartenNewsItem[] = [
  ...BASE_MOCK_OWNER_KINDERGARTEN_NEWS,
  ...FILLER_MOCK_OWNER_KINDERGARTEN_NEWS,
];

export { MOCK_OWNER_KINDERGARTEN_NEWS };
