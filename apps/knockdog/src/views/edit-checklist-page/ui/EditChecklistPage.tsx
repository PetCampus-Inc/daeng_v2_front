'use client';

import { ChecklistEditor } from '@features/checklist';
import { Header } from '@widgets/Header';
import { useEffect, useState } from 'react';
import { overlay } from 'overlay-kit';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@knockdog/ui';
import { useStackNavigation } from '@shared/lib/bridge';
import { useParams } from 'next/navigation';
import { useChecklistMutate, useChecklistAnswersQuery } from '@features/checklist';
import type { AnswerGroup } from '@entities/checklist';
import { SafeArea } from '@shared/ui/safe-area';

function EditChecklistPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [isEditing, setIsEditing] = useState(false);
  const { data: answers } = useChecklistAnswersQuery(id);
  const { mutate: updateAnswers } = useChecklistMutate();
  const [draftAnswers, setDraftAnswers] = useState<AnswerGroup[]>([]);

  const { back } = useStackNavigation();

  const originalSections = answers?.sections ?? [];
  const hasUnsavedChanges =
    isEditing &&
    (draftAnswers.length !== originalSections.length ||
      draftAnswers.some((section, index) => {
        const originalSection = originalSections[index];
        if (!originalSection) return true;
        if (section.answers.length !== originalSection.answers.length) return true;
        return section.answers.some((answer, answerIndex) => {
          const originalAnswer = originalSection.answers[answerIndex];
          if (!originalAnswer) return true;
          if (answer.value !== originalAnswer.value) return true;
          return false;
        });
      }));

  useEffect(() => {
    if (!isEditing) {
      setDraftAnswers(answers?.sections ?? []);
    }
  }, [answers?.sections, isEditing]);

  const handleSave = () => {
    if (!id) return;

    updateAnswers({
      targetId: id,
      answers: draftAnswers.flatMap((section) =>
        section.answers.map((answer) => ({ questionId: answer.questionId, value: answer.value }))
      ),
    });
    setIsEditing(false);
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      overlay.open(({ isOpen, close }) => (
        <AlertDialog open={isOpen} onOpenChange={close}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>앗, 아직 저장하지 않았어요!</AlertDialogTitle>
              <AlertDialogDescription>
                지금 나가면 현재까지 쓴 내용이 사라져요.
                <br />
                저장 없이 나갈까요?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={() => back()}>확인</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ));
      return;
    }

    back();
  };

  return (
    <SafeArea edges={['bottom']}>
      <Header>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>체크리스트 편집</Header.Title>
        <Header.RightSection>
          {isEditing && (
            <button onClick={handleSave} className='label-semibold'>
              완료
            </button>
          )}
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className='label-semibold'>
              편집
            </button>
          )}
        </Header.RightSection>
      </Header>
      <div className='scrollbar-hide h-[calc(100vh-150px)] overflow-y-auto'>
        <ChecklistEditor isEditing={isEditing} answers={draftAnswers} onAnswersChange={setDraftAnswers} />
      </div>
    </SafeArea>
  );
}

export { EditChecklistPage };
