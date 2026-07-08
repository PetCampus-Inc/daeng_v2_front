import { STORAGE_KEYS } from '@shared/constants/storage';

interface OwnerKindergarten {
  source: 'manual' | 'search';
  placeId?: string;
  name: string;
  address: string;
  ownerName?: string;
}

const ownerKindergartenListeners = new Set<() => void>();

let cachedOwnerKindergartenSnapshot: OwnerKindergarten | null = null;
let cachedOwnerKindergartenRaw: string | null | undefined;

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
      cachedOwnerKindergartenRaw = undefined;
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

  const raw = JSON.stringify(info);
  localStorage.setItem(STORAGE_KEYS.OWNER_KINDERGARTEN, raw);
  cachedOwnerKindergartenRaw = raw;
  cachedOwnerKindergartenSnapshot = info;
  notifyOwnerKindergartenChange();
}

function updateOwnerKindergartenName(name: string) {
  const kindergarten = loadOwnerKindergarten();
  if (!kindergarten) return;

  saveOwnerKindergarten({ ...kindergarten, ownerName: name });
}

function loadOwnerKindergarten(): OwnerKindergarten | null {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem(STORAGE_KEYS.OWNER_KINDERGARTEN);

  if (raw === cachedOwnerKindergartenRaw) {
    return cachedOwnerKindergartenSnapshot;
  }

  cachedOwnerKindergartenRaw = raw;

  if (!raw) {
    cachedOwnerKindergartenSnapshot = null;
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    cachedOwnerKindergartenSnapshot = isOwnerKindergarten(parsed) ? parsed : null;
  } catch {
    cachedOwnerKindergartenSnapshot = null;
  }

  return cachedOwnerKindergartenSnapshot;
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
  updateOwnerKindergartenName,
};
