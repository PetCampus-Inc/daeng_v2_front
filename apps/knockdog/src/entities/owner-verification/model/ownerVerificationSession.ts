import type { KindergartenVerificationData } from './ownerVerification';

const SESSION_KEY = 'role_conversion_owner_verification';

interface VerificationKindergartenSnapshot {
  source: 'manual' | 'search';
  placeId?: string;
  name: string;
  address: string;
  ownerName: string;
  phoneNumber: string;
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
    typeof record.ownerName === 'string' &&
    typeof record.phoneNumber === 'string'
  );
}

function parseSession(raw: string | null): VerificationSession | null {
  if (!raw) return null;

  try {
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

/**
 * Stack WebView 간 공유를 위해 localStorage 사용.
 * 기존 sessionStorage 값이 있으면 마이그레이션.
 */
function readRawSession(): string | null {
  if (typeof window === 'undefined') return null;

  const fromLocal = localStorage.getItem(SESSION_KEY);
  if (fromLocal) return fromLocal;

  const fromSession = sessionStorage.getItem(SESSION_KEY);
  if (fromSession) {
    localStorage.setItem(SESSION_KEY, fromSession);
    sessionStorage.removeItem(SESSION_KEY);
    return fromSession;
  }

  return null;
}

function writeSession(session: VerificationSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  // legacy 잔존값 제거
  sessionStorage.removeItem(SESSION_KEY);
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

  writeSession(session);
}

function loadSession(): VerificationSession | null {
  if (typeof window === 'undefined') return null;

  return parseSession(readRawSession());
}

function saveBusinessRegistrationNumber(registrationNumber: string): boolean {
  if (typeof window === 'undefined') return false;

  const session = loadSession();
  if (!session) return false;

  const updated: VerificationSession = {
    ...session,
    businessRegistrationNumber: registrationNumber,
  };

  writeSession(updated);
  return true;
}

function clearSession() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(SESSION_KEY);
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
