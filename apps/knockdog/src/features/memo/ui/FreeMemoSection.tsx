'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { overlay } from 'overlay-kit';
import { ActionButton, Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import { useParams } from 'next/navigation';

import { useStackNavigation } from '@shared/lib/bridge';
import { formatKstDateLabel, formatKstDayLabel, formatKstTimeLabel, getKstDateParts } from '@shared/lib/calendar-date';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';
import { ImageGalleryViewer } from '@shared/ui/image-gallery-viewer';

import { useMemoQuery } from '../api/useMemoQuery';
import { toMemoPhotoUrl } from '../lib/toMemoPhotoUrl';
import { MemoMoreMenu } from './MemoMoreMenu';

interface FreeMemoSectionProps {
  kindergartenId?: string;
}

function parseMemoWrittenAt(value: string | number[] | null | undefined) {
  if (value == null) return null;

  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0] = value;
    if (typeof year !== 'number' || typeof month !== 'number' || typeof day !== 'number') return null;
    return new Date(year, month - 1, day, hour, minute);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatMemoWrittenAt(value: string | number[] | null | undefined) {
  const date = parseMemoWrittenAt(value);
  if (!date) return '';

  const { year } = getKstDateParts(date);
  const isCurrentYear = year === getKstDateParts(new Date()).year;
  const dateLabel = isCurrentYear ? formatKstDateLabel(date) : `${year}년 ${formatKstDateLabel(date)}`;

  return `${dateLabel} ${formatKstDayLabel(date)} ${formatKstTimeLabel(date)}`;
}

export function FreeMemoSection({ kindergartenId }: FreeMemoSectionProps) {
  const params = useParams<{ id: string }>();
  const id = kindergartenId ?? params?.id;
  const { push } = useStackNavigation();
  const contentRef = useRef<HTMLParagraphElement>(null);
  const [expandedContent, setExpandedContent] = useState<string | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const { data: memo = { content: '', photos: [] }, isLoading } = useMemoQuery(id ?? '', { enabled: !!id });
  const content = memo.content ?? '';
  const isExpanded = expandedContent === content;
  const writtenAtLabel = formatMemoWrittenAt(memo.updatedAt ?? memo.modifiedAt ?? memo.writtenAt ?? memo.createdAt);
  const photoUrls = memo.photos.map((photo) => toMemoPhotoUrl(photo.key));
  const hasMemo = content.trim().length > 0 || memo.photos.length > 0;

  const handleEditMemo = () => {
    if (!id) return;
    push({ pathname: `/kindergarten/${id}/edit-memo` });
  };

  const handleImageClick = (index: number) => {
    overlay.open(({ isOpen, close }) => (
      <ImageGalleryViewer
        isOpen={isOpen}
        close={close}
        images={photoUrls}
        initialIndex={index}
        ariaLabel='메모 사진 보기'
        native
      />
    ));
  };

  useLayoutEffect(() => {
    const element = contentRef.current;
    if (!element || isExpanded) return;
    setIsOverflowing(element.scrollHeight > element.clientHeight + 1);
  }, [content, isExpanded]);

  if (!id) throw new Error('Company ID is required for free memo section');

  const header = (
    <div className='flex items-center justify-between gap-1 py-3'>
      <div className='flex min-w-0 items-center gap-1'>
        <Icon icon='Note' className='text-text-accent size-6 shrink-0' />
        <span className='h3-extrabold'>자유메모</span>
      </div>
      {!isLoading && hasMemo ? <MemoMoreMenu targetId={id} onEdit={handleEditMemo} /> : null}
    </div>
  );

  if (isLoading) {
    return (
      <div>
        {header}
        <DelayedLoadingSpinner isLoading={isLoading} layout='inline' className='py-8' />
      </div>
    );
  }

  if (!hasMemo) {
    return (
      <div>
        {header}
        <p className='body1-medium text-text-tertiary p-4 text-center'>자유롭게 유치원 메모를 작성하세요</p>
        <div className='pb-4'>
          <ActionButton variant='secondaryLine' onClick={handleEditMemo}>
            자유메모 작성하기
          </ActionButton>
        </div>
      </div>
    );
  }

  return (
    <div>
      {header}
      <div className='flex flex-col gap-3'>
        {writtenAtLabel ? <p className='body2-semibold text-text-secondary'>{writtenAtLabel}</p> : null}
        {photoUrls.length > 0 ? (
          <div className='scrollbar-hide flex gap-3 overflow-x-auto'>
            {photoUrls.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type='button'
                onClick={() => handleImageClick(index)}
                className='radius-r2 bg-bg-100 size-[120px] shrink-0 overflow-hidden'
              >
                {/* 서명된 S3 URL이라 next/image 호스트 설정 대신 img를 쓴다 */}
                <img src={image} alt='' width={120} height={120} className='size-[120px] object-cover' draggable={false} />
              </button>
            ))}
          </div>
        ) : null}
        {content.trim() ? (
          <p
            ref={contentRef}
            className={cn('body1-regular text-text-primary whitespace-pre-line', !isExpanded && 'line-clamp-3')}
          >
            {content}
          </p>
        ) : null}
        {content.trim() && (isOverflowing || isExpanded) ? (
          <button
            type='button'
            className='label-semibold text-text-primary flex w-fit items-center gap-1 py-1'
            onClick={() => setExpandedContent(isExpanded ? null : content)}
          >
            {isExpanded ? '접기' : '더보기'}
            <Icon icon='ChevronBottom' className={cn('size-4', isExpanded && 'rotate-180')} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
