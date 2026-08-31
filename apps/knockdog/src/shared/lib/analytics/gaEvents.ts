'use client';

import { METHODS } from '@knockdog/bridge-core';

import { getBridgeInstance } from '@shared/lib/bridge';
import { isNativeWebView } from '@shared/lib/device';

import { event as gtagEvent } from './gtag';

type AnalyticsParamValue = string | number | boolean;

/** GA4 가이드 커스텀 이벤트 */
const GaEvent = {
  NOTIFICATION_PERMISSION: 'notification_permission',
  SIGN_UP: 'sign_up',
  PET_PROFILE_REGISTER: 'pet_profile_register',
  CONNECTION_STATUS: 'connection_status',
  OWNER_VERIFICATION_STATUS: 'owner_verification_status',
  OWNER_INVITE_SHARE: 'owner_invite_share',
  ACCOUNT_DEACTIVATION: 'account_deactivation',
  NOTEBOOK_ACTION: 'notebook_action',
  ALBUM_ACTION: 'album_action',
  ATTENDANCE_ACTION: 'attendance_action',
  NOTIFICATION_OPEN: 'notification_open',
} as const;

type SignUpMethod = 'kakao' | 'google' | 'apple';
type EntrySource = 'invite_link' | 'invite_qr' | 'organic';
type PetProfileEntryPoint = 'connection_request' | 'mypage';
type ConnectionStatus = 'submit' | 'approve' | 'reject' | 'cancel' | 'disconnect';
type ConnectionActor = 'guardian' | 'owner';
type OwnerVerificationStatus = 'start' | 'submit' | 'approved' | 'failed';
type InviteShareMethod = 'link' | 'qr';
type DeactivationAction = 'role_release' | 'withdrawal';
type RoleReleaseReason = 'closure' | 'suspend' | 'other';
type WithdrawalReason = 'inaccurate_info' | 'bad_exploration' | 'missing_features' | 'other';
type NotificationPermissionStatus = 'granted' | 'denied';
type NotebookAction = 'send' | 'edit' | 'view';
type AlbumAction = 'upload' | 'save' | 'favorite';
type AttendanceAction = 'check_in' | 'check_out' | 'cancel_check_in' | 'cancel_check_out';
type NotificationType = 'connection' | 'notebook' | 'album' | 'attendance';
type ActorRole = 'owner' | 'guardian';
type ActionResult = 'success' | 'fail';

function sanitizeParams(params?: Record<string, AnalyticsParamValue | undefined>) {
  if (!params) return undefined;

  const next: Record<string, AnalyticsParamValue> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    next[key] = value;
  }
  return Object.keys(next).length > 0 ? next : undefined;
}

/**
 * WebView → 네이티브 Firebase Analytics.
 * 브라우저(웹 단독)에서는 기존 gtag로 폴백.
 */
async function logAnalyticsEvent(name: string, params?: Record<string, AnalyticsParamValue | undefined>) {
  const safeParams = sanitizeParams(params);

  if (isNativeWebView()) {
    const bridge = getBridgeInstance();
    if (!bridge) return;

    try {
      await bridge.request(METHODS.analyticsLogEvent, {
        name,
        params: safeParams,
      });
    } catch (error) {
      console.warn('[analytics] native logEvent failed', name, error);
    }
    return;
  }

  gtagEvent({
    action: name,
    ...safeParams,
  });
}

function trackNotificationPermission(params: { status: NotificationPermissionStatus }) {
  void logAnalyticsEvent(GaEvent.NOTIFICATION_PERMISSION, params);
}

function trackSignUp(params: { method: SignUpMethod; entry_source: EntrySource }) {
  void logAnalyticsEvent(GaEvent.SIGN_UP, params);
}

function trackPetProfileRegister(params: { entry_point: PetProfileEntryPoint }) {
  void logAnalyticsEvent(GaEvent.PET_PROFILE_REGISTER, params);
}

function trackConnectionStatus(params: {
  status: ConnectionStatus;
  actor: ConnectionActor;
  entry_source?: EntrySource;
}) {
  void logAnalyticsEvent(GaEvent.CONNECTION_STATUS, {
    status: params.status,
    actor: params.actor,
    ...(params.status === 'submit' ? { entry_source: params.entry_source ?? 'organic' } : {}),
  });
}

function trackOwnerVerificationStatus(params: { status: OwnerVerificationStatus }) {
  void logAnalyticsEvent(GaEvent.OWNER_VERIFICATION_STATUS, params);
}

function trackOwnerInviteShare(params: { method: InviteShareMethod }) {
  void logAnalyticsEvent(GaEvent.OWNER_INVITE_SHARE, params);
}

function trackAccountDeactivation(
  params:
    | { action: 'role_release'; role_release_reason: RoleReleaseReason }
    | { action: 'withdrawal'; withdrawal_reason: WithdrawalReason }
) {
  void logAnalyticsEvent(GaEvent.ACCOUNT_DEACTIVATION, params);
}

function trackNotebookAction(
  params:
    | { action: 'send' | 'edit'; role: ActorRole; result: ActionResult }
    | { action: 'view'; role: ActorRole }
) {
  void logAnalyticsEvent(GaEvent.NOTEBOOK_ACTION, params);
}

function trackAlbumAction(
  params:
    | { action: 'upload'; role: ActorRole; result: ActionResult }
    | { action: 'save' | 'favorite'; role: ActorRole }
) {
  void logAnalyticsEvent(GaEvent.ALBUM_ACTION, params);
}

function trackAttendanceAction(params: { action: AttendanceAction }) {
  void logAnalyticsEvent(GaEvent.ATTENDANCE_ACTION, params);
}

function trackNotificationOpen(params: { notification_type: NotificationType }) {
  void logAnalyticsEvent(GaEvent.NOTIFICATION_OPEN, params);
}

export {
  GaEvent,
  logAnalyticsEvent,
  trackNotificationPermission,
  trackSignUp,
  trackPetProfileRegister,
  trackConnectionStatus,
  trackOwnerVerificationStatus,
  trackOwnerInviteShare,
  trackAccountDeactivation,
  trackNotebookAction,
  trackAlbumAction,
  trackAttendanceAction,
  trackNotificationOpen,
};
export type {
  SignUpMethod,
  EntrySource,
  PetProfileEntryPoint,
  ConnectionStatus,
  ConnectionActor,
  OwnerVerificationStatus,
  InviteShareMethod,
  DeactivationAction,
  RoleReleaseReason,
  WithdrawalReason,
  NotificationPermissionStatus,
  NotebookAction,
  AlbumAction,
  AttendanceAction,
  NotificationType,
  ActorRole,
  ActionResult,
};
