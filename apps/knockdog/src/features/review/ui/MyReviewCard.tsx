'use client';

import { useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
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
import { RemoveScroll } from 'react-remove-scroll';

import type { MyWrittenReview } from '../config/myWrittenReview';

import { useNativeBackToClose } from '@shared/lib/bridge';
import { ImageGalleryViewer } from '@shared/ui/image-gallery-viewer';

interface MyReviewCardProps {
  review: MyWrittenReview;
  onEdit: (review: MyWrittenReview) => void;
  onDelete: (review: MyWrittenReview) => void;
}

const SCROLLBAR_THUMB_WIDTH = 50;

function formatMyReviewDate(createdAt: string) {
  const [datePart] = createdAt.split('T');
  const [year, month, day] = datePart?.split('-') ?? [];
  if (!year || !month || !day) return '';
  return `${year}. ${month}. ${day}`;
}

function MyReviewMoreMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
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
        <Icon icon='More' className='text-fill-secondary-700 size-6 rotate-90' />
      </button>
      {isOpen ? (
        <RemoveScroll forwardProps>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
              className='border-line-200 bg-bg-0 radius-r2 z-999 flex w-[120px] flex-col gap-4 border p-3'
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
                className='body2-semibold text-error flex w-full items-center justify-between'
                onClick={handleDeleteClick}
              >
                삭제하기
                <Icon icon='Trash' className='text-error size-4' />
              </button>
            </div>
          </FloatingFocusManager>
        </RemoveScroll>
      ) : null}
    </>
  );
}

function MyReviewPhotoStrip({ images }: { images: string[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [thumbLeft, setThumbLeft] = useState(0);
  const [hasOverflow, setHasOverflow] = useState(false);

  const updateThumb = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const maxScroll = scroller.scrollWidth - scroller.clientWidth;
    const trackWidth = scroller.clientWidth;
    const nextLeft =
      maxScroll <= 0 ? 0 : (scroller.scrollLeft / maxScroll) * (trackWidth - SCROLLBAR_THUMB_WIDTH);

    setHasOverflow(maxScroll > 1);
    setThumbLeft(nextLeft);
  };

  useLayoutEffect(() => {
    updateThumb();
  }, [images]);

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

  return (
    <div>
      <div
        ref={scrollerRef}
        onScroll={updateThumb}
        className='flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
      >
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type='button'
            onClick={() => handleSelect(index)}
            className='bg-fill-secondary-200 radius-r3 size-24 shrink-0 overflow-hidden'
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- 리뷰 첨부 썸네일 */}
            <img src={image} alt='' className='size-full object-cover' />
          </button>
        ))}
      </div>
      {hasOverflow ? (
        <div className='bg-bg-50 relative mt-2 h-1 w-full rounded-full'>
          <div
            className='bg-fill-secondary-700 absolute top-0 h-1 rounded-full'
            style={{ width: SCROLLBAR_THUMB_WIDTH, transform: `translateX(${thumbLeft}px)` }}
          />
        </div>
      ) : null}
    </div>
  );
}

function MyReviewCard({ review, onEdit, onDelete }: MyReviewCardProps) {
  return (
    <article className='flex flex-col gap-4'>
      <div className='flex items-start gap-2'>
        {review.kindergartenImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- 유치원 대표 이미지
          <img src={review.kindergartenImage} alt='' className='size-12 shrink-0 rounded-full object-cover' />
        ) : (
          <div className='bg-fill-secondary-100 flex size-12 shrink-0 items-center justify-center rounded-full'>
            <Icon icon='Paw' className='text-fill-secondary-300 size-5' />
          </div>
        )}
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2'>
            <p className='body1-bold text-text-primary min-w-0 flex-1 truncate'>{review.kindergartenName}</p>
            <MyReviewMoreMenu onEdit={() => onEdit(review)} onDelete={() => onDelete(review)} />
          </div>
          <div className='mt-1 flex items-center gap-2'>
            <span className='flex items-center gap-0.5'>
              <span className='flex size-4 items-center justify-center'>
                {/* eslint-disable-next-line @next/next/no-img-element -- 별점 아이콘 원본 색 유지 */}
                <img src='/images/img_review_card_star.svg' alt='' className='size-4' />
              </span>
              <span className='body2-bold text-fill-secondary-700'>{review.score.toFixed(1)}</span>
            </span>
            <span className='body2-regular text-text-tertiary'>{formatMyReviewDate(review.createdAt)}</span>
          </div>
        </div>
      </div>
      <p className='body1-regular text-text-primary'>{review.content}</p>
      {review.images.length > 0 ? <MyReviewPhotoStrip images={review.images} /> : null}
      <button
        type='button'
        disabled
        className='border-line-200 flex w-fit items-center gap-1 rounded-full border px-3 py-2'
      >
        <span className='flex size-5 items-center justify-center'>
          {/* eslint-disable-next-line @next/next/no-img-element -- 도움돼요 SVG 원본 크기 유지 */}
          <img src='/images/img_review_like.svg' alt='' />
        </span>
        <span className='label-semibold text-fill-secondary-500'>도움돼요</span>
        {review.helpfulCount > 0 ? (
          <span className='label-semibold text-fill-secondary-500'>
            {review.helpfulCount.toLocaleString('ko-KR')}
          </span>
        ) : null}
      </button>
    </article>
  );
}

export { MyReviewCard };
