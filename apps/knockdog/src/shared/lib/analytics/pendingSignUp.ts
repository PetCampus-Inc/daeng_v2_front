import { STORAGE_KEYS } from '@shared/constants';
import { TypedStorage } from '@shared/lib/storage';

import type { EntrySource, SignUpMethod } from './gaEvents';

interface PendingSignUpAnalytics {
  method: SignUpMethod;
  entry_source: EntrySource;
}

const pendingSignUpStorage = new TypedStorage<PendingSignUpAnalytics>(STORAGE_KEYS.PENDING_SIGN_UP_ANALYTICS);

function toSignUpMethod(provider: string): SignUpMethod {
  const normalized = provider.toLowerCase();
  if (normalized === 'kakao' || normalized === 'google' || normalized === 'apple') return normalized;
  return 'kakao';
}

/** 초대 경로면 invite_link, 아니면 organic (QR 구분은 초대 URL 분기 후 활성화) */
function resolveEntrySource(pathname: string | null | undefined): EntrySource {
  if (pathname?.includes('/invite/')) return 'invite_link';
  return 'organic';
}

function savePendingSignUpAnalytics(method: SignUpMethod, entry_source: EntrySource) {
  pendingSignUpStorage.set({ method, entry_source });
}

function clearPendingSignUpAnalytics() {
  pendingSignUpStorage.clear();
}

function consumePendingSignUpAnalytics(): PendingSignUpAnalytics | null {
  const value = pendingSignUpStorage.get();
  pendingSignUpStorage.clear();
  return value;
}

function peekPendingSignUpAnalytics(): PendingSignUpAnalytics | null {
  return pendingSignUpStorage.get();
}

export {
  clearPendingSignUpAnalytics,
  consumePendingSignUpAnalytics,
  peekPendingSignUpAnalytics,
  resolveEntrySource,
  savePendingSignUpAnalytics,
  toSignUpMethod,
};
