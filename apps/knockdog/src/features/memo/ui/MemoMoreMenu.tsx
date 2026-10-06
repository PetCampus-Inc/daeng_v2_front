'use client';

import { useState, type MouseEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Icon,
} from '@knockdog/ui';
import { RemoveScroll } from 'react-remove-scroll';

import { memoQueryKeys, type MemoResponse } from '@entities/memo';
import { useNativeBackToClose } from '@shared/lib/bridge';
import { toast } from '@shared/ui/toast';

import { useMemoMutation } from '../api/useMemoMutation';

interface MemoMoreMenuProps {
  targetId: string;
  onEdit: () => void;
}

const EMPTY_MEMO: MemoResponse = { content: '', photos: [] };

function MemoMoreMenu({ targetId, onEdit }: MemoMoreMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const queryKey = memoQueryKeys.byTargetId(targetId);
  const { mutate: updateMemo, isPending } = useMemoMutation({
    onSuccess: () => {
      queryClient.setQueryData(queryKey, EMPTY_MEMO);
      toast({
        type: 'success',
        nativeTitle: '자유메모를 삭제했어요',
        titleParts: [
          { text: '자유메모를 ', accent: false },
          { text: '삭제', accent: true },
          { text: '했어요', accent: false },
        ],
        title: (
          <>
            <span className='text-text-primary-inverse'>자유메모를 </span>
            <span className='text-text-accent'>삭제</span>
            <span className='text-text-primary-inverse'>했어요</span>
          </>
        ),
      });
    },
  });

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

  const handleEditClick = (event: MouseEvent) => {
    event.stopPropagation();
    setIsOpen(false);
    onEdit();
  };

  const handleDeleteClick = (event: MouseEvent) => {
    event.stopPropagation();
    setIsOpen(false);

    overlay.open(({ isOpen: isDialogOpen, close }) => (
      <AlertDialog open={isDialogOpen} onOpenChange={(open) => !open && close()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>자유메모를 삭제할까요?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>닫기</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const previous = queryClient.getQueryData<MemoResponse>(queryKey);
                close();
                queryClient.setQueryData(queryKey, EMPTY_MEMO);
                updateMemo(
                  { targetId, content: '', photoKeys: [] },
                  {
                    onError: () => {
                      if (previous) queryClient.setQueryData(queryKey, previous);
                    },
                  }
                );
              }}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  };

  return (
    <>
      <button
        ref={refs.setReference}
        {...getReferenceProps()}
        type='button'
        aria-label='더보기'
        aria-expanded={isOpen}
        disabled={isPending}
        className='inline-flex size-6 shrink-0 items-center justify-center disabled:opacity-50'
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

export { MemoMoreMenu };
