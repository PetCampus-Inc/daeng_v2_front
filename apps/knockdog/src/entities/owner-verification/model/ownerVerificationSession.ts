import type { KindergartenVerificationData } from './ownerVerification';

const SESSION_KEY = 'role_conversion_owner_verification';
/** localStorage는 WebView를 닫아도 남으므로, 스테일 인증 draft·개인정보 잔존 방지를 위해 TTL 적용 */
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

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

function toPublicSession(record: Record<string, unknown>): VerificationSession | null {
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
}

function parseStoredSession(
  raw: string | null
): { session: VerificationSession; savedAt: number; isLegacy: boolean } | null {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const record = parsed as Record<string, unknown>;
    const session = toPublicSession(record);
    if (!session) return null;

    const isLegacy = typeof record.savedAt !== 'number';
    const savedAt = isLegacy ? Date.now() : (record.savedAt as number);

    if (Date.now() - savedAt > SESSION_TTL_MS) return null;

    return { session, savedAt, isLegacy };
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

  try {
    const fromLocal = localStorage.getItem(SESSION_KEY);
    if (fromLocal) return fromLocal;

    const fromSession = sessionStorage.getItem(SESSION_KEY);
    if (fromSession) {
      try {
        localStorage.setItem(SESSION_KEY, fromSession);
        sessionStorage.removeItem(SESSION_KEY);
      } catch {
        // quota/private mode — session 값은 그대로 반환
      }
      return fromSession;
    }
  } catch {
    return null;
  }

  return null;
}

function writeSession(session: VerificationSession) {
  if (typeof window === 'undefined') return;

  const stored = {
    ...session,
    savedAt: Date.now(),
  };

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(stored));
  } catch {
    // quota/private mode — 호출부(saveSession 등)로 예외 전파하지 않음
  }

  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
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

  const raw = readRawSession();
  const stored = parseStoredSession(raw);

  if (!stored) {
    if (raw) clearSession();
    return null;
  }

  // legacy(savedAt 없던 값)면 TTL 기준점을 남기기 위해 재저장
  if (stored.isLegacy) {
    writeSession(stored.session);
  }

  return stored.session;
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

  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }

  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export {
  clearSession,
  loadSession,
  saveBusinessRegistrationNumber,
  saveSession,
  type VerificationKindergartenSnapshot,
  type VerificationSession,
};
