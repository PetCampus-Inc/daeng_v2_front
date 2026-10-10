'use client';

import { useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import Image from 'next/image';
import { overlay } from 'overlay-kit';
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import { RemoveScroll } from 'react-remove-scroll';

import type { KnockdogReview } from '../config/knockdogReviewMock';

import { useNativeBackToClose } from '@shared/lib/bridge';
import { ImageGalleryViewer } from '@shared/ui/image-gallery-viewer';

interface KnockdogReviewCardProps {
  review: KnockdogReview;
  onHelpfulToggle: (reviewId: string) => void;
  onEdit: (reviewId: string) => void;
  onDelete: (reviewId: string) => void;
}

const ENROLLMENT_LABEL = {
  attending: '유치원을 다니는 중이에요',
  former: '유치원을 다녔어요',
} as const;

function formatKnockdogReviewDate(createdAt: string) {
  const [datePart] = createdAt.split('T');
  const [year, month, day] = datePart?.split('-') ?? [];
  if (!year || !month || !day) return '';
  return `${year}. ${month}. ${day}`;
}

function KnockdogReviewMoreMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    placement: 'bottom-end',
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(4), flip(), shift({ padding: 16 })],
    whileElementsMounted: autoUpdate,
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context, { outsidePress: true, outsidePressEvent: 'pointerdown' }),
    useRole(context, { role: 'menu' }),
  ]);

  useNativeBackToClose(isOpen, () => setIsOpen(false));

  const handleEditClick = (event: MouseEvent) => {
    event.stopPropagation();
    setIsOpen(false);
    onEdit();
  };

  const handleDeleteClick = (event: MouseEvent) => {
    event.stopPropagation();
    setIsOpen(false);
    onDelete();
  };

  return (
    <>
      <button
        ref={refs.setReference}
        {...getReferenceProps()}
        type='button'
        aria-label='더보기'
        aria-expanded={isOpen}
        className='inline-flex size-6 shrink-0 items-center justify-center'
      >
        <Icon icon='More' className='text-fill-secondary-400 size-6 rotate-90' />
      </button>
      {isOpen ? (
        <RemoveScroll forwardProps>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
              className='border-line-200 bg-bg-0 radius-r2 z-999 flex w-[120px] flex-col gap-4 border p-3 shadow-sm'
            >
              <button
                type='button'
                role='menuitem'
                className='body2-semibold text-text-primary flex w-full items-center justify-between'
                onClick={handleEditClick}
              >
                수정하기
                <Icon icon='Edit' className='text-text-secondary size-4' />
              </button>
              <button
                type='button'
                role='menuitem'
                className='body2-semibold text-text-primary flex w-full items-center justify-between'
                onClick={handleDeleteClick}
              >
                삭제하기
                <Icon icon='Trash' className='text-text-secondary size-4' />
              </button>
            </div>
          </FloatingFocusManager>
        </RemoveScroll>
      ) : null}
    </>
  );
}

function isRemoteReviewImage(src: string) {
  return src.startsWith('blob:') || src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://');
}

function ReviewImage({ src, sizes }: { src: string; sizes: string }) {
  if (isRemoteReviewImage(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- 기기에서 고른 사진·원격 URL
      <img src={src} alt='' className='size-full object-cover' />
    );
  }

  return <Image src={src} alt='' fill sizes={sizes} className='object-cover' />;
}

function KnockdogReviewImages({ images }: { images: string[] }) {
  if (images.length === 0) return null;

  const handleSelect = (index: number) => {
    overlay.open(({ isOpen, close }) => (
      <ImageGalleryViewer
        isOpen={isOpen}
        close={close}
        images={images}
        initialIndex={index}
        ariaLabel='리뷰 사진 보기'
      />
    ));
  };

  if (images.length === 1) {
    const image = images[0];
    if (!image) return null;

    return (
      <button
        type='button'
        onClick={() => handleSelect(0)}
        className='bg-bg-100 relative h-60 w-full overflow-hidden rounded-lg'
      >
        <ReviewImage src={image} sizes='358px' />
      </button>
    );
  }

  return (
    <div className={cn('grid gap-2', images.length === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
      {images.map((image, index) => (
        <button
          key={`${image}-${index}`}
          type='button'
          onClick={() => handleSelect(index)}
          className='bg-bg-100 relative aspect-square overflow-hidden rounded-lg'
        >
          <ReviewImage src={image} sizes='33vw' />
        </button>
      ))}
    </div>
  );
}

function KnockdogReviewCard({ review, onHelpfulToggle, onEdit, onDelete }: KnockdogReviewCardProps) {
  const contentRef = useRef<HTMLParagraphElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const showExpandButton = isOverflowing || isExpanded;

  useLayoutEffect(() => {
    const element = contentRef.current;
    if (!element || isExpanded) return;
    setIsOverflowing(element.scrollHeight > element.clientHeight + 1);
  }, [isExpanded, review.content]);

  return (
    <article className='flex flex-col gap-5 p-4'>
      <div className='flex w-full flex-col gap-2'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-0.5'>
            <span className='flex size-5 items-center justify-center'>
              {/* eslint-disable-next-line @next/next/no-img-element -- 별 SVG 원본 크기 유지 */}
              <img src='/images/img_review_card_star.svg' alt='' />
            </span>
            <p className='body1-bold text-fill-secondary-700'>{review.score.toFixed(1)}</p>
          </div>
          <div className='flex items-center gap-2'>
            <p className='body2-regular text-fill-secondary-500'>{formatKnockdogReviewDate(review.createdAt)}</p>
            {review.isMine ? (
              <KnockdogReviewMoreMenu onEdit={() => onEdit(review.id)} onDelete={() => onDelete(review.id)} />
            ) : null}
          </div>
        </div>

        <div className='flex flex-col gap-4'>
          <span
            className={cn(
              'caption1-semibold w-fit rounded-full border bg-white px-2 py-1',
              review.enrollment === 'attending'
                ? 'border-line-accent text-text-accent'
                : 'border-line-400 text-fill-secondary-500'
            )}
          >
            {ENROLLMENT_LABEL[review.enrollment]}
          </span>
          <div className='flex flex-col gap-1'>
            <p ref={contentRef} className={cn('body1-regular text-text-primary', !isExpanded && 'line-clamp-3')}>
              {review.content}
            </p>
            {showExpandButton ? (
              <button
                type='button'
                className='label-semibold text-text-primary flex w-fit items-center gap-1 py-1'
                onClick={() => setIsExpanded((expanded) => !expanded)}
              >
                {isExpanded ? '접기' : '더보기'}
                <Icon icon='ChevronBottom' className={cn('size-4', isExpanded && 'rotate-180')} />
              </button>
            ) : null}
          </div>
          <KnockdogReviewImages images={review.images} />
        </div>
      </div>

      <div className='flex items-center justify-between'>
        <button
          type='button'
          aria-pressed={review.isHelpful}
          onClick={() => onHelpfulToggle(review.id)}
          className='border-line-200 flex items-center gap-1 rounded-full border px-3 py-2'
        >
          <span className='flex size-5 items-center justify-center'>
            {/* eslint-disable-next-line @next/next/no-img-element -- 도움돼요 SVG 원본 크기 유지 */}
            <img src={review.isHelpful ? '/images/img_review_like_fill.svg' : '/images/img_review_like.svg'} alt='' />
          </span>
          <span className={cn('label-semibold', review.isHelpful ? 'text-text-primary' : 'text-fill-secondary-500')}>
            도움돼요
          </span>
          {review.helpfulCount > 0 ? (
            <span
              className={cn(
                review.isHelpful ? 'label-extrabold text-text-accent' : 'label-semibold text-fill-secondary-500'
              )}
            >
              {review.helpfulCount.toLocaleString('ko-KR')}
            </span>
          ) : null}
        </button>
        <button type='button' className='label-semibold text-fill-secondary-500 py-1'>
          신고하기
        </button>
      </div>
    </article>
  );
}

export { KnockdogReviewCard };
