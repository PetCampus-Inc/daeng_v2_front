import { useSyncExternalStore } from 'react';

/**
 * 테스트용 `next/navigation`. `vi.mock('next/navigation', () => import('.../fakeNextNavigation'))`로 쓴다.
 * 실제 Next처럼 `window.history.replaceState`로 주소가 바뀌면 `useSearchParams`를 쓰는 화면이 다시 그려진다.
 */
const listeners = new Set<() => void>();
let isInstalled = false;
let cachedSearch = '';
let cachedSearchParams = new URLSearchParams();

const notifyListeners = () => listeners.forEach((listener) => listener());

/** History API를 한 번만 감싸서 주소가 바뀔 때마다 구독자에게 알린다. */
const installHistoryListener = () => {
  if (isInstalled) return;
  isInstalled = true;

  (['pushState', 'replaceState'] as const).forEach((method) => {
    const original = window.history[method].bind(window.history);
    window.history[method] = (...args: Parameters<History['pushState']>) => {
      original(...args);
      notifyListeners();
    };
  });
  window.addEventListener('popstate', notifyListeners);
};

const subscribe = (listener: () => void) => {
  installHistoryListener();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => {
  if (window.location.search !== cachedSearch) {
    cachedSearch = window.location.search;
    cachedSearchParams = new URLSearchParams(cachedSearch);
  }

  return cachedSearchParams;
};

const useSearchParams = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

const usePathname = () => '/owner/daily';

const router = {
  push: () => undefined,
  replace: () => undefined,
  back: () => undefined,
  forward: () => undefined,
  refresh: () => undefined,
  prefetch: () => undefined,
};
const useRouter = () => router;

/** 테스트에서 주소를 바꾼다. 홈·알림이 `navSwitchTab`으로 query를 넣는 것과 같다(`history.replaceState`). */
const setFakeUrl = (url: string) => {
  installHistoryListener();
  window.history.replaceState(null, '', url);
};

export { setFakeUrl, usePathname, useRouter, useSearchParams };
