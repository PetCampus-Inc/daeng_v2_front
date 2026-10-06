'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

interface LastUpdatedSectionProps {
  lastUpdated: string;
}

export function LastUpdatedSection({ lastUpdated }: LastUpdatedSectionProps) {
  // FIX: 가희
  const params = useParams();
  const slug = params?.slug;

  return (
    <div className='flex items-center justify-between py-4'>
      <div className='flex flex-col'>
        <span className='body1-bold'>최종 정보 업데이트</span>
        <span className='body2-regular text-text-tertiary'>{lastUpdated}</span>
      </div>
      <div>
        <Link
          href={`/company/${slug}/report-info-update`}
          className='body2-bold text-text-accent mx-auto flex h-x5 w-[104px] items-center justify-center text-center underline'
        >
          정보 수정 제보하기
        </Link>
      </div>
    </div>
  );
}
