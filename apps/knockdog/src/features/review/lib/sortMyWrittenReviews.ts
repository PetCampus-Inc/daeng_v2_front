import type { MyWrittenReview, MyWrittenReviewSort } from '../config/myWrittenReviewMock';

function createdDateKey(value: string) {
  return value.slice(0, 10);
}

/** 작성일 최신순, 같은 날이면 최근 수정본이 앞. */
function compareByRecentEdit(left: MyWrittenReview, right: MyWrittenReview) {
  const createdDelta = createdDateKey(right.createdAt).localeCompare(createdDateKey(left.createdAt));
  if (createdDelta !== 0) return createdDelta;
  return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
}

function sortMyWrittenReviews(reviews: MyWrittenReview[], sort: MyWrittenReviewSort) {
  return [...reviews].sort((left, right) => {
    if (sort === 'ratingDesc') return right.score - left.score || compareByRecentEdit(left, right);
    if (sort === 'ratingAsc') return left.score - right.score || compareByRecentEdit(left, right);
    return compareByRecentEdit(left, right);
  });
}

export { sortMyWrittenReviews };
