const PUSH_DEVICE_STORAGE_KEY = 'push_device_registration';

interface PushDeviceRegistration {
  userId: string;
  pushDeviceId: string;
}

function storageKey(userId: string) {
  return `${PUSH_DEVICE_STORAGE_KEY}:${encodeURIComponent(userId)}`;
}

function parseRegistration(raw: string | null): PushDeviceRegistration | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<PushDeviceRegistration>;
    if (typeof parsed.userId !== 'string' || !parsed.userId.trim()) return null;
    if (typeof parsed.pushDeviceId !== 'string' || !parsed.pushDeviceId.trim()) return null;
    return parsed as PushDeviceRegistration;
  } catch {
    return null;
  }
}

/** 현재 로그인 사용자 전용 기기 등록값만 읽는다. 이전 단일 키는 같은 사용자일 때만 안전하게 마이그레이션한다. */
function loadPushDeviceRegistration(userId: string | null | undefined): PushDeviceRegistration | null {
  if (typeof window === 'undefined') return null;
  if (!userId?.trim()) return null;

  const key = storageKey(userId);
  const registration = parseRegistration(localStorage.getItem(key));
  if (registration?.userId === userId) return registration;
  if (registration) localStorage.removeItem(key);

  const legacyRegistration = parseRegistration(localStorage.getItem(PUSH_DEVICE_STORAGE_KEY));
  // 이전 단일 키는 현재 사용자와 일치할 때만 옮긴다. 다른 계정의 등록값은 절대 재사용하지 않는다.
  if (legacyRegistration?.userId !== userId) return null;

  localStorage.setItem(key, JSON.stringify(legacyRegistration));
  localStorage.removeItem(PUSH_DEVICE_STORAGE_KEY);
  return legacyRegistration;
}

function savePushDeviceRegistration(registration: PushDeviceRegistration) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(storageKey(registration.userId), JSON.stringify(registration));
}

function clearPushDeviceRegistration(userId: string | null | undefined) {
  if (typeof window === 'undefined') return;
  if (!userId?.trim()) return;

  localStorage.removeItem(storageKey(userId));

  const legacyRegistration = parseRegistration(localStorage.getItem(PUSH_DEVICE_STORAGE_KEY));
  if (legacyRegistration?.userId === userId) localStorage.removeItem(PUSH_DEVICE_STORAGE_KEY);
}

export { loadPushDeviceRegistration, savePushDeviceRegistration, clearPushDeviceRegistration };
export type { PushDeviceRegistration };
