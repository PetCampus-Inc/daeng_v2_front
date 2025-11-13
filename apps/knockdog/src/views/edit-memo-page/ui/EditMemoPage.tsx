'use client';

import { useState, useEffect } from 'react';
import { MemoEditor, useMemoQuery, useMemoMutation } from '@features/memo';
import { Header } from '@widgets/Header';
import { useParams, useRouter } from 'next/navigation';
import { overlay } from 'overlay-kit';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@knockdog/ui';
import { useStackNavigation } from '@shared/lib/bridge';

const MAX_LENGTH = 2000;

export function EditMemoPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { back } = useStackNavigation();

  if (!id) {
    throw new Error('Company ID is required for edit memo page');
  }

  const [isEditing, setIsEditing] = useState(false);
  const { data: memoData } = useMemoQuery(id);
  const { mutate: updateMemo } = useMemoMutation({
    onSuccess: () => {
      setIsEditing(false);
    },
  });
  const [memo, setMemo] = useState(memoData?.content ?? '');

  // memoData 업데이트 시 memo state 동기화
  useEffect(() => {
    if (memoData?.content !== undefined) {
      setMemo(memoData.content);
    }
  }, [memoData?.content]);

  const handleSave = () => {
    updateMemo({ targetId: id, content: memo });
  };

  const originalContent = memoData?.content ?? '';

  const handleBack = () => {
    const hasUnsavedChanges = isEditing && memo !== originalContent;
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
    router.back();
  };

  return (
    <div>
      <Header withSpacing={false}>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>자유메모 작성</Header.Title>
        <Header.RightSection>
          {isEditing && memo && (
            <button className='label-semibold' onClick={handleSave}>
              완료
            </button>
          )}
          {!isEditing && (
            <button className='label-semibold' onClick={() => setIsEditing(!isEditing)}>
              편집
            </button>
          )}
        </Header.RightSection>
      </Header>

      <MemoEditor readOnly={!isEditing} value={memo} maxLength={MAX_LENGTH} onChange={(e) => setMemo(e.target.value)} />
    </div>
  );
}
