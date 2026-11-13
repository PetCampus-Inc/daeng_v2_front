'use client';

import type { ReactNode } from 'react';

import { DIARY_SEGMENT } from '@knockdog/ui';

import { useGuardianDiarySegment } from '@views/guardian-kindergarten-page/model/guardianDiarySegment';
import { useStackNavigation } from '@shared/lib/bridge';
import { buildDiaryDetailTarget, buildDiaryWriteTarget } from '@shared/lib/diary-write/buildDiaryWriteTarget';
import { diaryPreviewTitle, isVisibleDiary } from '@shared/lib/diary-write/diaryRecord';
import { useDiaryRecords } from '@shared/lib/diary-write/useDiaryRecords';

import { GuardianDiaryMain } from './GuardianDiaryMain';
import { GuardianKindergartenHomeSegment } from './GuardianKindergartenHomeSegment';

interface GuardianDiarySegmentFrameProps {
  children: ReactNode;
}

function GuardianDiarySegmentFrame({ children }: GuardianDiarySegmentFrameProps) {
  const { push } = useStackNavigation();
  const { segment, dogName, petId, schoolId } = useGuardianDiarySegment();
  const records = useDiaryRecords();
  const entries = records.filter((record) => isVisibleDiary(record, petId)).map((record) => ({
    dateKey: record.dateKey,
    title: diaryPreviewTitle(record.body),
    body: record.body,
    photoCount: Math.min(Math.max(record.photos.length, 1), 3),
    imageSrc: record.photos[0],
  }));

  function handleWrite(date: Date) {
    push(buildDiaryWriteTarget({ date, schoolId, petId }));
  }

  function handleView(date: Date, diaryId?: string) {
    push(buildDiaryDetailTarget({ date, schoolId, petId, diaryId }));
  }

  if (segment !== DIARY_SEGMENT.diary) return children;

  return (
    <div className='flex min-h-0 w-full flex-1 flex-col overflow-y-auto pb-(--bottom-bar-height)'>
      <div className='px-x4 shrink-0 pt-6'>
        <GuardianKindergartenHomeSegment />
      </div>
      <GuardianDiaryMain dogName={dogName} petId={petId} entries={entries} onWrite={handleWrite} onView={handleView} />
    </div>
  );
}

export { GuardianDiarySegmentFrame };
