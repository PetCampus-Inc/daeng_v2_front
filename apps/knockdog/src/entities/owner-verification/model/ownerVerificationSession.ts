import type { KindergartenVerificationData } from './ownerVerification';

const SESSION_KEY = 'role_conversion_owner_verification';

interface VerificationKindergartenSnapshot {
  source: 'manual' | 'search';
  placeId?: string;
  name: string;
  address: string;
  ownerName: string;
}

interface VerificationSession {
  ownerVerificationId: number;
  nextStep: string;
  businessRegistrationNumber?: string;
  kindergarten?: VerificationKindergartenSnapshot;
}

function isKindergartenSnapshot(value: unknown): value is VerificationKindergartenSnapshot {
  if (!value || typeof value !== 'object') return false;

  const record = value as Record<string, unknown>;

  return (
    (record.source === 'manual' || record.source === 'search') &&
    (record.placeId === undefined || typeof record.placeId === 'string') &&
    typeof record.name === 'string' &&
    typeof record.address === 'string' &&
    typeof record.ownerName === 'string'
  );
}

function saveSession(
  data: KindergartenVerificationData,
  kindergarten?: VerificationKindergartenSnapshot
) {
  if (typeof window === 'undefined') return;

  const session: VerificationSession = {
    ownerVerificationId: data.ownerVerificationId,
    nextStep: data.nextStep,
    ...(kindergarten ? { kindergarten } : {}),
  };

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function loadSession(): VerificationSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const record = parsed as Record<string, unknown>;

    if (typeof record.ownerVerificationId !== 'number' || typeof record.nextStep !== 'string') {
      return null;
    }

    return {
      ownerVerificationId: record.ownerVerificationId,
      nextStep: record.nextStep,
      ...(typeof record.businessRegistrationNumber === 'string'
        ? { businessRegistrationNumber: record.businessRegistrationNumber }
        : {}),
      ...(isKindergartenSnapshot(record.kindergarten) ? { kindergarten: record.kindergarten } : {}),
    };
  } catch {
    return null;
  }
}

function saveBusinessRegistrationNumber(registrationNumber: string): boolean {
  if (typeof window === 'undefined') return false;

  const session = loadSession();
  if (!session) return false;

  const updated: VerificationSession = {
    ...session,
    businessRegistrationNumber: registrationNumber,
  };

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  return true;
}

function clearSession() {
  if (typeof window === 'undefined') return;

  sessionStorage.removeItem(SESSION_KEY);
}

export {
  clearSession,
  loadSession,
  saveBusinessRegistrationNumber,
  saveSession,
  type VerificationKindergartenSnapshot,
  type VerificationSession,
};
