import { updateOwnerKindergartenName } from './ownerKindergarten';
import type { OwnerProfile } from './ownerProfile.types';

import { STORAGE_KEYS } from '@shared/constants/storage';

const ownerProfileListeners = new Set<() => void>();

let cachedOwnerProfileSnapshot: OwnerProfile | null = null;
let cachedOwnerProfileRaw: string | null | undefined;

function isOwnerProfile(value: unknown): value is OwnerProfile {
  if (!value || typeof value !== 'object') return false;

  const record = value as Record<string, unknown>;

  return (
    typeof record.name === 'string' &&
    typeof record.phoneNumber === 'string' &&
    typeof record.email === 'string' &&
    (record.profileImageUrl === undefined || typeof record.profileImageUrl === 'string')
  );
}

function notifyOwnerProfileChange() {
  ownerProfileListeners.forEach((listener) => listener());
}

function subscribeOwnerProfile(listener: () => void) {
  ownerProfileListeners.add(listener);

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEYS.OWNER_PROFILE) {
      cachedOwnerProfileRaw = undefined;
      listener();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }

  return () => {
    ownerProfileListeners.delete(listener);

    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
}

function getOwnerProfileSnapshot(): OwnerProfile | null {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem(STORAGE_KEYS.OWNER_PROFILE);

  if (raw === cachedOwnerProfileRaw) {
    return cachedOwnerProfileSnapshot;
  }

  cachedOwnerProfileRaw = raw;

  if (!raw) {
    cachedOwnerProfileSnapshot = null;
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    cachedOwnerProfileSnapshot = isOwnerProfile(parsed) ? parsed : null;
  } catch {
    cachedOwnerProfileSnapshot = null;
  }

  return cachedOwnerProfileSnapshot;
}

function saveOwnerProfile(profile: OwnerProfile) {
  if (typeof window === 'undefined') return;

  const raw = JSON.stringify(profile);
  localStorage.setItem(STORAGE_KEYS.OWNER_PROFILE, raw);
  cachedOwnerProfileRaw = raw;
  cachedOwnerProfileSnapshot = profile;
  updateOwnerKindergartenName(profile.name);
  notifyOwnerProfileChange();
}

export type { OwnerProfile } from './ownerProfile.types';
export { getOwnerProfileSnapshot, saveOwnerProfile, subscribeOwnerProfile };
