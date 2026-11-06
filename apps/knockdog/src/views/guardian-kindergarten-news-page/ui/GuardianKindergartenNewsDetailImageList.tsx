'use client';

import { useState } from 'react';
import { overlay } from 'overlay-kit';

import { guardianKindergartenNewsContent } from '@views/guardian-kindergarten-news-page/config/guardianKindergartenNewsContent';
import { GuardianKindergartenNewsImageViewer } from '@views/guardian-kindergarten-news-page/ui/GuardianKindergartenNewsImageViewer';
import { Skeleton } from '@shared/ui/skeleton';

interface GuardianKindergartenNewsDetailImageListProps {
  imageUrls: string[];
}

interface DetailImageItemProps {
  src: string;
  index: number;
  total: number;
  onOpen: (index: number) => void;
}

/** 등록 원본 비율로 풀워스 노출. 로드 전 스켈레톤 */
function DetailImageItem({ src, index, total, onOpen }: DetailImageItemProps) {
  const { detail } = guardianKindergartenNewsContent;
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <button
      type='button'
      aria-label={detail.imageAriaLabel.replace('{index}', String(index + 1)).replace('{total}', String(total))}
      className='relative block w-full overflow-hidden'
      onClick={() => onOpen(index)}
    >
      {!isLoaded ? <Skeleton className='aspect-[3/4] w-full' /> : null}
      {/* eslint-disable-next-line @next/next/no-img-element -- 원본 비율(h-auto) 노출 */}
      <img
        src={src}
        alt=''
        className={
          isLoaded ? 'relative h-auto w-full' : 'pointer-events-none absolute inset-0 size-full opacity-0'
        }
        draggable={false}
        onLoad={() => setIsLoaded(true)}
      />
    </button>
  );
}

function GuardianKindergartenNewsDetailImageList({
  imageUrls,
}: GuardianKindergartenNewsDetailImageListProps) {
  if (imageUrls.length === 0) return null;

  const handleOpen = (index: number) => {
    overlay.open(({ isOpen, close }) => (
      <GuardianKindergartenNewsImageViewer
        isOpen={isOpen}
        close={close}
        imageUrls={imageUrls}
        initialIndex={index}
      />
    ));
  };

  return (
    <div className='flex w-full flex-col gap-5'>
      {imageUrls.map((src, index) => (
        <DetailImageItem
          key={`${src}-${index}`}
          src={src}
          index={index}
          total={imageUrls.length}
          onOpen={handleOpen}
        />
      ))}
    </div>
  );
}

export { GuardianKindergartenNewsDetailImageList };
