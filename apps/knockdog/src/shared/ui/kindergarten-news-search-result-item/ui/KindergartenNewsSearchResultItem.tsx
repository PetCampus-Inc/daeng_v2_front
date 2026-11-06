'use client';

import { useState } from 'react';
import Image from 'next/image';

import { TextHighlights } from '@shared/ui/text-highlights';
import { Skeleton } from '@shared/ui/skeleton';

interface KindergartenNewsSearchResultItemProps {
  publishedAtLabel: string;
  title: string;
  body: string;
  thumbnailUrl: string | null;
  highlightQuery: string;
  onClick: () => void;
}

/**
 * 유치원 소식 검색 결과 카드 (보호자/원장 공통)
 * - 목록 카드와 다른 레이아웃: 날짜 / 제목·본문 하이라이트 / 선택적 썸네일
 * - 공지 고정·읽음·더보기 미노출
 */
function KindergartenNewsSearchResultItem({
  publishedAtLabel,
  title,
  body,
  thumbnailUrl,
  highlightQuery,
  onClick,
}: KindergartenNewsSearchResultItemProps) {
  const [isThumbnailLoaded, setIsThumbnailLoaded] = useState(false);

  return (
    <article
      role='button'
      tabIndex={0}
      className='border-line-200 bg-bg-0 flex w-full cursor-pointer flex-col gap-2 border-b p-4'
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className='flex w-full items-center'>
        <span className='body2-semibold text-text-secondary whitespace-nowrap'>{publishedAtLabel}</span>
      </div>

      <div className='flex w-full items-start gap-2'>
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <p className='body1-bold text-text-primary truncate'>
            {TextHighlights(title, highlightQuery)}
          </p>
          <p className='body2-regular text-text-secondary line-clamp-2 whitespace-pre-wrap'>
            {TextHighlights(body, highlightQuery)}
          </p>
        </div>

        {thumbnailUrl ? (
          <div className='radius-r3 relative size-16 shrink-0 overflow-hidden'>
            {!isThumbnailLoaded ? <Skeleton className='absolute inset-0 size-full' /> : null}
            <Image
              src={thumbnailUrl}
              alt=''
              fill
              className={`object-cover transition-opacity ${isThumbnailLoaded ? 'opacity-100' : 'opacity-0'}`}
              sizes='64px'
              onLoadingComplete={() => setIsThumbnailLoaded(true)}
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}

export { KindergartenNewsSearchResultItem };
export type { KindergartenNewsSearchResultItemProps };
