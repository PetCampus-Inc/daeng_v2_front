const PUSH_DEVICE_STORAGE_KEY = 'push_device_registration';

interface PushDeviceRegistration {
  userId: string;
  pushDeviceId: string;
}

function loadPushDeviceRegistration(): PushDeviceRegistration | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PUSH_DEVICE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PushDeviceRegistration>;
    if (typeof parsed.userId !== 'string' || !parsed.userId.trim()) {
      // 이전 형식({ pushDeviceId })은 어느 계정의 등록인지 알 수 없어 재사용하지 않는다.
      localStorage.removeItem(PUSH_DEVICE_STORAGE_KEY);
      return null;
    }
    if (typeof parsed.pushDeviceId !== 'string' || !parsed.pushDeviceId.trim()) {
      localStorage.removeItem(PUSH_DEVICE_STORAGE_KEY);
      return null;
    }
    return parsed as PushDeviceRegistration;
  } catch {
    return null;
  }
}

function savePushDeviceRegistration(registration: PushDeviceRegistration) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PUSH_DEVICE_STORAGE_KEY, JSON.stringify(registration));
}

function clearPushDeviceRegistration() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PUSH_DEVICE_STORAGE_KEY);
}

export { loadPushDeviceRegistration, savePushDeviceRegistration, clearPushDeviceRegistration };
export type { PushDeviceRegistration };
