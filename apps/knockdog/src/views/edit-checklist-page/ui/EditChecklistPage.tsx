'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { overlay } from 'overlay-kit';
import {
  ActionButton,
} from '@knockdog/ui';

import {
  ChecklistEditor,
  useChecklistAnswersQuery,
  useChecklistMutate,
  useDeleteChecklistMutation,
} from '@features/checklist';
import { toSavedChecklistAnswers, type AnswerGroup } from '@entities/checklist';

import { Header } from '@widgets/Header';

import { openConfirmDialog, useNativeBackHandler, useStackNavigation } from '@shared/lib/bridge';
import { ConfirmDialog } from '@shared/ui/confirm-dialog';
import { toast } from '@shared/ui/toast';
import { BottomCta } from '@shared/ui/bottom-cta';

function hasAnswerValue(sections: AnswerGroup[]) {
  return sections.some((section) =>
    section.answers.some((answer) => String(answer.value).trim() !== '' || (answer.memo?.trim() ?? '') !== '')
  );
}

function meaningfulAnswers(section: AnswerGroup) {
  return section.answers.filter((answer) => answer.value.trim() !== '' || (answer.memo?.trim() ?? '') !== '');
}

function isSameAnswers(current: AnswerGroup[], initial: AnswerGroup[]) {
  const currentSections = current.filter((section) => meaningfulAnswers(section).length > 0);
  const initialSections = initial.filter((section) => meaningfulAnswers(section).length > 0);
  if (currentSections.length !== initialSections.length) return false;

  return currentSections.every((section, sectionIndex) => {
    const originalSection = initialSections[sectionIndex];
    if (!originalSection || section.sectionId !== originalSection.sectionId) return false;

    const currentItems = meaningfulAnswers(section);
    const originalItems = meaningfulAnswers(originalSection);
    if (currentItems.length !== originalItems.length) return false;

    return currentItems.every((answer, answerIndex) => {
      const originalAnswer = originalItems[answerIndex];
      return (
        answer.questionId === originalAnswer?.questionId &&
        answer.value === originalAnswer?.value &&
        (answer.memo?.trim() ?? '') === (originalAnswer?.memo?.trim() ?? '')
      );
    });
  });
}

function showSaveSuccessToast() {
  toast({
    type: 'success',
    nativeTitle: '체크리스트를 저장했어요',
    titleParts: [{ text: '체크리스트', bold: true }, { text: '를 저장했어요' }],
    title: (
      <>
        <span className='body1-bold text-text-primary-inverse'>체크리스트</span>
        <span className='text-text-primary-inverse'>를 저장했어요</span>
      </>
    ),
  });
}

function EditChecklistPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { data: answers } = useChecklistAnswersQuery(id ?? '');
  const { mutateAsync: updateAnswers, isPending: isSaving } = useChecklistMutate();
  const { mutateAsync: deleteChecklist, isPending: isDeleting } = useDeleteChecklistMutation();
  const isPending = isSaving || isDeleting;
  const [draftAnswers, setDraftAnswers] = useState<AnswerGroup[] | null>(null);
  const [editorKey, setEditorKey] = useState(0);

  const { back } = useStackNavigation();

  const savedAnswers = answers?.sections ?? [];
  const currentAnswers = draftAnswers ?? savedAnswers;
  const isDirty = draftAnswers !== null && !isSameAnswers(draftAnswers, savedAnswers);

  const handleSave = async () => {
    if (!id || !isDirty || isPending) return;

    try {
      const nextAnswers = toSavedChecklistAnswers(
        currentAnswers.flatMap((section) =>
          section.answers.map((answer) => ({
            questionId: answer.questionId,
            value: answer.value,
            memo: answer.memo,
          }))
        )
      );

      if (nextAnswers.length === 0) {
        await deleteChecklist({ targetId: id });
      } else {
        await updateAnswers({ targetId: id, answers: nextAnswers });
      }
      showSaveSuccessToast();
      back();
    } catch {
      const confirmCopy = {
        title: '체크리스트를 저장하지 못했어요',
        description: '잠시 후 다시 시도해 주세요.',
        cancelLabel: '닫기',
        confirmLabel: '다시 시도',
      };
      openConfirmDialog(confirmCopy).then((result) => {
        if (result.status === 'resolved') {
          if (result.action === 'confirm') handleSave();
          return;
        }
        if (result.status === 'pending') return;

        overlay.open(({ isOpen, close }) => (
          <ConfirmDialog
            {...confirmCopy}
            isOpen={isOpen}
            onClose={close}
            onConfirm={() => {
              close();
              handleSave();
            }}
          />
        ));
      });
    }
  };

  const handleReset = () => {
    const confirmCopy = {
      title: '작성한 내용을 초기화할까요?',
      description: '작성한 체크와 메모가 모두 삭제됩니다.',
      cancelLabel: '닫기',
      confirmLabel: '초기화하기',
    };
    openConfirmDialog(confirmCopy).then((result) => {
      if (result.status === 'pending') return;

      if (result.status === 'resolved') {
        if (result.action === 'confirm') {
          setDraftAnswers([]);
          setEditorKey((key) => key + 1);
        }
        return;
      }

      overlay.open(({ isOpen, close }) => (
        <ConfirmDialog
          {...confirmCopy}
          isOpen={isOpen}
          onClose={close}
          onConfirm={() => {
            close();
            setDraftAnswers([]);
            setEditorKey((key) => key + 1);
          }}
        />
      ));
    });
  };

  const handleBack = () => {
    if (!isDirty) {
      back();
      return;
    }

    const confirmCopy = {
      title: '저장하지 않고 나갈까요?',
      description: '변경한 내용이 저장되지 않아요.',
      cancelLabel: '닫기',
      confirmLabel: '나가기',
    };
    openConfirmDialog(confirmCopy).then((result) => {
      if (result.status === 'pending') return;

      if (result.status === 'resolved') {
        if (result.action === 'confirm') {
          back();
        }
        return;
      }

      overlay.open(({ isOpen, close }) => (
        <ConfirmDialog
          {...confirmCopy}
          isOpen={isOpen}
          onClose={close}
          onConfirm={() => {
            close();
            back();
          }}
        />
      ));
    });
  };

  useNativeBackHandler(handleBack);

  return (
    <div className='flex h-full flex-col'>
      <Header className='shrink-0 border-b-0'>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>체크리스트 작성</Header.Title>
      </Header>
      <ChecklistEditor key={editorKey} isEditing answers={currentAnswers} onAnswersChange={setDraftAnswers} />
      <BottomCta className='flex shrink-0 flex-nowrap gap-2 bg-white px-5 py-5 pb-[max(1.25rem,var(--safe-area-inset-bottom,0px))]'>
        <ActionButton
          type='button'
          variant='secondaryLine'
          size='large'
          className='w-auto shrink-0'
          disabled={!hasAnswerValue(currentAnswers)}
          onClick={handleReset}
        >
          초기화
        </ActionButton>
        <ActionButton
          type='button'
          variant='primaryFill'
          size='large'
          className='w-auto min-w-0 flex-1'
          disabled={!isDirty || isPending}
          onClick={() => handleSave()}
        >
          저장하기
        </ActionButton>
      </BottomCta>
    </div>
  );
}

export { EditChecklistPage };
