import { cn } from '@knockdog/ui/lib';

import {
  getReviewAverageScore,
  getReviewFilledStarCount,
  getReviewScorePercents,
  getReviewTotalCount,
  type ReviewRatingCounts,
} from '../lib/reviewRating';

const SCORE_LABELS = [5, 4, 3, 2, 1] as const;

interface ReviewRatingSummaryProps {
  counts: ReviewRatingCounts;
}

function ReviewRatingSummary({ counts }: ReviewRatingSummaryProps) {
  const total = getReviewTotalCount(counts);
  const score = getReviewAverageScore(counts);
  const filledStarCount = getReviewFilledStarCount(score);
  const percents = getReviewScorePercents(counts);
  const maxPercent = Math.max(...percents);

  return (
    <div className='flex w-full items-center gap-2'>
      <div className='flex w-[114px] shrink-0 flex-col items-center gap-1.5'>
        <p className='text-text-primary w-full text-center text-[40px] leading-10 font-extrabold tracking-[-0.02em]'>
          {score.toFixed(1)}
        </p>
        <div className='flex w-full items-center justify-between'>
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className='flex size-5 items-center justify-center'>
              {/* eslint-disable-next-line @next/next/no-img-element -- 별 SVG 원본 크기 유지 */}
              <img
                src={
                  index < filledStarCount
                    ? '/images/img_review_rating_star_fill.svg'
                    : '/images/img_review_rating_star.svg'
                }
                alt=''
              />
            </div>
          ))}
        </div>
        <p className='caption1-semibold text-fill-secondary-500 w-full text-center'>
          리뷰 {total.toLocaleString('ko-KR')}개
        </p>
      </div>

      <div className='flex min-w-0 flex-1 flex-col'>
        {SCORE_LABELS.map((label, index) => {
          const percent = percents[index] ?? 0;
          const isHighlighted = maxPercent > 0 && percent === maxPercent;

          return (
            <div key={label} className='flex items-center gap-2'>
              <p className='caption1-semibold text-text-secondary w-6 text-right'>{label}</p>
              <div className='bg-fill-secondary-300 relative h-1.5 min-w-0 flex-1 rounded-full'>
                <div
                  className={cn(
                    'absolute inset-y-0 left-0 rounded-full',
                    isHighlighted ? 'bg-fill-primary-500' : 'bg-fill-secondary-400'
                  )}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className='caption1-semibold text-text-secondary w-9 text-right'>{percent}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { ReviewRatingSummary };
