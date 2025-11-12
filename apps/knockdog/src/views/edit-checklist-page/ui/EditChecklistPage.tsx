'use client';

import { ChecklistEditor } from '@features/checklist';
import { Header } from '@widgets/Header';
import { useRouter } from 'next/navigation';
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

function EditChecklistPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [isEditing, setIsEditing] = useState(false);
  const { data: answers } = useChecklistAnswersQuery(id);
  const { mutate: updateAnswers } = useChecklistMutate();
  const [draftAnswers, setDraftAnswers] = useState<AnswerGroup[]>([]);

  const { back } = useStackNavigation();

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
    if (isEditing) {
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

    router.back();
  };

  return (
    <div>
      <Header withSpacing={false}>
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
      <div className='h-[calc(100vh-66px)] overflow-y-auto'>
        <ChecklistEditor isEditing={isEditing} answers={draftAnswers} onAnswersChange={setDraftAnswers} />
      </div>
    </div>
  );
}

export { EditChecklistPage };
