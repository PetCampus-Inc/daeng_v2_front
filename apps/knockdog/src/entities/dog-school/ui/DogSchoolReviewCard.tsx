import Image from 'next/image';
import type { DogSchoolReview } from '../model/mock';

export function DogSchoolReviewCard({ userName, profileImage, title, content, createdAt }: DogSchoolReview) {
  return (
    <div className='bg-primitive-neutral-50 mb-2 flex flex-col gap-1 rounded-lg p-4'>
      <div>
        <Image
          src={profileImage}
          alt='페이지 이미지'
          className='mr-1 inline-block h-6 w-6 rounded-full'
          width={24}
          height={24}
        />

        <span className='body2-extrabold'>{userName}</span>
      </div>
      <span className='body1-bold'>{title}</span>
      <p className='body2-regular text-text-secondary mb-[15px] line-clamp-2'>{content}</p>

      <div className='body2-regular text-text-tertiary'>{createdAt}</div>
    </div>
  );
}
