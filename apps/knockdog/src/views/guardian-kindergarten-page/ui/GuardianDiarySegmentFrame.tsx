'use client';

import type { ReactNode } from 'react';

import { DIARY_SEGMENT } from '@knockdog/ui';

import { useGuardianDiarySegment } from '@views/guardian-kindergarten-page/model/guardianDiarySegment';

import { GuardianDiaryMain } from './GuardianDiaryMain';
import { GuardianKindergartenHomeSegment } from './GuardianKindergartenHomeSegment';

interface GuardianDiarySegmentFrameProps {
  children: ReactNode;
}

function GuardianDiarySegmentFrame({ children }: GuardianDiarySegmentFrameProps) {
  const { segment, dogName, petId } = useGuardianDiarySegment();

  if (segment !== DIARY_SEGMENT.diary) return children;

  return (
    <div className='flex min-h-0 w-full flex-1 flex-col overflow-y-auto pb-(--bottom-bar-height)'>
      <div className='px-x4 shrink-0 pt-6'>
        <GuardianKindergartenHomeSegment />
      </div>
      <GuardianDiaryMain dogName={dogName} petId={petId} />
    </div>
  );
}

export { GuardianDiarySegmentFrame };
