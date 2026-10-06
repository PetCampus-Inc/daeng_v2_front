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

import { useChecklistMutate } from '../api/useChecklistMutate';

function clearedAnswerValue(value: string) {
  return /^\d+$/.test(value.trim()) ? '' : 'UNKNOWN';
}

interface ChecklistMoreMenuProps {
  targetId: string;
  onEdit: () => void;
}

function ChecklistMoreMenu({ targetId, onEdit }: ChecklistMoreMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const queryKey = checklistQueryKeys.answers(targetId);
  const { mutate: updateAnswers, isPending } = useChecklistMutate({
    onSuccess: () => {
      queryClient.setQueryData(queryKey, { sections: [] });
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
            <AlertDialogDescription>현재 선택한 항목의 체크가 모두 해제됩니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>닫기</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const previous = queryClient.getQueryData<AnswersResponse>(queryKey);
                const answers = (previous?.sections ?? []).flatMap((section) =>
                  section.answers
                    .filter(
                      (answer) => String(answer.value ?? '').trim() !== '' || (answer.memo?.trim() ?? '') !== ''
                    )
                    .map((answer) => ({
                      questionId: answer.questionId,
                      value: clearedAnswerValue(String(answer.value ?? '')),
                      memo: '',
                    }))
                );

                close();
                queryClient.setQueryData(queryKey, { sections: [] });
                updateAnswers(
                  { targetId, answers },
                  {
                    onError: () => {
                      queryClient.setQueryData(queryKey, previous);
                    },
                  }
                );
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
