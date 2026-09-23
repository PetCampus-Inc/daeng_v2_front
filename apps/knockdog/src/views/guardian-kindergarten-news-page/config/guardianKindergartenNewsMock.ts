import type { GuardianKindergartenNewsItem } from '@views/guardian-kindergarten-news-page/model/guardianKindergartenNews';

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function daysAgo(days: number, hour = 0, minute = 57) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

/** 보호자 홈 mock — 최신 등록순 */
const MOCK_GUARDIAN_KINDERGARTEN_NEWS: GuardianKindergartenNewsItem[] = [
  {
    id: 'guardian-news-1',
    title: '[9월 일정] 공지합니다.',
    body: '9월 유치원 일정과 휴원일을 안내드립니다. 자세한 내용은 본문을 확인해 주세요.',
    publishedAt: minutesAgo(1),
  },
  {
    id: 'guardian-news-2',
    title: '[9월 일정] 공지합니다.',
    body: '산책 일정 변경과 준비물을 안내드려요.',
    publishedAt: daysAgo(10, 0, 57),
  },
  {
    id: 'guardian-news-3',
    title: '크리스마스 이벤트 공지합니다',
    body: '크리스마스 이벤트 참여 방법과 일정을 공유합니다.',
    publishedAt: daysAgo(12, 0, 57),
  },
  {
    id: 'guardian-news-4',
    title: '여름방학 운영 안내',
    body: '여름방학 기간 운영 시간과 휴원 일정을 확인해 주세요.',
    publishedAt: daysAgo(20, 14, 30),
  },
  {
    id: 'guardian-news-5',
    title: '예방접종 확인 요청',
    body: '신규 등원견 예방접종 증명서 제출을 부탁드립니다.',
    publishedAt: daysAgo(30, 9, 0),
  },
];

export { MOCK_GUARDIAN_KINDERGARTEN_NEWS };
