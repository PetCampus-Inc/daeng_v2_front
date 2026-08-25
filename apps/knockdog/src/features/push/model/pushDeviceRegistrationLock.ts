import { eventBus } from '@shared/utils';

const LOCK_KEY = 'PUSH_DEVICE_REG_LOCK';
/** 탭 WebView가 동시에 PUT하지 않도록 공유 락 유효 시간 */
const LOCK_TTL_MS = 15_000;
/** PUT+body 읽기 상한 — TTL보다 짧아야 만료 전 다른 WebView가 중복 PUT을 시작하지 않음 */
const PUSH_DEVICE_PUT_TIMEOUT_MS = 12_000;
const RENEW_INTERVAL_MS = 4_000;

interface PushDeviceRegistrationLock {
  userId: string;
  token: string;
  at: number;
  leaseId: string;
}

function createLeaseId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readLock(): PushDeviceRegistrationLock | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCK_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PushDeviceRegistrationLock;
    if (!parsed?.userId || !parsed?.token || !parsed?.leaseId || typeof parsed.at !== 'number') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeLock(lock: PushDeviceRegistrationLock) {
  localStorage.setItem(LOCK_KEY, JSON.stringify(lock));
}

function isLockActive(lock: PushDeviceRegistrationLock, userId: string, token: string) {
  return lock.userId === userId && lock.token === token && Date.now() - lock.at < LOCK_TTL_MS;
}

/**
 * 동일 origin 탭 WebView들이 localStorage를 공유한다고 가정하고,
 * 같은 user+FCM 토큰에 대한 push-devices PUT을 한 번만 보낸다.
 * @returns 획득한 leaseId. 실패 시 null.
 */
function tryAcquirePushDeviceRegistrationLock(userId: string, token: string): string | null {
  if (typeof localStorage === 'undefined') return createLeaseId();

  try {
    const prev = readLock();
    if (prev && isLockActive(prev, userId, token)) {
      return null;
    }

    const leaseId = createLeaseId();
    const next: PushDeviceRegistrationLock = { userId, token, at: Date.now(), leaseId };
    writeLock(next);

    // 다른 WebView가 덮어썼으면 패배 (완전 원자적은 아니지만 연속 write 경합은 줄임)
    const stored = readLock();
    if (!stored || stored.leaseId !== leaseId) return null;
    return leaseId;
  } catch {
    return createLeaseId();
  }
}

function renewPushDeviceRegistrationLock(userId: string, token: string, leaseId: string): boolean {
  if (typeof localStorage === 'undefined') return true;

  try {
    const prev = readLock();
    if (!prev || prev.leaseId !== leaseId || prev.userId !== userId || prev.token !== token) {
      return false;
    }
    writeLock({ ...prev, at: Date.now() });
    return true;
  } catch {
    return false;
  }
}

function releasePushDeviceRegistrationLock(userId: string, token: string, leaseId: string) {
  if (typeof localStorage === 'undefined') return;

  try {
    const prev = readLock();
    if (!prev) return;
    if (prev.leaseId !== leaseId || prev.userId !== userId || prev.token !== token) return;
    localStorage.removeItem(LOCK_KEY);
  } catch {
    // ignore
  }
}

function markPushDeviceRegistrationComplete(userId: string, token: string, leaseId: string) {
  if (typeof localStorage === 'undefined') return;

  try {
    const prev = readLock();
    if (!prev || prev.leaseId !== leaseId || prev.userId !== userId || prev.token !== token) {
      return;
    }
    writeLock({ ...prev, at: Date.now() });
  } catch {
    // ignore
  }
}

function clearPushDeviceRegistrationLock() {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(LOCK_KEY);
  } catch {
    // ignore
  }
}

// 로그아웃 후 재로그인 시 서버 기기 등록을 다시 보낼 수 있게 락 해제
eventBus.subscribe('auth:logout', () => {
  clearPushDeviceRegistrationLock();
});

export {
  LOCK_TTL_MS,
  PUSH_DEVICE_PUT_TIMEOUT_MS,
  RENEW_INTERVAL_MS,
  clearPushDeviceRegistrationLock,
  markPushDeviceRegistrationComplete,
  releasePushDeviceRegistrationLock,
  renewPushDeviceRegistrationLock,
  tryAcquirePushDeviceRegistrationLock,
};
