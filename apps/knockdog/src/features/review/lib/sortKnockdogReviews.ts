import type { KnockdogReview, KnockdogReviewSort } from '../config/knockdogReviewMock';

function sortKnockdogReviews(reviews: KnockdogReview[], sort: KnockdogReviewSort) {
  return [...reviews].sort((left, right) => {
    const newestFirst = new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    if (sort === 'latest') return newestFirst;
    if (sort === 'ratingDesc') return right.score - left.score || newestFirst;
    if (sort === 'ratingAsc') return left.score - right.score || newestFirst;
    return right.helpfulCount - left.helpfulCount || newestFirst;
  });
}

export { sortKnockdogReviews };
