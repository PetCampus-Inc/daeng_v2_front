'use client';

import { useState } from 'react';
import { Header } from '@widgets/Header';
import { MemoEditor } from '@widgets/memo-editor';

const MAX_MEMO_LENGTH = 2000;
const mockMemo = '';

export default function Page() {
  const [memo, setMemo] = useState(mockMemo);
  const [isEditing, setIsEditing] = useState(false);

  const handleMemoChange = (newMemo: string) => {
    setMemo(newMemo);
  };

  return (
    <>
      <Header className='border-b-line-100 border-b-1'>
        <Header.BackButton />

        <Header.Title>자유메모 작성</Header.Title>

        <Header.RightSection>
          <button className='label-semibold flex items-center gap-1' onClick={() => setIsEditing(!isEditing)}>
            <span>{isEditing ? '완료' : '편집'}</span>
          </button>
        </Header.RightSection>
      </Header>

      <div className='relative mt-[65px] h-[calc(100vh-186px)]'>
        <MemoEditor
          initialMemo={mockMemo}
          maxLength={MAX_MEMO_LENGTH}
          onMemoChange={handleMemoChange}
          isEditing={isEditing}
        />
      </div>
    </>
  );
}
