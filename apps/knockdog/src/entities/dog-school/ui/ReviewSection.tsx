import { Icon } from '@knockdog/ui';
import { DogSchoolReviewCard } from './DogSchoolReviewCard';

interface ReviewSectionProps {
  reviews: {
    image: string;
    name: string;
    title: string;
    content: string;
    date: string;
  }[];
  onScrollTop?: () => void;
}
export const ReviewSection = function ReviewSection({
  reviews,
  onScrollTop,
}: ReviewSectionProps) {
  return (
    <div className='mb-12 mt-10 flex flex-col px-4'>
      <div className='mb-9'>
        <div className='mb-3 flex'>
          <div className='mr-2'>
            <Icon icon='NaverFill' className='h-[22px] w-[22px]' />
          </div>
          <span className='body1-bold'>블로그 리뷰</span>
        </div>
        {/* 후기 리스트 */}
        {reviews.map((review, index) => (
          <DogSchoolReviewCard
            key={index}
            image={
              'https://images.unsplash.com/photo-1518717758536-85ae29035b6d'
            }
            name={review.name}
            title={review.title}
            content={review.content}
            date={review.date}
          />
        ))}
      </div>

      <button
        onClick={onScrollTop}
        className='text-text-tertiary label-semibold flex items-center justify-center gap-x-1'
      >
        맨 위로 가기 <Icon icon='ChevronTop' />
      </button>
    </div>
  );
};
