import { describe, expect, test } from 'vitest';

import { sortGuardianConnectionHistory } from './sortGuardianConnectionHistory';

const createItem = (id: string, disconnectedAt: string | null, connectedAt = '2025-01-01') => ({
  id,
  schoolPetMembershipId: id,
  kindergartenId: id,
  placeId: id,
  name: id,
  address: '서울',
  imageUrl: '',
  connectedAt,
  disconnectedAt,
  attendanceDayCount: 1,
  canWriteReview: false,
});

describe('연결 이력 정렬', () => {
  test('이전에 다닌 유치원은 재원 종료일이 늦은 순서로 정렬한다', () => {
    const sorted = sortGuardianConnectionHistory([
      createItem('가', '2025-03-01'),
      createItem('나', '2025-11-28'),
      createItem('다', '2025-06-30'),
    ]);

    expect(sorted.map((item) => item.id)).toEqual(['나', '다', '가']);
  });
});
