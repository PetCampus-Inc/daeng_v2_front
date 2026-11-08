import { type ReactNode, type SVGProps } from 'react';

import { ChevronRight } from '@knockdog/icons';

import { cn } from '@knockdog/ui/lib';

const DEFAULT_BODY =
  '오늘은 공원에서 낙엽을 잔뜩 밟았어! 바스락 소리가 너무 좋아서 계속 뛰어다녔지. 집에 오는 길에 다리가 조금 아팠지만 엄마가 안아줘서 괜찮았어. 내일도 또 가고 싶어!';

interface DiaryThumbnailProps {
  title?: string;
  body?: string;
  photoCount?: number;
  image?: ReactNode;
  className?: string;
  onViewAll?: () => void;
}

function PhotoCountIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <path
        d='M5.83333 4.66667H11.6667C12.311 4.66667 12.8333 5.189 12.8333 5.83333V11.6667C12.8333 12.311 12.311 12.8333 11.6667 12.8333H5.83333C5.189 12.8333 4.66667 12.311 4.66667 11.6667V5.83333C4.66667 5.189 5.189 4.66667 5.83333 4.66667Z'
        stroke='currentColor'
        strokeWidth='1.2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M2.33333 9.33333C1.69167 9.33333 1.16667 8.80833 1.16667 8.16667V2.33333C1.16667 1.69167 1.69167 1.16667 2.33333 1.16667H8.16667C8.80833 1.16667 9.33333 1.69167 9.33333 2.33333'
        stroke='currentColor'
        strokeWidth='1.2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

/** V4 / Dog Diary / Diary Thumbnail */
function DiaryThumbnail({
  title = '공원에서 신나게 낙엽 밟기',
  body = DEFAULT_BODY,
  photoCount = 1,
  image,
  className,
  onViewAll,
}: DiaryThumbnailProps) {
  return (
    <article className={cn('gap-x4 flex w-full flex-col', className)}>
      <div className='gap-x1 py-x0_5 flex items-center'>
        <h3 className='h3-extrabold text-primitive-neutral-800 min-w-0 flex-1 truncate'>{title}</h3>
        <button type='button' onClick={onViewAll} className='gap-x0_5 flex shrink-0 items-center'>
          <span className='label-semibold text-fill-secondary-500'>전체 보기</span>
          <ChevronRight className='text-fill-secondary-500 size-[18px]' />
        </button>
      </div>
      <div className='gap-x3 flex items-start'>
        <div className='relative h-[87px] w-[84px] shrink-0'>
          {photoCount > 1 ? (
            <span className='bg-primitive-neutral-300 radius-r3 absolute top-[-1px] left-[6px] h-[84px] w-[72px]' />
          ) : null}
          <div className='border-bg-0 radius-r3 absolute top-[3px] left-0 size-[84px] overflow-hidden border-2'>
            {image}
            <span className='bg-text-primary/60 absolute right-[6px] bottom-1 flex items-center gap-[3px] rounded-full px-x2 py-x0_5'>
              <PhotoCountIcon className='text-fill-secondary-100' />
              <span className='caption1-semibold text-text-primary-inverse'>{photoCount}</span>
            </span>
          </div>
        </div>
        <p className='body2-regular text-text-secondary line-clamp-3 min-w-0 flex-1 pt-x1'>{body}</p>
      </div>
    </article>
  );
}

export { DiaryThumbnail };
export type { DiaryThumbnailProps };
