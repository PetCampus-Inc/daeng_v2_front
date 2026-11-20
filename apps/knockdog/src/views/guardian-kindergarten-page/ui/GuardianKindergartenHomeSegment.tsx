'use client';

import { DIARY_SEGMENT, DiarySegmentedControl } from '@knockdog/ui';
import { useRequestDiaryOnboarding } from '@features/diary-onboarding';

import { useGuardianDiarySegment } from '@views/guardian-kindergarten-page/model/guardianDiarySegment';

interface GuardianKindergartenHomeSegmentProps {
  opensOnboarding?: boolean;
}

function GuardianKindergartenHomeSegment({ opensOnboarding = true }: GuardianKindergartenHomeSegmentProps) {
  const requestDiaryOnboarding = useRequestDiaryOnboarding();
  const { segment, selectSegment } = useGuardianDiarySegment();

  function handleValueChange(next: typeof segment) {
    if (opensOnboarding && next === DIARY_SEGMENT.diary) requestDiaryOnboarding();
    selectSegment(next);
  }

  return <DiarySegmentedControl value={segment} onValueChange={handleValueChange} />;
}

export { GuardianKindergartenHomeSegment };
