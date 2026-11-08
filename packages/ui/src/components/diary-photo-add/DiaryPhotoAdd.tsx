import { type ReactNode, type SVGProps } from 'react';

import { cn } from '@knockdog/ui/lib';

import { DiaryPhotoRemove } from '../diary-photo-remove';

interface DiaryPhotoAddProps {
  count?: number;
  maxCount?: number;
  image?: ReactNode;
  className?: string;
  onAdd?: () => void;
  onRemove?: () => void;
}

function CameraIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <path
        d='M4 8.5C4 8.10218 4.15804 7.72064 4.43934 7.43934C4.72064 7.15804 5.10218 7 5.5 7H7.5L9 5H15L16.5 7H18.5C18.8978 7 19.2794 7.15804 19.5607 7.43934C19.842 7.72064 20 8.10218 20 8.5V17.5C20 17.8978 19.842 18.2794 19.5607 18.5607C19.2794 18.842 18.8978 19 18.5 19H5.5C5.10218 19 4.72064 18.842 4.43934 18.5607C4.15804 18.2794 4 17.8978 4 17.5V8.5Z'
        stroke='currentColor'
        strokeWidth='1.6'
        strokeLinejoin='round'
      />
      <path
        d='M15.2 12.5C15.2 14.2673 13.7673 15.7 12 15.7C10.2327 15.7 8.8 14.2673 8.8 12.5C8.8 10.7327 10.2327 9.3 12 9.3C13.7673 9.3 15.2 10.7327 15.2 12.5Z'
        stroke='currentColor'
        strokeWidth='1.6'
      />
    </svg>
  );
}

/** V4 / Dog Diary / Photo Add */
function DiaryPhotoAdd({ count = 0, maxCount = 3, image, className, onAdd, onRemove }: DiaryPhotoAddProps) {
  if (!image) {
    return (
      <button
        type='button'
        onClick={onAdd}
        className={cn(
          'bg-bg-0 radius-r3 gap-x1 flex size-[88px] flex-col items-center justify-center border border-dashed border-[#d9d9e0]',
          className
        )}
      >
        <CameraIcon className='text-fill-secondary-500' />
        <span className='caption1-semibold text-fill-secondary-500'>
          {count}/{maxCount}
        </span>
      </button>
    );
  }

  return (
    <div className={cn('bg-bg-0 radius-r3 relative size-[88px]', className)}>
      <div className='radius-r3 size-full overflow-hidden'>{image}</div>
      <DiaryPhotoRemove onClick={onRemove} className='absolute top-[-6px] right-[-6px]' />
    </div>
  );
}

export { DiaryPhotoAdd };
export type { DiaryPhotoAddProps };
