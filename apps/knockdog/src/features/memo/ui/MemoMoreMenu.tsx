'use client';

import { useState, type MouseEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
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
  Icon,
} from '@knockdog/ui';
import { RemoveScroll } from 'react-remove-scroll';

import { memoQueryKeys, type MemoResponse } from '@entities/memo';
import { openConfirmDialog, useNativeBackToClose } from '@shared/lib/bridge';
import { ConfirmDialog } from '@shared/ui/confirm-dialog';
import { toast } from '@shared/ui/toast';

import { useDeleteMemoMutation } from '../api/useMemoMutation';

interface MemoMoreMenuProps {
  targetId: string;
  onEdit: () => void;
}

const EMPTY_MEMO: MemoResponse = { content: '', photos: [] };

interface DeleteMemoContext {
  previous?: MemoResponse;
}

function MemoMoreMenu({ targetId, onEdit }: MemoMoreMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [, setActiveTab] = useQueryState('tab', {
    defaultValue: '기본정보',
    shallow: true,
  });
  const queryClient = useQueryClient();
  const queryKey = memoQueryKeys.byTargetId(targetId);
  const { mutateAsync: deleteMemoAsync, isPending } = useDeleteMemoMutation({
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<MemoResponse>(queryKey);
      queryClient.setQueryData(queryKey, EMPTY_MEMO);
      return { previous } satisfies DeleteMemoContext;
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
      toast({
        nativeTitle: '자유메모를 삭제하지 못했어요',
        titleParts: [
          { text: '자유메모를 ', accent: false },
          { text: '삭제', bold: true },
          { text: '하지 못했어요', accent: false },
        ],
        title: (
          <>
            <span className='text-text-primary-inverse'>자유메모를 </span>
            <span className='body1-bold text-text-primary-inverse'>삭제</span>
            <span className='text-text-primary-inverse'>하지 못했어요</span>
          </>
        ),
      });
    },
    onSuccess: () => {
      void setActiveTab('메모');
      toast({
        type: 'success',
        nativeTitle: '자유메모를 삭제했어요',
        titleParts: [
          { text: '자유메모를 ', accent: false },
          { text: '삭제', bold: true },
          { text: '했어요', accent: false },
        ],
        title: (
          <>
            <span className='text-text-primary-inverse'>자유메모를 </span>
            <span className='body1-bold text-text-primary-inverse'>삭제</span>
            <span className='text-text-primary-inverse'>했어요</span>
          </>
        ),
      });
    },
  });

  /** 실패 안내와 되돌리기는 mutation의 onError가 하므로, 반환된 오류는 무시한다 */
  const deleteMemo = (variables: Parameters<typeof deleteMemoAsync>[0]) => deleteMemoAsync(variables).catch(() => undefined);

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

    const confirmCopy = {
      title: '자유메모를 삭제할까요?',
      cancelLabel: '닫기',
      confirmLabel: '삭제',
    };
    openConfirmDialog(confirmCopy).then((result) => {
      if (result.status === 'resolved') {
        if (result.action === 'confirm') deleteMemo({ targetId });
        return;
      }
      if (result.status === 'pending') return;

      overlay.open(({ isOpen: isDialogOpen, close }) => (
        <ConfirmDialog
          {...confirmCopy}
          isOpen={isDialogOpen}
          onClose={close}
          onConfirm={() => {
            close();
            deleteMemo({ targetId });
          }}
        />
      ));
    });
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
