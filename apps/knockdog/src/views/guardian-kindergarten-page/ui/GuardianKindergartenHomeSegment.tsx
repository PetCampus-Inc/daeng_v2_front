'use client';

import { DIARY_SEGMENT, DiarySegmentedControl } from '@knockdog/ui';
import { useRequestDiaryOnboarding } from '@features/diary-onboarding';

function GuardianKindergartenHomeSegment() {
  const requestDiaryOnboarding = useRequestDiaryOnboarding();

  return (
    <DiarySegmentedControl
      value={DIARY_SEGMENT.kindergarten}
      onValueChange={(value) => {
        if (value === DIARY_SEGMENT.diary) requestDiaryOnboarding();
      }}
    />
  );
}

export { GuardianKindergartenHomeSegment };
