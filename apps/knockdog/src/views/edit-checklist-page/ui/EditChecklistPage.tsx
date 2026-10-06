'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { overlay } from 'overlay-kit';
import {
  ActionButton,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@knockdog/ui';

import { ChecklistEditor, useChecklistAnswersQuery, useChecklistMutate } from '@features/checklist';
import type { AnswerGroup } from '@entities/checklist';

import { Header } from '@widgets/Header';

import { useNativeBackHandler, useStackNavigation } from '@shared/lib/bridge';
import { toast } from '@shared/ui/toast';

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
    titleParts: [{ text: '체크리스트', accent: true }, { text: '를 저장했어요' }],
    title: (
      <>
        <span className='text-text-accent'>체크리스트</span>
        <span className='text-text-primary-inverse'>를 저장했어요</span>
      </>
    ),
  });
}

function EditChecklistPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { data: answers } = useChecklistAnswersQuery(id ?? '');
  const { mutateAsync: updateAnswers, isPending } = useChecklistMutate();
  const [draftAnswers, setDraftAnswers] = useState<AnswerGroup[] | null>(null);
  const [editorKey, setEditorKey] = useState(0);

  const { back } = useStackNavigation();

  const savedAnswers = answers?.sections ?? [];
  const currentAnswers = draftAnswers ?? savedAnswers;
  const isDirty = draftAnswers !== null && !isSameAnswers(draftAnswers, savedAnswers);

  const handleSave = async () => {
    if (!id || !isDirty || isPending) return;

    try {
      await updateAnswers({
        targetId: id,
        answers: currentAnswers.flatMap((section) =>
          section.answers
            .filter((answer) => answer.value.trim() !== '' || (answer.memo?.trim() ?? '') !== '')
            .map((answer) => ({
              questionId: answer.questionId,
              value: answer.value,
              memo: answer.memo?.trim() ?? '',
            }))
        ),
      });
      showSaveSuccessToast();
      back();
    } catch {
      overlay.open(({ isOpen, close }) => (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && close()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>체크리스트를 저장하지 못했어요</AlertDialogTitle>
              <AlertDialogDescription>잠시 후 다시 시도해 주세요.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>닫기</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  close();
                  handleSave();
                }}
              >
                다시 시도
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ));
    }
  };

  const handleReset = () => {
    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={(open) => !open && close()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>작성한 내용을 초기화할까요?</AlertDialogTitle>
            <AlertDialogDescription>현재 선택한 항목의 체크가 모두 해제됩니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>닫기</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDraftAnswers([]);
                setEditorKey((key) => key + 1);
                close();
              }}
            >
              초기화하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  };

  const handleBack = () => {
    if (!isDirty) {
      back();
      return;
    }

    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={(open) => !open && close()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>저장하지 않고 나갈까요?</AlertDialogTitle>
            <AlertDialogDescription>변경한 내용이 저장되지 않아요.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>닫기</AlertDialogCancel>
            <AlertDialogAction onClick={() => back()}>나가기</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
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
      <div className='flex shrink-0 flex-nowrap gap-2 bg-white px-5 py-5 pb-[max(1.25rem,var(--safe-area-inset-bottom,0px))]'>
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
          onClick={handleSave}
        >
          저장하기
        </ActionButton>
      </div>
    </div>
  );
}

export { EditChecklistPage };
