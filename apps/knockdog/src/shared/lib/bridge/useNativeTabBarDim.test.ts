// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { METHODS } from '@knockdog/bridge-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useNativeTabBarDim } from './useNativeTabBarDim';

const mocks = vi.hoisted(() => ({
  isNativeWebView: vi.fn(),
  request: vi.fn<(method: string, payload: { dimmed: boolean; requestId: number }) => Promise<void>>(),
}));

vi.mock('@shared/lib/device', () => ({ isNativeWebView: mocks.isNativeWebView }));
vi.mock('./BridgeProvider', () => {
  const bridge = { request: mocks.request };
  return { useBridge: () => bridge };
});

describe('useNativeTabBarDim', () => {
  beforeEach(() => {
    mocks.isNativeWebView.mockReturnValue(true);
    mocks.request.mockReset().mockResolvedValue(undefined);
  });

  it('dims on open, restores the dim on resume, and clears it on close', () => {
    const view = renderHook(useNativeTabBarDim, { initialProps: false });
    expect(mocks.request).not.toHaveBeenCalled();

    view.rerender(true);
    act(() => {
      window.dispatchEvent(new Event('appresume'));
    });
    view.rerender(false);
    window.dispatchEvent(new Event('appresume'));
    view.unmount();

    const calls = mocks.request.mock.calls;
    expect(calls.map(([method, payload]) => [method, payload.dimmed])).toEqual([
      [METHODS.navSetBottomTabBarDimmed, true],
      [METHODS.navSetBottomTabBarDimmed, true],
      [METHODS.navSetBottomTabBarDimmed, false],
    ]);
    const requestIds = calls.map(([, payload]) => payload.requestId);
    expect(requestIds).toEqual([...new Set(requestIds)].sort((first, second) => first - second));
  });

  it('clears the dim when the open screen unmounts', () => {
    const view = renderHook(useNativeTabBarDim, { initialProps: true });
    view.unmount();

    expect(mocks.request).toHaveBeenLastCalledWith(
      METHODS.navSetBottomTabBarDimmed,
      expect.objectContaining({ dimmed: false })
    );
  });

  it('does not call the native bridge in a browser', () => {
    mocks.isNativeWebView.mockReturnValue(false);
    const view = renderHook(useNativeTabBarDim, { initialProps: true });
    view.unmount();

    expect(mocks.request).not.toHaveBeenCalled();
  });
});
