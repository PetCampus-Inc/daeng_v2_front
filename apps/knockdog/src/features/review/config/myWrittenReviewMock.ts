interface MyWrittenReview {
  id: string;
  placeId: string;
  kindergartenName: string;
  kindergartenImage: string;
  score: number;
  createdAt: string;
  updatedAt: string;
  content: string;
  images: string[];
}

type MyWrittenReviewSort = 'latest' | 'ratingDesc' | 'ratingAsc';

const MY_WRITTEN_REVIEW_SORT_OPTIONS: { value: MyWrittenReviewSort; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'ratingDesc', label: '별점높은순' },
  { value: 'ratingAsc', label: '별점낮은순' },
];

const MOCK_MY_WRITTEN_REVIEWS: MyWrittenReview[] = [
  {
    id: 'my-review-1',
    placeId: '1891758402',
    kindergartenName: '똑독 유치원',
    kindergartenImage: '',
    score: 4.5,
    createdAt: '2026-09-19T10:00:00',
    updatedAt: '2026-09-19T10:00:00',
    content: '지금도 다니고 있는 곳인데 사회화 프로그램이 체계적이었어요. 위치도 찾기 쉬웠습니다.',
    images: [],
  },
];

export { MOCK_MY_WRITTEN_REVIEWS, MY_WRITTEN_REVIEW_SORT_OPTIONS };
export type { MyWrittenReview, MyWrittenReviewSort };
