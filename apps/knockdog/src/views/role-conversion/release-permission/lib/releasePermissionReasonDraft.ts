import type { OwnerRoleRevokeReason } from '@entities/user';

import {
  RELEASE_PERMISSION_REASON,
  type ReleasePermissionReason,
} from '@views/role-conversion/release-permission/config/releasePermissionContent';

const RELEASE_PERMISSION_REASON_DRAFT_KEY = 'role_conversion_release_permission_reason_draft';

interface ReleasePermissionReasonDraft {
  reason: ReleasePermissionReason;
  reasonDetail: string;
}

/** FE 해제 사유 → BE `OwnerRoleRevokeReason` */
const FE_TO_BE_REVOKE_REASON: Record<ReleasePermissionReason, OwnerRoleRevokeReason> = {
  [RELEASE_PERMISSION_REASON.CLOSURE]: 'CLOSED',
  [RELEASE_PERMISSION_REASON.SERVICE_STOP]: 'STOP_USING_SERVICE',
  [RELEASE_PERMISSION_REASON.ETC]: 'ETC',
};

function isReleasePermissionReason(value: unknown): value is ReleasePermissionReason {
  return (
    value === RELEASE_PERMISSION_REASON.CLOSURE ||
    value === RELEASE_PERMISSION_REASON.SERVICE_STOP ||
    value === RELEASE_PERMISSION_REASON.ETC
  );
}

function parseDraft(raw: string | null): ReleasePermissionReasonDraft | null {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const record = parsed as Record<string, unknown>;
    if (!isReleasePermissionReason(record.reason)) return null;
    if (typeof record.reasonDetail !== 'string') return null;

    return {
      reason: record.reason,
      reasonDetail: record.reasonDetail,
    };
  } catch {
    return null;
  }
}

/**
 * Stack WebView 간 공유를 위해 localStorage 사용.
 * 기존 sessionStorage 값이 있으면 마이그레이션.
 */
function readRawDraft(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const fromLocal = localStorage.getItem(RELEASE_PERMISSION_REASON_DRAFT_KEY);
    if (fromLocal) return fromLocal;

    const fromSession = sessionStorage.getItem(RELEASE_PERMISSION_REASON_DRAFT_KEY);
    if (fromSession) {
      try {
        localStorage.setItem(RELEASE_PERMISSION_REASON_DRAFT_KEY, fromSession);
        sessionStorage.removeItem(RELEASE_PERMISSION_REASON_DRAFT_KEY);
      } catch {
      }
      return fromSession;
    }
  } catch {
    return null;
  }

  return null;
}

function writeDraft(draft: ReleasePermissionReasonDraft) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(RELEASE_PERMISSION_REASON_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // quota/private mode — 호출부(saveDraft 등)로 예외 전파하지 않음
  }

  try {
    sessionStorage.removeItem(RELEASE_PERMISSION_REASON_DRAFT_KEY);
  } catch {
    // ignore
  }
}

function saveReleasePermissionReasonDraft(draft: ReleasePermissionReasonDraft) {
  if (typeof window === 'undefined') return;
  writeDraft(draft);
}

function loadReleasePermissionReasonDraft(): ReleasePermissionReasonDraft | null {
  if (typeof window === 'undefined') return null;
  return parseDraft(readRawDraft());
}

function clearReleasePermissionReasonDraft() {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(RELEASE_PERMISSION_REASON_DRAFT_KEY);
  } catch {
    // ignore
  }

  try {
    sessionStorage.removeItem(RELEASE_PERMISSION_REASON_DRAFT_KEY);
  } catch {
    // ignore
  }
}

function toRevokeOwnerRoleRequest(draft: ReleasePermissionReasonDraft) {
  const reason = FE_TO_BE_REVOKE_REASON[draft.reason];
  const reasonDetail =
    draft.reason === RELEASE_PERMISSION_REASON.ETC ? draft.reasonDetail.trim() : null;

  return {
    reason,
    reasonDetail,
  };
}

export {
  clearReleasePermissionReasonDraft,
  loadReleasePermissionReasonDraft,
  saveReleasePermissionReasonDraft,
  toRevokeOwnerRoleRequest,
  type ReleasePermissionReasonDraft,
};
