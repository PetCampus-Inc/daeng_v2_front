// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';

import { DIARY_SEGMENT } from '@knockdog/ui';

import { GuardianDiarySegmentFrame } from './GuardianDiarySegmentFrame';

const push = vi.fn().mockResolvedValue(undefined);

vi.mock('@shared/lib/bridge', () => ({ useStackNavigation: () => ({ push }) }));
vi.mock('@shared/lib/device', () => ({ isNativeWebView: () => true }));
vi.mock('@shared/lib/diary-write/useDiaryRecords', () => ({ useDiaryRecords: () => [] }));
vi.mock('@views/guardian-kindergarten-page/model/guardianDiarySegment', () => ({
  useGuardianDiarySegment: () => ({ segment: DIARY_SEGMENT.diary, dogName: '초코' }),
}));
vi.mock('./GuardianKindergartenHomeSegment', () => ({ GuardianKindergartenHomeSegment: () => null }));
vi.mock('./GuardianDiaryMain', () => ({
  GuardianDiaryMain: ({ onView }: { onView: (date: Date, diaryId: string) => void }) => (
    <button onClick={() => onView(new Date(2026, 10, 19), 'diary-1')}>일기 열기</button>
  ),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

test('복귀 날짜를 저장할 수 없어도 일기 상세 화면을 연다', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('Storage unavailable', 'SecurityError');
  });
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);

  render(<GuardianDiarySegmentFrame>{null}</GuardianDiarySegmentFrame>);
  fireEvent.click(screen.getByRole('button', { name: '일기 열기' }));

  expect(push).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
    query: expect.objectContaining({ diaryId: 'diary-1', fromDiaryTab: true }),
  }));
});
