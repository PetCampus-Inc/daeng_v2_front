import { type ReactNode } from 'react';

import { cn } from '@knockdog/ui/lib';

interface DiarySampleCardProps {
  date?: string;
  body?: string;
  image?: ReactNode;
  className?: string;
}

/** V4 / Dog Diary / Sample Diary */
function DiarySampleCard({
  date = '6월 15일 월요일',
  body = '오늘은 공원에서 낙엽을 잔뜩 밟았어!\n바스락 소리가 너무 좋아서 계속 뛰어다녔지.\n집에 오는 길에 다리가 조금 아팠지만 엄마가 안아줘서 괜찮았어. 내일도 또 가고 싶어!',
  image,
  className,
}: DiarySampleCardProps) {
  return (
    <article
      className={cn(
        'bg-bg-0 radius-r5 border-line-150 flex w-[302px] flex-col overflow-hidden border shadow-[0_10px_28px_-10px_rgba(20,23,31,0.22)]',
        className
      )}
    >
      <div className='bg-fill-secondary-100 h-[196px] w-full'>{image}</div>
      <div className='gap-x1_5 flex flex-col px-[18px] pt-x4 pb-[18px]'>
        <p className='caption1-semibold text-fill-secondary-500'>{date}</p>
        <p className='body2-regular text-primitive-neutral-800 line-clamp-3 whitespace-pre-line'>{body}</p>
      </div>
    </article>
  );
}

export { DiarySampleCard };
export type { DiarySampleCardProps };
