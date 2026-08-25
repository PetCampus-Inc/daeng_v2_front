import { eventBus } from '@shared/utils';

const LOCK_KEY = 'PUSH_DEVICE_REG_LOCK';
/** 탭 WebView가 동시에 PUT하지 않도록 공유 락 유효 시간 */
const LOCK_TTL_MS = 15_000;

interface PushDeviceRegistrationLock {
  userId: string;
  token: string;
  at: number;
}

/**
 * 동일 origin 탭 WebView들이 localStorage를 공유한다고 가정하고,
 * 같은 user+FCM 토큰에 대한 push-devices PUT을 한 번만 보낸다.
 */
function tryAcquirePushDeviceRegistrationLock(userId: string, token: string): boolean {
  if (typeof localStorage === 'undefined') return true;

  try {
    const raw = localStorage.getItem(LOCK_KEY);
    if (raw) {
      const prev = JSON.parse(raw) as PushDeviceRegistrationLock;
      if (
        prev.userId === userId &&
        prev.token === token &&
        Date.now() - prev.at < LOCK_TTL_MS
      ) {
        return false;
      }
    }

    const next: PushDeviceRegistrationLock = { userId, token, at: Date.now() };
    localStorage.setItem(LOCK_KEY, JSON.stringify(next));
    return true;
  } catch {
    return true;
  }
}

function releasePushDeviceRegistrationLock(userId: string, token: string) {
  if (typeof localStorage === 'undefined') return;

  try {
    const raw = localStorage.getItem(LOCK_KEY);
    if (!raw) return;
    const prev = JSON.parse(raw) as PushDeviceRegistrationLock;
    if (prev.userId === userId && prev.token === token) {
      localStorage.removeItem(LOCK_KEY);
    }
  } catch {
    // ignore
  }
}

function markPushDeviceRegistrationComplete(userId: string, token: string) {
  if (typeof localStorage === 'undefined') return;

  try {
    const next: PushDeviceRegistrationLock = { userId, token, at: Date.now() };
    localStorage.setItem(LOCK_KEY, JSON.stringify(next));
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
  clearPushDeviceRegistrationLock,
  markPushDeviceRegistrationComplete,
  releasePushDeviceRegistrationLock,
  tryAcquirePushDeviceRegistrationLock,
};
