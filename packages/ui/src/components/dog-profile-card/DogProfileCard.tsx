import { type ReactNode } from 'react';

import { Female, Male, Maindog } from '@knockdog/icons';

import { cn } from '@knockdog/ui/lib';

const DOG_GENDER = {
  female: 'female',
  male: 'male',
} as const;

type DogGender = keyof typeof DOG_GENDER;

interface DogProfileCardProps {
  name?: string;
  breed?: string;
  age?: string;
  gender?: DogGender;
  isRepresentative?: boolean;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

/** V4 / Dog Profile Card */
function DogProfileCard({
  name = '찹찹츄',
  breed = '일곱글자이상말줄임적용',
  age = '6살',
  gender = 'female',
  isRepresentative = true,
  children,
  className,
  onClick,
}: DogProfileCardProps) {
  const GenderIcon = gender === 'male' ? Male : Female;

  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'border-line-200 bg-bg-0 radius-r4 pb-x3 gap-x2 flex h-[190px] w-[140px] flex-col items-center overflow-hidden border border-solid text-left',
        className
      )}
    >
      <span className='bg-fill-secondary-100 relative h-[130px] w-full overflow-hidden'>
        {children}
        {isRepresentative ? <Maindog className='text-text-accent absolute top-[7px] left-[7px] size-x6' /> : null}
      </span>
      <span className='px-x3 flex w-full flex-col'>
        <span className='gap-x0_5 flex items-center'>
          <span className='body1-bold text-text-primary'>{name}</span>
          <GenderIcon className='text-text-accent size-x4 shrink-0' />
        </span>
        <span className='gap-x1 flex items-center'>
          <span className='caption1-regular text-text-secondary max-w-[84px] truncate'>{breed}</span>
          <span className='bg-text-secondary size-x0_5 shrink-0 rounded-full' />
          <span className='caption1-regular text-text-secondary'>{age}</span>
        </span>
      </span>
    </button>
  );
}

export { DogProfileCard, DOG_GENDER };
export type { DogGender, DogProfileCardProps };
