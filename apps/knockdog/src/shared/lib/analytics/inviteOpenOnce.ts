'use client';

/** Strict Mode 이중 effect만 막고, 이후 재진입은 허용한다. */
const INVITE_OPEN_DEDUP_MS = 2_000;
const recentInviteOpenByToken = new Map<string, number>();

function claimInviteOpenOnce(token: string): boolean {
  const now = Date.now();
  const lastTrackedAt = recentInviteOpenByToken.get(token) ?? 0;
  if (now - lastTrackedAt < INVITE_OPEN_DEDUP_MS) return false;

  recentInviteOpenByToken.set(token, now);
  return true;
}

export { claimInviteOpenOnce };
