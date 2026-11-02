import { afterEach, describe, expect, it, vi } from 'vitest';

import { isAnalyticsCollectionBlocked, setAnalyticsCollectionBlocked } from './excludedUserIds';

const EXCLUDED_DEVICE_KEY = 'analytics_collection_excluded';
const EXCLUDED_USER_ID = '4LPWCATV';

function installStorage(options?: { throwOnGet?: boolean; throwOnWrite?: boolean }) {
  const store = new Map<string, string>();
  vi.stubGlobal('window', {
    localStorage: {
      getItem(key: string) {
        if (options?.throwOnGet) throw new Error('storage blocked');
        return store.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        if (options?.throwOnWrite) throw new Error('storage blocked');
        store.set(key, value);
      },
      removeItem(key: string) {
        if (options?.throwOnWrite) throw new Error('storage blocked');
        store.delete(key);
      },
    },
  });
  return store;
}

describe('excludedUserIds', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('treats an unreadable device flag as not excluded', () => {
    installStorage({ throwOnGet: true });

    expect(isAnalyticsCollectionBlocked()).toBe(false);
  });

  it('keeps the in-memory block when the device flag cannot be saved', () => {
    installStorage({ throwOnWrite: true });

    expect(setAnalyticsCollectionBlocked(EXCLUDED_USER_ID)).toBe(true);
    expect(isAnalyticsCollectionBlocked()).toBe(true);
  });

  it('keeps a logged-out browser blocked when the device was already excluded', () => {
    const store = installStorage();
    store.set(EXCLUDED_DEVICE_KEY, '1');

    expect(setAnalyticsCollectionBlocked(null)).toBe(true);
  });
});
