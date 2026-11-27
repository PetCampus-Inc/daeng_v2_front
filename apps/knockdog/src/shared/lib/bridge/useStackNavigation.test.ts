// @vitest-environment jsdom

import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { useStackNavigation } from './useStackNavigation';

const mocks = vi.hoisted(() => ({
  isNativeWebView: vi.fn(),
  on: vi.fn(),
  push: vi.fn(),
  request: vi.fn(),
}));

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('@shared/lib/device', () => ({ isNativeWebView: mocks.isNativeWebView }));
vi.mock('@knockdog/bridge-core', () => ({
  METHODS: { navPush: 'nav.push' },
  makeId: () => 'test-route-id',
}));
vi.mock('./BridgeProvider', () => ({
  useBridge: () => ({ on: mocks.on, request: mocks.request }),
}));

beforeEach(() => {
  mocks.isNativeWebView.mockReturnValue(true);
  mocks.on.mockReset().mockImplementation(() => vi.fn());
  mocks.request.mockReset().mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it('앱에서 결과를 선택하지 않고 뒤로 가면 결과 없이 완료한다', async () => {
  const { result } = renderHook(useStackNavigation);
  const pending = result.current.pushForResult<boolean>({ pathname: '/select' });
  const [, cancel] = mocks.on.mock.calls[1]!;

  cancel({ txId: 'other-route-id', reason: 'Navigation cancelled: User navigated back without providing result' });
  expect(mocks.on.mock.results[1]!.value).not.toHaveBeenCalled();
  cancel({ txId: 'test-route-id', reason: 'Navigation cancelled: User navigated back without providing result' });

  await expect(pending).resolves.toBeUndefined();
  expect(mocks.on.mock.results.every(({ value }) => value.mock.calls.length === 1)).toBe(true);
});

it('선택을 완료하면 전달받은 결과를 반환한다', async () => {
  const { result } = renderHook(useStackNavigation);
  const pending = result.current.pushForResult<boolean>({ pathname: '/select' });
  const [, receiveResult] = mocks.on.mock.calls[0]!;

  receiveResult({ txId: 'test-route-id', result: false });

  await expect(pending).resolves.toBe(false);
});

it('다른 사유의 브릿지 취소는 실패로 전달한다', async () => {
  const { result } = renderHook(useStackNavigation);
  const pending = result.current.pushForResult({ pathname: '/select' });
  const [, cancel] = mocks.on.mock.calls[1]!;

  cancel({ txId: 'test-route-id', reason: 'Bridge failed' });

  await expect(pending).rejects.toThrow('Bridge failed');
});

it('브라우저에서 결과 없이 뒤로 가면 결과 없이 완료한다', async () => {
  mocks.isNativeWebView.mockReturnValue(false);
  const { result } = renderHook(useStackNavigation);
  const pending = result.current.pushForResult({ pathname: '/select' });

  window.dispatchEvent(new PopStateEvent('popstate'));

  await expect(pending).resolves.toBeUndefined();
});

it('브릿지 이동 요청이 실패하면 대기 타이머와 리스너를 정리한다', async () => {
  vi.useFakeTimers();
  mocks.request.mockRejectedValue(new Error('Bridge request failed'));
  const { result } = renderHook(useStackNavigation);

  await expect(result.current.pushForResult({ pathname: '/select' })).rejects.toThrow('Bridge request failed');
  expect(vi.getTimerCount()).toBe(0);
  expect(mocks.on.mock.results.every(({ value }) => value.mock.calls.length === 1)).toBe(true);
});

it('결과가 도착하지 않으면 시간 초과 오류를 반환한다', async () => {
  vi.useFakeTimers();
  const { result } = renderHook(useStackNavigation);
  const pending = result.current.pushForResult({ pathname: '/select' }, 100);
  const assertion = expect(pending).rejects.toThrow('[pushForResult] timeout 100ms');

  await vi.advanceTimersByTimeAsync(100);
  await assertion;
});
