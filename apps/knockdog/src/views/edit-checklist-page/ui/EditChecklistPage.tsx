'use client';

import { ChecklistEditor, mockAnswers } from '@features/checklist';
import { Header } from '@widgets/Header';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AnswerGroup } from '@entities/checklist';

function EditChecklistPage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [answers, setAnswers] = useState<AnswerGroup[]>(mockAnswers);

  const handleSave = (updatedAnswers: AnswerGroup[]) => {
    // Mock API 호출 시뮬레이션
    console.log('저장할 답변 데이터:', updatedAnswers);

    // @TODO 실제 API 호출 로직 (현재는 mock)

    setAnswers(updatedAnswers);
    setIsEditing(false);
  };

  const handleBack = () => {
    if (isEditing) {
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
        <Header.Title>체크리스트 편집</Header.Title>
        <Header.RightSection>
          {isEditing && (
            <button onClick={() => setIsEditing(false)} className='label-semibold'>
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
      <div className='mt-[65px] h-[calc(100vh-66px)] overflow-y-auto'>
        <ChecklistEditor isEditing={isEditing} initialAnswers={answers} onSave={handleSave} />
      </div>
    </div>
  );
}

export { EditChecklistPage };
