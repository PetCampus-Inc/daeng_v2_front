const PUSH_DEVICE_STORAGE_KEY = 'push_device_registration';

interface PushDeviceRegistration {
  pushDeviceId: string;
}

function loadPushDeviceRegistration(): PushDeviceRegistration | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PUSH_DEVICE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PushDeviceRegistration>;
    if (typeof parsed.pushDeviceId !== 'string') return null;
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
