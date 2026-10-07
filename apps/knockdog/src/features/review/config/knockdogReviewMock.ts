interface KnockdogReview {
  id: string;
  score: number;
  createdAt: string;
  enrollment: 'attending' | 'former';
  content: string;
  images: string[];
  helpfulCount: number;
  isHelpful: boolean;
  isMine: boolean;
}

type KnockdogReviewSort = 'latest' | 'ratingDesc' | 'ratingAsc' | 'helpful';

const KNOCKDOG_REVIEW_SORT_OPTIONS: { value: KnockdogReviewSort; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'ratingDesc', label: '별점많은순' },
  { value: 'ratingAsc', label: '별점낮은순' },
  { value: 'helpful', label: '도움돼요순' },
];

const MOCK_REVIEW_IMAGE = '/images/review-mock/1.jpg';

const MOCK_KNOCKDOG_REVIEWS: KnockdogReview[] = [
  {
    id: 'review-1',
    score: 3,
    createdAt: '2026-09-20T10:00:00',
    enrollment: 'attending',
    content:
      '선생님들이 강아지 성향을 잘 봐주시고 알림도 꼼꼼해서 안심하고 보내고 있어요. 처음 등원할 때 많이 긴장했는데 하루 일과를 사진으로 확인할 수 있어 마음이 놓였고, 산책 후 강아지 컨디션도 안정적이었습니다.',
    images: [MOCK_REVIEW_IMAGE, MOCK_REVIEW_IMAGE],
    helpfulCount: 1,
    isHelpful: false,
    isMine: false,
  },
  {
    id: 'review-2',
    score: 4,
    createdAt: '2026-09-19T18:00:00',
    enrollment: 'attending',
    content: '지금도 다니고 있는 곳인데 사회화 프로그램이 체계적이었어요. 위치도 찾기 쉬웠습니다.',
    images: [],
    helpfulCount: 10,
    isHelpful: false,
    isMine: true,
  },
  {
    id: 'review-3',
    score: 4,
    createdAt: '2026-09-19T12:00:00',
    enrollment: 'former',
    content: '지금도 다니고 있는 곳인데 사회화 프로그램이 체계적이었어요. 위치도 찾기 쉬웠습니다.',
    images: [MOCK_REVIEW_IMAGE, MOCK_REVIEW_IMAGE, MOCK_REVIEW_IMAGE],
    helpfulCount: 299,
    isHelpful: true,
    isMine: false,
  },
  {
    id: 'review-4',
    score: 4,
    createdAt: '2026-09-18T09:00:00',
    enrollment: 'former',
    content: '지금도 다니고 있는 곳인데 사회화 프로그램이 체계적이었어요. 위치도 찾기 쉬웠습니다.',
    images: [MOCK_REVIEW_IMAGE],
    helpfulCount: 14,
    isHelpful: true,
    isMine: false,
  },
];

export { KNOCKDOG_REVIEW_SORT_OPTIONS, MOCK_KNOCKDOG_REVIEWS };
export type { KnockdogReview, KnockdogReviewSort };
