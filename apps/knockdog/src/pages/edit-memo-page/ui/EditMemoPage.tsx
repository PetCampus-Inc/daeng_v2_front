'use client';

import { useState } from 'react';
import { MemoEditor, useMemoQuery, useMemoMutation } from '@features/memo';
import { Header } from '@widgets/Header';
import { useParams, useRouter } from 'next/navigation';

const MAX_LENGTH = 2000;

export function EditMemoPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

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

  const handleSave = () => {
    updateMemo({ targetId: id, content: memo });
  };

  const handleBack = () => {
    if (memo && isEditing) {
      // @TODO AlertDialog 모달 띄우기
    }
    router.back();
  };

  return (
    <div>
      <Header>
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

      <MemoEditor
        readOnly={!isEditing}
        defaultValue={memo}
        maxLength={MAX_LENGTH}
        onChange={(e) => setMemo(e.target.value)}
      />
    </div>
  );
}
