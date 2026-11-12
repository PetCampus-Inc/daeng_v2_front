'use client';

import { DIARY_SEGMENT, DiarySegmentedControl } from '@knockdog/ui';

/** 일기장 모드(S-03)는 이 화면 범위 밖이다. 유치원 탭을 유지한다. */
function GuardianKindergartenHomeSegment() {
  return <DiarySegmentedControl value={DIARY_SEGMENT.kindergarten} />;
}

export { GuardianKindergartenHomeSegment };
