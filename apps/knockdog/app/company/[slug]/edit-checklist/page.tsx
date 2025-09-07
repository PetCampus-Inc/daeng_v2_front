'use client';

import { useState } from 'react';
import { Header } from '@widgets/Header';
import { ChecklistEditor } from '@widgets/checklist-editor';

export default function Page() {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <>
      <Header className='border-b-line-100 border-b-1'>
        <Header.BackButton />

        <Header.Title>상담시 체크리스트</Header.Title>

        <Header.RightSection>
          <button className='label-semibold flex items-center gap-1' onClick={() => setIsEditing(!isEditing)}>
            <span>{isEditing ? '완료' : '편집'}</span>
          </button>
        </Header.RightSection>
      </Header>

      <div className='mt-[65px] h-[calc(100vh-66px)] overflow-y-auto'>
        <ChecklistEditor isEditing={isEditing} onSave={handleSave} />
      </div>
    </>
  );
}
