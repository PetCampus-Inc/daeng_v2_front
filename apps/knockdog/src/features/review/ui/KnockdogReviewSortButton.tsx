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
import { Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import { RemoveScroll } from 'react-remove-scroll';

import { KNOCKDOG_REVIEW_SORT_OPTIONS, type KnockdogReviewSort } from '../config/knockdogReviewMock';

import { useNativeBackToClose } from '@shared/lib/bridge';

interface KnockdogReviewSortButtonProps {
  value: KnockdogReviewSort;
  onChange: (value: KnockdogReviewSort) => void;
}

function KnockdogReviewSortButton({ value, onChange }: KnockdogReviewSortButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = KNOCKDOG_REVIEW_SORT_OPTIONS.find((option) => option.value === value);
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
        className='label-semibold text-fill-secondary-500 flex items-center gap-1 py-1'
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
              className='border-line-200 bg-bg-0 radius-r2 z-999 flex flex-col gap-4 border p-3 shadow-sm'
            >
              {KNOCKDOG_REVIEW_SORT_OPTIONS.map((option) => (
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

export { KnockdogReviewSortButton };
