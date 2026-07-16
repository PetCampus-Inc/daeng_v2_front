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

function saveReleasePermissionReasonDraft(draft: ReleasePermissionReasonDraft) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(RELEASE_PERMISSION_REASON_DRAFT_KEY, JSON.stringify(draft));
}

function loadReleasePermissionReasonDraft(): ReleasePermissionReasonDraft | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(RELEASE_PERMISSION_REASON_DRAFT_KEY);
    if (!raw) return null;

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

function clearReleasePermissionReasonDraft() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(RELEASE_PERMISSION_REASON_DRAFT_KEY);
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
