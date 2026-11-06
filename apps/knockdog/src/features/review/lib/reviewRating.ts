import type { SchoolReviewSummary } from '@entities/review';

interface ReviewRatingCounts {
  score5: number;
  score4: number;
  score3: number;
  score2: number;
  score1: number;
}

const SCORE_KEYS = ['score5', 'score4', 'score3', 'score2', 'score1'] as const;

function toReviewRatingCounts(reviews: { score: number }[]) {
  const counts: ReviewRatingCounts = { score5: 0, score4: 0, score3: 0, score2: 0, score1: 0 };

  reviews.forEach((review) => {
    const rounded = Math.min(5, Math.max(1, Math.round(review.score)));
    const key = SCORE_KEYS[5 - rounded];
    if (key) counts[key] += 1;
  });

  return counts;
}

function getReviewTotalCount(counts: ReviewRatingCounts) {
  return SCORE_KEYS.reduce((total, key) => total + counts[key], 0);
}

function getReviewAverageScore(counts: ReviewRatingCounts) {
  const total = getReviewTotalCount(counts);
  if (total === 0) return 0;

  const sum = counts.score5 * 5 + counts.score4 * 4 + counts.score3 * 3 + counts.score2 * 2 + counts.score1;
  return Math.round((sum / total) * 10) / 10;
}

function getReviewFilledStarCount(score: number) {
  return Math.min(5, Math.max(0, Math.floor(score)));
}

function getReviewScorePercents(counts: ReviewRatingCounts): [number, number, number, number, number] {
  const values = SCORE_KEYS.map((key) => counts[key]);
  const total = values.reduce((sum, count) => sum + count, 0);
  if (total === 0) return [0, 0, 0, 0, 0];

  const raw = values.map((count) => (count / total) * 100);
  const percents = raw.map((value) => Math.floor(value));
  let remainder = 100 - percents.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((left, right) => right.fraction - left.fraction || left.index - right.index);

  let cursor = 0;
  while (remainder > 0 && order.length > 0) {
    const target = order[cursor % order.length];
    const percent = target ? percents[target.index] : undefined;
    if (!target || percent === undefined) break;
    percents[target.index] = percent + 1;
    remainder -= 1;
    cursor += 1;
  }

  return [percents[0] ?? 0, percents[1] ?? 0, percents[2] ?? 0, percents[3] ?? 0, percents[4] ?? 0];
}

/** 로컬에 전체가 있는 목 리뷰 전용. 페이지 일부 집계를 요약으로 쓰지 않는다. */
function toCompleteReviewSummary(counts: ReviewRatingCounts): SchoolReviewSummary {
  const averageRating = getReviewAverageScore(counts);

  return {
    totalCount: getReviewTotalCount(counts),
    averageRating,
    filledStarCount: getReviewFilledStarCount(averageRating),
    percentages: getReviewScorePercents(counts),
    canWrite: true,
    myReviewId: null,
  };
}

export {
  getReviewAverageScore,
  getReviewFilledStarCount,
  getReviewScorePercents,
  getReviewTotalCount,
  toCompleteReviewSummary,
  toReviewRatingCounts,
};
export type { ReviewRatingCounts };
