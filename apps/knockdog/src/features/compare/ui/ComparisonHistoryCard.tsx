'use client';

import Image from 'next/image';
import { KindergartenShortInfo, s3ToUrl, CTAG_MAP } from '@entities/compare';
import { Icon } from '@knockdog/ui';
import { useDeleteComparisonHistoryMutation } from '../api/useDeleteComparisonHistoryMutation';
import { useStackNavigation } from '@shared/lib/bridge';

interface ComparisonHistoryCardProps {
  id: number;
  kindergartens: [KindergartenShortInfo, KindergartenShortInfo];
  className?: string;
}

function ComparisonHistoryCard({ id, kindergartens, className = '' }: ComparisonHistoryCardProps) {
  const [left, right] = kindergartens;
  const { push } = useStackNavigation();
  const { mutate: deleteHistory } = useDeleteComparisonHistoryMutation();

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    deleteHistory(id);
  }

  function handleCardClick() {
    if (!left?.id || !right?.id) return;
    const ids = [String(left.id), String(right.id)];
    push({ pathname: `/compare-complete`, query: { ids } });
  }

  function getCategoryLabels(categories: string[]): string {
    if (!categories || !Array.isArray(categories)) return '';
    return categories
      .map((category) => CTAG_MAP[category as keyof typeof CTAG_MAP])
      .filter((label) => label !== undefined)
      .join(' ・ ');
  }

  if (!left || !right) return null;

  return (
    <div
      className={`bg-fill-secondary-0 border-line-100 flex cursor-pointer flex-col rounded-lg border p-4 shadow-sm transition-opacity hover:opacity-80 ${className}`}
      onClick={handleCardClick}
    >
      <button className='mb-2 ml-auto flex items-center justify-end gap-1' onClick={handleDelete} type='button'>
        <span className='label-semibold text-text-tertiary'>삭제</span>
        <Icon className='size-x4 text-fill-secondary-400' icon='Close' />
      </button>
      <div className='flex flex-col gap-3'>
        <div className='flex items-center gap-2'>
          <div className='aspect-[4/3] w-full overflow-hidden rounded-lg'>
            <Image
              className='h-full w-full object-cover'
              src={s3ToUrl(left.thumbnailS3Key) || '/images/img_default_image.png'}
              alt={`${left.name} 이미지`}
              width={160}
              height={120}
            />
          </div>
          <span className='h3-extrabold shrink-0'>:</span>
          <div className='aspect-[4/3] w-full overflow-hidden rounded-lg'>
            <Image
              className='h-full w-full object-cover'
              src={s3ToUrl(right.thumbnailS3Key) || '/images/img_default_image.png'}
              alt={`${right.name} 이미지`}
              width={160}
              height={120}
            />
          </div>
        </div>
        <div className='flex gap-3'>
          <div className='flex min-w-0 flex-1 flex-col'>
            <h3 className='body1-extrabold truncate'>{left.name}</h3>
            <span className='label-medium text-text-tertiary line-clamp-1'>{getCategoryLabels(left.categories)}</span>
          </div>
          <div className='shrink-0' />
          <div className='flex min-w-0 flex-1 flex-col'>
            <h3 className='body1-extrabold truncate'>{right.name}</h3>
            <span className='label-medium text-text-tertiary line-clamp-1'>{getCategoryLabels(right.categories)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ComparisonHistoryCard };
