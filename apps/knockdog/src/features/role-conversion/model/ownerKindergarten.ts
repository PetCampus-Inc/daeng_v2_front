import { STORAGE_KEYS } from '@shared/constants/storage';

interface OwnerKindergarten {
  source: 'manual' | 'search';
  placeId?: string;
  name: string;
  address: string;
  ownerName?: string;
}

const ownerKindergartenListeners = new Set<() => void>();

function isOwnerKindergarten(value: unknown): value is OwnerKindergarten {
  if (!value || typeof value !== 'object') return false;

  const record = value as Record<string, unknown>;

  return (
    (record.source === 'manual' || record.source === 'search') &&
    (record.placeId === undefined || typeof record.placeId === 'string') &&
    typeof record.name === 'string' &&
    typeof record.address === 'string' &&
    (record.ownerName === undefined || typeof record.ownerName === 'string')
  );
}

function notifyOwnerKindergartenChange() {
  ownerKindergartenListeners.forEach((listener) => listener());
}

function subscribeOwnerKindergarten(listener: () => void) {
  ownerKindergartenListeners.add(listener);

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEYS.OWNER_KINDERGARTEN) {
      listener();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }

  return () => {
    ownerKindergartenListeners.delete(listener);

    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
}

function saveOwnerKindergarten(info: OwnerKindergarten) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(STORAGE_KEYS.OWNER_KINDERGARTEN, JSON.stringify(info));
  notifyOwnerKindergartenChange();
}

function loadOwnerKindergarten(): OwnerKindergarten | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OWNER_KINDERGARTEN);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    return isOwnerKindergarten(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function saveOwnerKindergartenFromVerification(info: {
  source: 'manual' | 'search';
  placeId?: string;
  name: string;
  address: string;
  ownerName: string;
}) {
  saveOwnerKindergarten({
    source: info.source,
    placeId: info.placeId,
    name: info.name,
    address: info.address,
    ownerName: info.ownerName,
  });
}

export type { OwnerKindergarten };
export {
  loadOwnerKindergarten,
  saveOwnerKindergartenFromVerification,
  subscribeOwnerKindergarten,
};
