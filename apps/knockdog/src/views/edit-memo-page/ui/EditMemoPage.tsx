'use client';

import { useState, useEffect, useRef } from 'react';
import { MemoEditor, useMemoQuery, useMemoMutation } from '@features/memo';
import { Header } from '@widgets/Header';
import { useParams } from 'next/navigation';
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
import { createAnalyticsId, trackSchoolMemoChangeResult, trackSchoolMemoView } from '@shared/lib/analytics';

const MAX_LENGTH = 2000;

export function EditMemoPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { back } = useStackNavigation();

  if (!id) {
    throw new Error('Company ID is required for edit memo page');
  }

  const [isEditing, setIsEditing] = useState(false);
  const { data: memoData } = useMemoQuery(id);
  const hasTrackedMemoViewRef = useRef(false);
  const memoOperationIdRef = useRef<string | null>(null);
  const { mutate: updateMemo, isPending } = useMemoMutation({
    onSuccess: (_data, variables) => {
      setIsEditing(false);
      trackSchoolMemoChangeResult({
        listing_id: id,
        operation_id: memoOperationIdRef.current ?? createAnalyticsId(),
        action: 'text_save',
        has_text: variables.content?.trim() ? 1 : 0,
        photo_count: variables.photoKeys?.length ?? 0,
        result: 'success',
      });
    },
    onError: () => {
      trackSchoolMemoChangeResult({
        listing_id: id,
        operation_id: memoOperationIdRef.current ?? createAnalyticsId(),
        action: 'text_save',
        result: 'failed',
      });
    },
  });

  useEffect(() => {
    if (!memoData || hasTrackedMemoViewRef.current) return;
    hasTrackedMemoViewRef.current = true;
    trackSchoolMemoView({
      listing_id: id,
      has_text: memoData.content?.trim() ? 1 : 0,
      photo_count: memoData.photos?.length ?? 0,
      entry_point: 'school_detail',
    });
  }, [id, memoData]);
  const [memo, setMemo] = useState(memoData?.content ?? '');

  // memoData 업데이트 시 memo state 동기화
  useEffect(() => {
    if (memoData?.content !== undefined) {
      setMemo(memoData.content);
    }
  }, [memoData?.content]);

  const handleSave = () => {
    const photoKeys = memoData?.photos?.map((photo) => photo.key) ?? [];
    memoOperationIdRef.current = createAnalyticsId();
    updateMemo({ targetId: id, content: memo, photoKeys });
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

    back();
  };

  return (
    <div>
      <Header>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>자유메모 작성</Header.Title>
        <Header.RightSection>
          {isEditing && (
            <button className='label-semibold' onClick={handleSave} disabled={isPending}>
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
