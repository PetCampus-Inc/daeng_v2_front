'use client';

import { useState } from 'react';
import { ActionButton, Icon } from '@knockdog/ui';

import { useKindergartenMainQuery } from '@features/kindergarten-main';
import { useBasePoint } from '@entities/user';
import { useStackNavigation } from '@shared/lib/bridge';
import { resolvePublicImageSrc } from '@shared/lib/utils';
import { Skeleton } from '@shared/ui/skeleton';

const FALLBACK_COORD = { lng: 126.883439, lat: 37.511281 };

interface WriteReviewCompleteProps {
  id: string;
  onConfirm: () => void;
}

function KindergartenCard({ id }: { id: string }) {
  const { push } = useStackNavigation();
  const { coord } = useBasePoint();
  const { data, isLoading } = useKindergartenMainQuery({
    id,
    lng: coord?.lng ?? FALLBACK_COORD.lng,
    lat: coord?.lat ?? FALLBACK_COORD.lat,
    enabled: Boolean(id),
  });
  const imageSrc = resolvePublicImageSrc(data?.banner?.[0]);
  const [hasImageError, setHasImageError] = useState(false);
  const showImage = Boolean(imageSrc) && !hasImageError;

  const handleClick = () => {
    push({ pathname: `/kindergarten/${id}`, params: { entrySource: 'kindergarten-list' } });
  };

  if (isLoading) {
    return <Skeleton className='radius-r3 h-[74px] w-full' />;
  }

  return (
    <button
      type='button'
      onClick={handleClick}
      className='border-line-200 radius-r3 bg-bg-0 flex h-[74px] w-full items-center justify-between border p-4 text-left'
    >
      <div className='gap-x2 flex min-w-0 items-center'>
        <div className='relative size-11 shrink-0 overflow-hidden rounded-lg'>
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- 썸네일은 절대 URL 또는 S3 키
            <img
              src={imageSrc}
              alt=''
              className='size-full object-cover'
              onError={() => setHasImageError(true)}
            />
          ) : (
            <div className='bg-fill-secondary-50 flex size-full items-center justify-center' aria-hidden='true'>
              <Icon icon='Paw' className='text-fill-secondary-300 size-5' />
            </div>
          )}
        </div>
        <div className='flex min-w-0 flex-col items-start'>
          <p className='body1-bold text-text-primary w-full truncate'>{data?.title}</p>
          <p className='body2-regular text-text-secondary w-full truncate'>{data?.roadAddress}</p>
        </div>
      </div>
      <Icon icon='ChevronRight' className='text-fill-secondary-500 size-6 shrink-0' />
    </button>
  );
}

export function WriteReviewComplete({ id, onConfirm }: WriteReviewCompleteProps) {
  return (
    <div className='bg-bg-0 flex h-full flex-col'>
      <div className='flex min-h-0 flex-1 flex-col items-center justify-center px-4'>
        <div className='flex w-full flex-col items-center gap-2'>
          <div className='relative size-[200px] shrink-0 overflow-hidden'>
            {/* eslint-disable-next-line @next/next/no-img-element -- 완료 일러스트 SVG 원본 크기 유지 */}
            <img src='/images/img_review_complete.svg' alt='' className='absolute top-[22px] left-[7px]' />
          </div>
          <div className='flex w-full flex-col items-center gap-5'>
            <div className='flex w-full flex-col items-center gap-1 text-center'>
              <p className='body1-bold text-text-primary'>유치원 이용 리뷰가 등록되었어요</p>
              <p className='body2-regular text-text-secondary'>소중한 리뷰를 남겨 주셔서 감사해요.</p>
            </div>
            <KindergartenCard id={id} />
          </div>
        </div>
      </div>
      <div className='bg-bg-0 shrink-0 p-4'>
        <ActionButton type='button' size='large' onClick={onConfirm}>
          확인
        </ActionButton>
      </div>
    </div>
  );
}
