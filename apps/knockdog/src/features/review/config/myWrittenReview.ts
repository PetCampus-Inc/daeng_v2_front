interface MyWrittenReview {
  id: string;
  placeId: string;
  schoolId?: number | null;
  kindergartenName: string;
  kindergartenImage: string;
  score: number;
  createdAt: string;
  content: string;
  images: string[];
}

type MyWrittenReviewSort = 'latest' | 'ratingDesc' | 'ratingAsc';

const MY_WRITTEN_REVIEW_SORT_OPTIONS: { value: MyWrittenReviewSort; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'ratingDesc', label: '별점높은순' },
  { value: 'ratingAsc', label: '별점낮은순' },
];

export { MY_WRITTEN_REVIEW_SORT_OPTIONS };
export type { MyWrittenReview, MyWrittenReviewSort };
