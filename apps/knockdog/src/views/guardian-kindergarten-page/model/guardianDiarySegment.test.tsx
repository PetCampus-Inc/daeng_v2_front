// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { saveDiaryHomeReturn, takeDiaryHomeDate } from '@shared/lib/diary-write/diaryRecord';

import { GuardianDiarySegmentProvider, useGuardianDiarySegment } from './guardianDiarySegment';

const wrapper = ({ children }: { children: ReactNode }) => (
  <GuardianDiarySegmentProvider>{children}</GuardianDiarySegmentProvider>
);

describe('returning to the diary tab', () => {
  afterEach(() => {
    window.sessionStorage.clear();
    window.history.replaceState(null, '', '/');
  });

  it('opens the diary on initial navigation and passes the selected date to the calendar', () => {
    window.history.replaceState(null, '', '/kindergarten?diaryReturnDate=2026-11-19&other=1');
    const { result } = renderHook(useGuardianDiarySegment, { wrapper });

    expect(result.current.segment).toBe('diary');
    expect(takeDiaryHomeDate()).toBe('2026-11-19');
    expect(window.location.search).toBe('?other=1');
  });

  it('opens the diary when the native bridge injects the return URL into a mounted tab', () => {
    window.history.replaceState(null, '', '/kindergarten');
    const { result } = renderHook(useGuardianDiarySegment, { wrapper });
    expect(result.current.segment).toBe('kindergarten');

    act(() => {
      window.history.replaceState(null, '', '/kindergarten?diaryReturnDate=2026-11-19');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(result.current.segment).toBe('diary');
    expect(takeDiaryHomeDate()).toBe('2026-11-19');
    expect(window.location.search).toBe('');
  });

  it('restores the diary date when a native pop refocuses the original tab without a return URL', () => {
    const { result } = renderHook(useGuardianDiarySegment, { wrapper });
    saveDiaryHomeReturn('2026-11-19', { notify: false });
    expect(result.current.segment).toBe('kindergarten');

    act(() => {
      window.dispatchEvent(new Event('knockdog:native-tab-focus'));
    });

    expect(result.current.segment).toBe('diary');
    expect(takeDiaryHomeDate()).toBe('2026-11-19');
  });

  it('keeps the diary tab selected after the return date is consumed and the home view remounts', () => {
    window.history.replaceState(null, '', '/kindergarten?diaryReturnDate=2026-11-19');
    const firstView = renderHook(useGuardianDiarySegment, { wrapper });
    expect(firstView.result.current.segment).toBe('diary');
    expect(takeDiaryHomeDate()).toBe('2026-11-19');
    firstView.unmount();

    const nextView = renderHook(useGuardianDiarySegment, { wrapper });
    expect(nextView.result.current.segment).toBe('diary');

    act(() => nextView.result.current.selectSegment('kindergarten'));
    nextView.unmount();
    expect(renderHook(useGuardianDiarySegment, { wrapper }).result.current.segment).toBe('kindergarten');
  });
});
