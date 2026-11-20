import { expect, test } from 'vitest';

import { toSchoolReview } from './schoolReview';

test.each([
  [true, true],
  [false, false],
  [null, null],
  [undefined, null],
])('리뷰 연결 상태 %s를 %s로 변환한다', (status, expected) => {
  const review = toSchoolReview({ id: 1, isCurrentlyAttending: status });

  expect(review?.isCurrentlyAttending).toBe(expected);
});
