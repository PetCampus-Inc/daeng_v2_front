// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

import { useManagedKindergarten } from './useManagedKindergarten';

vi.mock('./useOwnerRole', () => ({
  useOwnerRole: () => ({ isOwner: true, isResolved: true, schoolId: 2, placeId: 12345 }),
}));

test.each([
  ['manual_2', 2, true],
  ['12345', null, true],
  ['manual_3', 3, false],
])('대상 유치원 %s의 운영 여부를 계정 권한으로 판정한다', (placeId, schoolId, expected) => {
  const { result, unmount } = renderHook(() => useManagedKindergarten(placeId, schoolId));
  expect(result.current.isManaged).toBe(expected);
  unmount();
});
