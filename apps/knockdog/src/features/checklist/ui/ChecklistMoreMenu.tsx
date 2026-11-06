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
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Icon,
} from '@knockdog/ui';
import { RemoveScroll } from 'react-remove-scroll';

import { checklistQueryKeys, type AnswersResponse } from '@entities/checklist';
import { useNativeBackToClose } from '@shared/lib/bridge';
import { toast } from '@shared/ui/toast';

import { useDeleteChecklistMutation } from '../api/useChecklistMutate';

const EMPTY_CHECKLIST: AnswersResponse = { sections: [] };

interface DeleteChecklistContext {
  previous?: AnswersResponse;
}

interface ChecklistMoreMenuProps {
  targetId: string;
  onEdit: () => void;
}

function ChecklistMoreMenu({ targetId, onEdit }: ChecklistMoreMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const queryKey = checklistQueryKeys.answers(targetId);
  const { mutate: resetChecklist, isPending } = useDeleteChecklistMutation({
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<AnswersResponse>(queryKey);
      queryClient.setQueryData(queryKey, EMPTY_CHECKLIST);
      return { previous } satisfies DeleteChecklistContext;
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
      toast({
        nativeTitle: '체크리스트를 초기화하지 못했어요',
        titleParts: [
          { text: '체크리스트를 ', accent: false },
          { text: '초기화', accent: true },
          { text: '하지 못했어요', accent: false },
        ],
        title: (
          <>
            <span className='text-text-primary-inverse'>체크리스트를 </span>
            <span className='text-text-accent'>초기화</span>
            <span className='text-text-primary-inverse'>하지 못했어요</span>
          </>
        ),
      });
    },
    onSuccess: () => {
      toast({
        type: 'success',
        nativeTitle: '체크리스트를 초기화했어요',
        titleParts: [
          { text: '체크리스트를 ', accent: false },
          { text: '초기화', accent: true },
          { text: '했어요', accent: false },
        ],
        title: (
          <>
            <span className='text-text-primary-inverse'>체크리스트를 </span>
            <span className='text-text-accent'>초기화</span>
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

  const handleResetClick = (event: MouseEvent) => {
    event.stopPropagation();
    setIsOpen(false);

    overlay.open(({ isOpen: isDialogOpen, close }) => (
      <AlertDialog open={isDialogOpen} onOpenChange={(open) => !open && close()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>작성한 내용을 초기화할까요?</AlertDialogTitle>
            <AlertDialogDescription>작성한 체크와 메모가 모두 삭제됩니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>닫기</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                close();
                resetChecklist({ targetId });
              }}
            >
              초기화하기
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
        {...getReferenceProps({
          onClick: (event: MouseEvent) => {
            event.stopPropagation();
          },
        })}
        type='button'
        aria-label='더보기'
        aria-expanded={isOpen}
        disabled={isPending}
        className='inline-flex size-6 shrink-0 items-center justify-center disabled:opacity-50'
      >
        <Icon
          icon='More'
          className='text-fill-secondary-400 size-6 rotate-90'
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
                수정하기
                <Icon icon='Edit' className='text-text-secondary size-4' />
              </button>
              <button
                type='button'
                role='menuitem'
                className='body2-semibold text-text-primary flex w-full items-center justify-between'
                onClick={handleResetClick}
              >
                초기화하기
                <Icon icon='Reset' className='text-text-secondary size-4' />
              </button>
            </div>
          </FloatingFocusManager>
        </RemoveScroll>
      ) : null}
    </>
  );
}

export { ChecklistMoreMenu };
