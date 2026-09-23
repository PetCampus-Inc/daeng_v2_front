import type { GuardianKindergartenNewsItem } from '@views/guardian-kindergarten-news-page/model/guardianKindergartenNews';

const MOCK_IMG_1 = '/images/image_owner_kindergarten_news_detail_mock_1.jpg';
const MOCK_IMG_2 = '/images/image_owner_kindergarten_news_detail_mock_2.jpg';
const MOCK_THUMB = '/images/image_owner_kindergarten_news_thumb_mock.png';

const DEFAULT_AUTHOR = {
  name: '김똑독 원장님',
  profileImageUrl: null as string | null,
};

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function daysAgo(days: number, hour = 0, minute = 57) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

const BASE_ITEMS: GuardianKindergartenNewsItem[] = [
  {
    id: 'guardian-news-announce',
    title: '[9월 일정] 공지합니다.',
    body: '안녕하세요 줄바꿈 적용합니다.\n🐶 이모지도 적용합니다. 뭉치가 오늘 친구들과 운동장에서 아주 활발하게 뛰어놀았어요. 특히 보더콜리 친구와 공놀이하는 걸 무척 좋아하더라고요! 점심도 남김없이 다 먹었고, 오후 낮잠 시간에는 아주 깊게 잠들었습니다. 집에 가서 푹 쉴 수 있게 해주세요!!',
    publishedAt: daysAgo(10, 0, 57),
    isAnnouncement: true,
    imageUrls: [MOCK_IMG_1],
    author: DEFAULT_AUTHOR,
  },
  {
    id: 'guardian-news-1',
    title: '[9월 일정] 공지합니다. 한줄넘어가면이렇게나옵',
    body: '공지 내용 2줄 입력시 이렇게 보입니다.\n줄바꿈 엔터도 적용합니다.',
    publishedAt: minutesAgo(1),
    isAnnouncement: false,
    imageUrls: Array.from({ length: 74 }, (_, index) =>
      index % 2 === 0 ? MOCK_IMG_1 : MOCK_IMG_2
    ),
    author: DEFAULT_AUTHOR,
  },
  {
    id: 'guardian-news-2',
    title: '이미지가 없을 때는 이렇게',
    body: '공지 내용 1줄 입력시',
    publishedAt: daysAgo(10, 0, 57),
    isAnnouncement: false,
    imageUrls: [],
    author: DEFAULT_AUTHOR,
  },
  {
    id: 'guardian-news-3',
    title: '크리스마스 이벤트 공지합니다',
    body: '크리스마스 이벤트 참여 방법과 일정을 공유합니다.',
    publishedAt: daysAgo(12, 0, 57),
    isAnnouncement: false,
    imageUrls: [MOCK_IMG_1, MOCK_IMG_2],
    author: DEFAULT_AUTHOR,
  },
  {
    id: 'guardian-news-4',
    title: '여름방학 운영 안내',
    body: '여름방학 기간 운영 시간과 휴원 일정을 확인해 주세요.',
    publishedAt: daysAgo(20, 14, 30),
    isAnnouncement: false,
    imageUrls: [MOCK_IMG_1, MOCK_IMG_2, MOCK_THUMB],
    author: DEFAULT_AUTHOR,
  },
  {
    id: 'guardian-news-5',
    title: '예방접종 확인 요청',
    body: '신규 등원견 예방접종 증명서 제출을 부탁드립니다.',
    publishedAt: daysAgo(30, 9, 0),
    isAnnouncement: false,
    imageUrls: [MOCK_THUMB],
    author: DEFAULT_AUTHOR,
  },
];

/** 무한스크롤 데모용 filler (공지 제외, 최신순 정렬 전 원본) */
const FILLER_ITEMS: GuardianKindergartenNewsItem[] = Array.from({ length: 32 }, (_, index) => ({
  id: `guardian-news-filler-${index + 1}`,
  title: `유치원 소식 ${index + 1}`,
  body: `보호자 소식 목록 무한스크롤 샘플 본문입니다. (${index + 1})`,
  publishedAt: daysAgo(40 + index, 10, 0),
  isAnnouncement: false,
  imageUrls: index % 3 === 0 ? [MOCK_THUMB] : [],
  author: DEFAULT_AUTHOR,
}));

/** 보호자 소식 mock */
const MOCK_GUARDIAN_KINDERGARTEN_NEWS: GuardianKindergartenNewsItem[] = [
  ...BASE_ITEMS,
  ...FILLER_ITEMS,
];

export { MOCK_GUARDIAN_KINDERGARTEN_NEWS };
