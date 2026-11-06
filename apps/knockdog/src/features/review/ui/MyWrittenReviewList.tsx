'use client';

import { useState } from 'react';
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
import { Divider, Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import { RemoveScroll } from 'react-remove-scroll';

import {
  MY_WRITTEN_REVIEW_SORT_OPTIONS,
  type MyWrittenReview,
  type MyWrittenReviewSort,
} from '../config/myWrittenReview';
import { MyReviewCard } from './MyReviewCard';

import { useNativeBackToClose } from '@shared/lib/bridge';

interface MyWrittenReviewListProps {
  reviews: MyWrittenReview[];
  totalCount?: number;
  sort: MyWrittenReviewSort;
  onSortChange: (sort: MyWrittenReviewSort) => void;
  onEdit: (review: MyWrittenReview) => void;
  onDelete: (review: MyWrittenReview) => void;
  lastItemRef?: (node: HTMLDivElement | null) => void;
}

function MyReviewSortButton({
  value,
  onChange,
}: {
  value: MyWrittenReviewSort;
  onChange: (value: MyWrittenReviewSort) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = MY_WRITTEN_REVIEW_SORT_OPTIONS.find((option) => option.value === value);
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

  return (
    <>
      <button
        ref={refs.setReference}
        {...getReferenceProps()}
        type='button'
        aria-expanded={isOpen}
        className='label-semibold text-text-tertiary flex items-center gap-1 py-1'
      >
        {selected?.label ?? '최신순'}
        <Icon icon='ChevronBottom' className={cn('size-4', isOpen && 'rotate-180')} />
      </button>
      {isOpen ? (
        <RemoveScroll forwardProps>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
              className='border-line-200 bg-bg-0 radius-r2 z-999 flex flex-col gap-4 border p-3'
            >
              {MY_WRITTEN_REVIEW_SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type='button'
                  role='menuitem'
                  className={cn(
                    'body2-semibold text-left whitespace-nowrap',
                    option.value === value ? 'text-text-accent' : 'text-text-primary'
                  )}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </FloatingFocusManager>
        </RemoveScroll>
      ) : null}
    </>
  );
}

function MyWrittenReviewList({
  reviews,
  totalCount = reviews.length,
  sort,
  onSortChange,
  onEdit,
  onDelete,
  lastItemRef,
}: MyWrittenReviewListProps) {
  return (
    <div>
      <div className='flex items-center justify-between px-4 pt-5'>
        <p className='label-semibold flex items-center gap-1'>
          <span className='text-text-tertiary'>작성한 리뷰</span>
          <span className='text-text-primary'>{totalCount.toLocaleString('ko-KR')}개</span>
        </p>
        <MyReviewSortButton value={sort} onChange={onSortChange} />
      </div>

      <div className='mt-5'>
        {reviews.map((review, index) => (
          <div key={review.id} ref={index === reviews.length - 1 ? lastItemRef : undefined}>
            {index > 0 ? (
              <div className='px-4'>
                <Divider />
              </div>
            ) : null}
            <div className={cn('px-4 pb-6', index > 0 && 'pt-6')}>
              <MyReviewCard review={review} onEdit={onEdit} onDelete={onDelete} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { MyWrittenReviewList };
