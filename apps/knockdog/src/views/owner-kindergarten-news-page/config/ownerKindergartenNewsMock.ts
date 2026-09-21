import type {
  OwnerKindergartenNewsItem,
  OwnerKindergartenNewsReader,
} from '@views/owner-kindergarten-news-page/model/ownerKindergartenNews';

const MOCK_THUMB = '/images/image_owner_kindergarten_news_thumb_mock.png';
const MOCK_DETAIL_1 = '/images/image_owner_kindergarten_news_detail_mock_1.jpg';
const MOCK_DETAIL_2 = '/images/image_owner_kindergarten_news_detail_mock_2.jpg';

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
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

function withImages(imageUrls: string[]): Pick<OwnerKindergartenNewsItem, 'thumbnailUrl' | 'imageUrls'> {
  return {
    thumbnailUrl: imageUrls[0] ?? null,
    imageUrls,
  };
}

function withReaders(readers: OwnerKindergartenNewsReader[]) {
  const connected = readers.filter((reader) => reader.isConnected);
  const readCount = readers.filter((reader) => reader.readAt != null).length;

  return {
    readers,
    guardianTotalCount: connected.length,
    readCount,
  };
}

/** Figma 시트 샘플 — 가나다순·읽음/미읽음·다견 케이스 */
const DETAIL_SHEET_READERS: OwnerKindergartenNewsReader[] = [
  {
    id: 'reader-kang',
    guardianName: '강하다',
    dogNames: ['뭉이', '초코'],
    readAt: minutesAgo(5),
    isConnected: true,
  },
  {
    id: 'reader-min',
    guardianName: '민병윤',
    dogNames: ['이두부', '콩이'],
    readAt: null,
    isConnected: true,
  },
  {
    id: 'reader-lee',
    guardianName: '이소정',
    dogNames: ['그리퐁방데앵칭구', '별이'],
    readAt: daysAgo(13, 20, 59),
    isConnected: true,
  },
  {
    id: 'reader-jang',
    guardianName: '장예은',
    dogNames: ['뭉이', '달이'],
    readAt: null,
    isConnected: true,
  },
  {
    id: 'reader-choi',
    guardianName: '최가은',
    dogNames: ['뽀삐'],
    readAt: null,
    isConnected: true,
  },
  {
    id: 'reader-han',
    guardianName: '한소희',
    dogNames: ['코코', '몽이', '별'],
    readAt: null,
    isConnected: true,
  },
  {
    id: 'reader-disconnected',
    guardianName: '해제됨',
    dogNames: ['옛멍'],
    readAt: daysAgo(20, 10, 0),
    isConnected: false,
  },
  {
    id: 'reader-disconnected-unread',
    guardianName: '미연결미열람',
    dogNames: ['숨김'],
    readAt: null,
    isConnected: false,
  },
];

const DEFAULT_READERS: OwnerKindergartenNewsReader[] = [
  {
    id: 'reader-default-1',
    guardianName: '김보호',
    dogNames: ['초코'],
    readAt: hoursAgo(2),
    isConnected: true,
  },
  {
    id: 'reader-default-2',
    guardianName: '이보호',
    dogNames: ['콩이', '별이'],
    readAt: null,
    isConnected: true,
  },
  {
    id: 'reader-default-3',
    guardianName: '박보호',
    dogNames: ['뭉치'],
    readAt: null,
    isConnected: true,
  },
  {
    id: 'reader-default-4',
    guardianName: '최보호',
    dogNames: ['뽀'],
    readAt: null,
    isConnected: true,
  },
];

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
    title: '[9월 일정] 공지합니다.',
    body: '안녕하세요? 공지사항 내용이고요.\n엔터 줄바꿈 적용합니다. 2줄까지 보입니다. 확인 부탁드려요.',
    ...withImages([MOCK_DETAIL_1, MOCK_DETAIL_2]),
    ...withReaders(DETAIL_SHEET_READERS),
  },
  {
    id: 'news-new-1',
    isAnnouncement: false,
    publishedAt: hoursAgo(0.02),
    title: '[9월 일정] 공지합니다.',
    body: '공지 내용 1줄 적용하고\n이모지도 여기에선 적용합니다 🐶',
    ...withImages([MOCK_THUMB]),
    ...withReaders(DEFAULT_READERS),
  },
  {
    id: 'news-no-thumb',
    isAnnouncement: false,
    publishedAt: daysAgo(5, 0, 57),
    title: '[9월 일정] 공지합니다.',
    body: '1줄 입력시엔 이렇게, 이미지 등록하지 않았을 땐 이렇게 보입니다.',
    ...withImages([]),
    ...withReaders(DEFAULT_READERS.map((reader, index) => ({
      ...reader,
      id: `no-thumb-${reader.id}`,
      readAt: index === 0 ? hoursAgo(1) : null,
    }))),
  },
  {
    id: 'news-old-year',
    isAnnouncement: false,
    publishedAt: yearsAgo(1),
    title: '[작년 일정] 연도 표기 확인',
    body: '올해가 아니면 연도까지 표시됩니다.',
    ...withImages([MOCK_DETAIL_2, MOCK_DETAIL_1]),
    ...withReaders(
      Array.from({ length: 12 }, (_, index) => ({
        id: `old-reader-${index}`,
        guardianName: `가나다${String.fromCharCode(0xac00 + index)}`,
        dogNames: [`멍${index + 1}`],
        readAt: hoursAgo(index + 1),
        isConnected: true,
      }))
    ),
  },
];

const FILLER_COUNT = 35 - BASE_MOCK_OWNER_KINDERGARTEN_NEWS.length;

const FILLER_MOCK_OWNER_KINDERGARTEN_NEWS: OwnerKindergartenNewsItem[] = Array.from(
  { length: FILLER_COUNT },
  (_, index) => {
    const n = index + 1;
    const images = n % 3 === 0 ? [] : n % 2 === 0 ? [MOCK_THUMB, MOCK_DETAIL_1] : [MOCK_THUMB];

    return {
      id: `news-filler-${n}`,
      isAnnouncement: false,
      publishedAt: daysAgo(1 + Math.floor(n / 2), 10, (n * 3) % 60),
      title: `[소식] mock 목록 ${n}`,
      body:
        n % 2 === 0
          ? `무한스크롤 확인용 본문 ${n}번째입니다.\n두 번째 줄 미리보기입니다.`
          : `무한스크롤 확인용 본문 ${n}번째입니다.`,
      ...withImages(images),
      ...withReaders(
        DEFAULT_READERS.map((reader, readerIndex) => ({
          ...reader,
          id: `filler-${n}-${reader.id}`,
          readAt: readerIndex < (n % 4) ? hoursAgo(readerIndex + 1) : null,
        }))
      ),
    };
  }
);

const MOCK_OWNER_KINDERGARTEN_NEWS: OwnerKindergartenNewsItem[] = [
  ...BASE_MOCK_OWNER_KINDERGARTEN_NEWS,
  ...FILLER_MOCK_OWNER_KINDERGARTEN_NEWS,
];

export { MOCK_OWNER_KINDERGARTEN_NEWS };
