'use client';

import Image from 'next/image';

interface KindergartenNewsSearchEmptyResultProps {
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
}

/**
 * 소식 검색 결과 0건 empty
 * - 레이아웃: 소식 empty / PageError와 동일 (200px + gap-5 + 타이틀/설명)
 * - 일러: `/images/image_search_none.png`
 */
function KindergartenNewsSearchEmptyResult({
  title,
  description,
  imageSrc = '/images/image_search_none.png',
  imageAlt = '검색 결과 없음',
}: KindergartenNewsSearchEmptyResultProps) {
  return (
    <div className='flex min-h-0 w-full flex-1 items-center justify-center px-4'>
      <div className='flex w-full flex-col items-center gap-5 text-center'>
        <div className='relative size-[200px] shrink-0'>
          <Image src={imageSrc} alt={imageAlt} fill className='object-contain' sizes='200px' priority />
        </div>
        <div className='flex flex-col items-center gap-1'>
          <p className='h2-extrabold text-text-primary'>{title}</p>
          <p className='body1-regular text-text-secondary'>{description}</p>
        </div>
      </div>
    </div>
  );
}

export { KindergartenNewsSearchEmptyResult };
export type { KindergartenNewsSearchEmptyResultProps };
