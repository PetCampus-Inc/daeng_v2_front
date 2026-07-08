import type { KindergartenVerificationData } from './ownerVerification';

const SESSION_KEY = 'role_conversion_owner_verification';

interface VerificationSession {
  ownerVerificationId: number;
  nextStep: string;
  businessRegistrationNumber?: string;
}

function saveSession(data: KindergartenVerificationData) {
  if (typeof window === 'undefined') return;

  const session: VerificationSession = {
    ownerVerificationId: data.ownerVerificationId,
    nextStep: data.nextStep,
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
  type VerificationSession,
};
