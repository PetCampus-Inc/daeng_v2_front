/** 평점과 리뷰 수가 제공된 목록·상세 화면에 표시하는 리뷰 요약 */
interface ReviewRatingProps {
  rating?: number | null;
  reviewCount?: number | null;
}

export function ReviewRating({ rating, reviewCount }: ReviewRatingProps) {
  if (rating == null || reviewCount == null || !Number.isFinite(rating) || !Number.isFinite(reviewCount)) return null;

  return (
    <div className='flex h-x5 shrink-0 items-center'>
      <svg className='text-fill-primary-500 size-x5 shrink-0' viewBox='0 0 20 20' fill='none' aria-hidden='true'>
        <path
          d='M10 1.875L12.305 6.547L17.461 7.296L13.73 10.933L14.61 16.068L10 13.645L5.39 16.068L6.27 10.933L2.539 7.296L7.695 6.547L10 1.875Z'
          fill='currentColor'
        />
      </svg>
      <span className='body2-bold text-text-primary'>{rating.toFixed(1)}</span>
      <span className='body2-semibold text-text-tertiary whitespace-nowrap'>({reviewCount.toLocaleString()}개)</span>
    </div>
  );
}
