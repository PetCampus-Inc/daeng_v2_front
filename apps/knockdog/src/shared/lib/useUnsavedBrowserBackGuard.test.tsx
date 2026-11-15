// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useUnsavedBrowserBackGuard } from './useUnsavedBrowserBackGuard';

const DIRTY_SETTLE_DELAY_MS = 300;

const isGuardArmed = () =>
  Boolean(window.history.state && typeof window.history.state === 'object' && '__unsavedExitGuard' in window.history.state);

beforeEach(() => {
  vi.useFakeTimers();
  window.history.replaceState(null, '', '/');
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('useUnsavedBrowserBackGuard - 입력이 잠잠해진 뒤에 가드를 건다', () => {
  test('수정됨이 되어도 300ms가 지나기 전에는 history에 가드를 넣지 않는다', () => {
    const { rerender } = renderHook(({ isDirty }) => useUnsavedBrowserBackGuard(isDirty, vi.fn()), {
      initialProps: { isDirty: false },
    });

    rerender({ isDirty: true });
    act(() => {
      vi.advanceTimersByTime(DIRTY_SETTLE_DELAY_MS - 1);
    });

    expect(isGuardArmed()).toBe(false);
  });

  test('수정됨이 300ms 유지되면 가드를 건다', () => {
    const { rerender } = renderHook(({ isDirty }) => useUnsavedBrowserBackGuard(isDirty, vi.fn()), {
      initialProps: { isDirty: false },
    });

    rerender({ isDirty: true });
    act(() => {
      vi.advanceTimersByTime(DIRTY_SETTLE_DELAY_MS);
    });

    expect(isGuardArmed()).toBe(true);
  });

  test('수정됨이 300ms 안에 사라졌다 돌아오면 history를 넣지도 빼지도 않는다 (iOS 한글 첫 글자 조합)', () => {
    const pushState = vi.spyOn(window.history, 'pushState');
    const back = vi.spyOn(window.history, 'back');
    const { rerender } = renderHook(({ isDirty }) => useUnsavedBrowserBackGuard(isDirty, vi.fn()), {
      initialProps: { isDirty: false },
    });

    rerender({ isDirty: true });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ isDirty: false });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ isDirty: true });
    act(() => {
      vi.advanceTimersByTime(DIRTY_SETTLE_DELAY_MS - 1);
    });

    expect(pushState).not.toHaveBeenCalled();
    expect(back).not.toHaveBeenCalled();
  });

  test('가드가 걸린 뒤 수정됨이 300ms 안에 사라졌다 돌아오면 가드를 풀지 않는다', () => {
    const back = vi.spyOn(window.history, 'back');
    const { rerender } = renderHook(({ isDirty }) => useUnsavedBrowserBackGuard(isDirty, vi.fn()), {
      initialProps: { isDirty: true },
    });
    act(() => {
      vi.advanceTimersByTime(DIRTY_SETTLE_DELAY_MS);
    });
    expect(isGuardArmed()).toBe(true);

    rerender({ isDirty: false });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ isDirty: true });
    act(() => {
      vi.advanceTimersByTime(DIRTY_SETTLE_DELAY_MS);
    });

    expect(back).not.toHaveBeenCalled();
    expect(isGuardArmed()).toBe(true);
  });
});
