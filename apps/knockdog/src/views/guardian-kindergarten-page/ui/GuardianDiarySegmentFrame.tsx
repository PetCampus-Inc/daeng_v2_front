'use client';

import type { ReactNode } from 'react';

import { DIARY_SEGMENT } from '@knockdog/ui';

import { useGuardianDiarySegment } from '@views/guardian-kindergarten-page/model/guardianDiarySegment';
import { useStackNavigation } from '@shared/lib/bridge';
import { buildDiaryWriteTarget } from '@shared/lib/diary-write/buildDiaryWriteTarget';

import { GuardianDiaryMain } from './GuardianDiaryMain';
import { GuardianKindergartenHomeSegment } from './GuardianKindergartenHomeSegment';

interface GuardianDiarySegmentFrameProps {
  children: ReactNode;
}

function GuardianDiarySegmentFrame({ children }: GuardianDiarySegmentFrameProps) {
  const { push } = useStackNavigation();
  const { segment, dogName, petId, schoolId } = useGuardianDiarySegment();

  function handleWrite(date: Date) {
    push(buildDiaryWriteTarget({ date, schoolId }));
  }

  if (segment !== DIARY_SEGMENT.diary) return children;

  return (
    <div className='flex min-h-0 w-full flex-1 flex-col overflow-y-auto pb-(--bottom-bar-height)'>
      <div className='px-x4 shrink-0 pt-6'>
        <GuardianKindergartenHomeSegment />
      </div>
      <GuardianDiaryMain dogName={dogName} petId={petId} onWrite={handleWrite} />
    </div>
  );
}

export { GuardianDiarySegmentFrame };
