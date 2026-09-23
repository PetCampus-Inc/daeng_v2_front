'use client';

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
import { useState, type MouseEvent } from 'react';
import { RemoveScroll } from 'react-remove-scroll';

import { ownerKindergartenNewsContent } from '@views/owner-kindergarten-news-page/config/ownerKindergartenNewsContent';
import {
  openOwnerKindergartenNewsDeleteDialog,
  showOwnerKindergartenNewsDeleteSuccessToast,
} from '@views/owner-kindergarten-news-page/ui/OwnerKindergartenNewsDeleteDialog';
import { useNativeBackToClose, useStackNavigation } from '@shared/lib/bridge';
import { route } from '@shared/constants/route';

interface OwnerKindergartenNewsMoreMenuProps {
  newsId: string;
  onDelete: (newsId: string) => void | Promise<void>;
}

function OwnerKindergartenNewsMoreMenu({ newsId, onDelete }: OwnerKindergartenNewsMoreMenuProps) {
  const { list } = ownerKindergartenNewsContent;
  const { push } = useStackNavigation();
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
    useDismiss(context, {
      outsidePress: true,
      outsidePressEvent: 'pointerdown',
    }),
    useRole(context, { role: 'menu' }),
  ]);

  useNativeBackToClose(isOpen, () => setIsOpen(false));

  const handleEditClick = () => {
    setIsOpen(false);
    void push({
      pathname: route.owner.news.edit.root.replace('[id]', newsId),
    });
  };

  const handleDeleteClick = () => {
    setIsOpen(false);
    openOwnerKindergartenNewsDeleteDialog(async () => {
      await onDelete(newsId);
      showOwnerKindergartenNewsDeleteSuccessToast();
    });
  };

  return (
    <>
      <button
        ref={refs.setReference}
        {...getReferenceProps({
          onClick: (event: MouseEvent) => {
            event.stopPropagation();
          },
        })}
        type='button'
        aria-label={list.moreAriaLabel}
        aria-expanded={isOpen}
        className='inline-flex size-6 shrink-0 items-center justify-center'
      >
        <Icon
          icon='More'
          className={`size-6 rotate-90 ${isOpen ? 'text-fill-secondary-400' : 'text-fill-secondary-700'}`}
        />
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
                {list.editLabel}
                <Icon icon='Edit' className='text-text-secondary size-4' />
              </button>
              <button
                type='button'
                role='menuitem'
                className='body2-semibold text-error flex w-full items-center justify-between'
                onClick={handleDeleteClick}
              >
                {list.deleteLabel}
                <Icon icon='Trash' className='text-error size-4' />
              </button>
            </div>
          </FloatingFocusManager>
        </RemoveScroll>
      ) : null}
    </>
  );
}

export { OwnerKindergartenNewsMoreMenu };
