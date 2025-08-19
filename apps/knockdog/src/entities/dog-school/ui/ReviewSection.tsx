import { Icon } from '@knockdog/ui';
import { DogSchoolReviewCard } from './DogSchoolReviewCard';
import type { DogSchoolReview } from '../model/mock';

interface ReviewSectionProps {
  onScrollTop?: () => void;
}
export const ReviewSection = function ReviewSection({ onScrollTop }: ReviewSectionProps) {
  const reviewListMock: DogSchoolReview[] = [
    {
      id: '1',
      userName: 'John Doe',
      profileImage: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d',
      title: '정말 좋은 곳이에요!',
      content: '정말 좋은 곳이에요! 정말 좋은 곳이에요!',
      createdAt: '2025-04-29',
    },
    {
      id: '2',
      userName: 'Jane Doe',
      profileImage: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d',
      title: '정말 좋은 곳이에요!',
      content: '정말 좋은 곳이에요! 정말 좋은 곳이에요!',
      createdAt: '2025-04-29',
    },
    {
      id: '3',
      userName: 'John Doe',
      profileImage: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d',
      title: '정말 좋은 곳이에요!',
      content: '정말 좋은 곳이에요! 정말 좋은 곳이에요!',
      createdAt: '2025-04-29',
    },
    {
      id: '4',
      userName: 'John Doe',
      profileImage: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d',
      title: '정말 좋은 곳이에요!',
      content: '정말 좋은 곳이에요! 정말 좋은 곳이에요!',
      createdAt: '2025-04-29',
    },
    {
      id: '5',
      userName: 'John Doe',
      profileImage: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d',
      title: '정말 좋은 곳이에요!',
      content: '정말 좋은 곳이에요! 정말 좋은 곳이에요!',
      createdAt: '2025-04-29',
    },
  ];

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
        {reviewListMock.map((review, index) => (
          <DogSchoolReviewCard key={index} {...review} />
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
