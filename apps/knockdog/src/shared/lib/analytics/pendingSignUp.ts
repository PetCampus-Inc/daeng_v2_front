import { STORAGE_KEYS } from '@shared/constants';
import { TypedStorage } from '@shared/lib/storage';

import { createAnalyticsId, type EntrySource, type SignUpMethod, type SignupSource } from './gaEvents';

interface PendingSignUpAnalytics {
  method: SignUpMethod;
  entry_source: EntrySource;
  entry_point: string;
  signup_source: SignupSource;
  flow_id: string;
  auth_attempt_id: string;
}

const pendingSignUpStorage = new TypedStorage<PendingSignUpAnalytics>(STORAGE_KEYS.PENDING_SIGN_UP_ANALYTICS);

function toSignUpMethod(provider: string): SignUpMethod {
  const normalized = provider.toLowerCase();
  if (normalized === 'kakao' || normalized === 'google' || normalized === 'apple') return normalized;
  return 'kakao';
}

function toSignupSource(entrySource: EntrySource): SignupSource {
  if (entrySource === 'invite_link' || entrySource === 'invite_qr') return 'invite';
  if (entrySource === 'organic') return 'other';
  return 'unknown';
}

function savePendingSignUpAnalytics(method: SignUpMethod, entry_source: EntrySource, entryPoint = 'login') {
  pendingSignUpStorage.set({
    method,
    entry_source,
    entry_point: entryPoint,
    signup_source: toSignupSource(entry_source),
    flow_id: createAnalyticsId(),
    auth_attempt_id: createAnalyticsId(),
  });
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
  savePendingSignUpAnalytics,
  toSignUpMethod,
  toSignupSource,
};
