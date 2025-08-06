'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

interface LastUpdatedSectionProps {
  lastUpdated: string;
}

export function LastUpdatedSection({ lastUpdated }: LastUpdatedSectionProps) {
  const { slug } = useParams();

  return (
    <div className='flex justify-between py-4'>
      <div className='flex flex-col'>
        <span className='body1-bold'>최종 정보 업데이트</span>
        <span className='body2-regular text-text-tertiary'>{lastUpdated}</span>
      </div>
      <div>
        <Link
          href={`/company/${slug}/report-info-update`}
          className='text-text-accent caption2-semibold border-accent rounded-lg border px-3 py-2'
        >
          정보 수정 제보하기
        </Link>
      </div>
    </div>
  );
}
