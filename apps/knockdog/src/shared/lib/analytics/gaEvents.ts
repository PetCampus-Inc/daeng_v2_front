'use client';

import { METHODS } from '@knockdog/bridge-core';

import { getBridgeInstance } from '@shared/lib/bridge';
import { isNativeWebView } from '@shared/lib/device';

import { event as gtagEvent, pageview } from './gtag';

type AnalyticsParamValue = string | number | boolean;
type AnalyticsSurface = 'web' | 'native_webview';
type AnalyticsSink = 'web_ga4' | 'firebase';

/** GA4 가이드 커스텀 이벤트 */
const GaEvent = {
  NOTIFICATION_PERMISSION: 'notification_permission',
  SIGN_UP: 'sign_up',
  PET_PROFILE_REGISTER: 'pet_profile_register',
  INVITE_OPEN: 'invite_open',
  CONNECTION_START: 'connection_start',
  CONNECTION_STATUS: 'connection_status',
  CONNECTION_RESULT: 'connection_result',
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
type InviteOpenMethod = 'link' | 'qr';
type InviteEntrySource = 'invite_link' | 'invite_qr';
type PetProfileEntryPoint = 'connection_request' | 'mypage';
type ConnectionStatus = 'submit' | 'approve' | 'reject' | 'cancel' | 'disconnect';
type ConnectionActor = 'guardian' | 'owner';
type ConnectionResultStatus = 'approve' | 'reject';
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

function getAnalyticsSurface(): AnalyticsSurface {
  return isNativeWebView() ? 'native_webview' : 'web';
}

function getCommonAnalyticsParams(sink: AnalyticsSink): Record<string, AnalyticsParamValue> {
  const surface = getAnalyticsSurface();

  return {
    analytics_surface: surface,
    analytics_runtime: surface === 'native_webview' ? 'app' : 'browser',
    analytics_sink: sink,
  };
}

/**
 * gtag는 동기 전송을 먼저 하고, WebView면 Firebase도 fire-and-forget으로 보낸다.
 * 브릿지를 await 한 뒤에 gtag를 호출하면 알림 탭 직후 네비게이션에 가려져
 * 웹 GA4에 이벤트가 안 남는 경우가 있다.
 */
async function logAnalyticsEvent(name: string, params?: Record<string, AnalyticsParamValue | undefined>) {
  const safeParams = sanitizeParams(params);

  gtagEvent({
    action: name,
    ...getCommonAnalyticsParams('web_ga4'),
    ...safeParams,
  });

  if (!isNativeWebView()) return;

  const bridge = getBridgeInstance();
  if (!bridge) return;

  try {
    await bridge.request(METHODS.analyticsLogEvent, {
      name,
      params: {
        ...getCommonAnalyticsParams('firebase'),
        ...safeParams,
      },
    });
  } catch (error) {
    console.warn('[analytics] native logEvent failed', name, error);
  }
}

/**
 * 화면 조회 — 웹 GA4를 공통 기준으로 남기고, 앱 WebView는 Firebase screen_view에도 미러링한다.
 * GA페이지 제목 및 화면 클래스에 한글 화면명/유치원명이 보이도록
 * screen_name·screen_class·page_title에 동일 라벨을 넣는다.
 */
async function trackScreenView(screenName: string, screenClass?: string) {
  const name = screenName.trim();
  if (!name) return;

  const screen_class = (screenClass?.trim() || name) as string;

  if (typeof document !== 'undefined') {
    document.title = `똑독 - ${name}`;
  }

  pageview(typeof window !== 'undefined' ? window.location.pathname : screen_class, name, {
    ...getCommonAnalyticsParams('web_ga4'),
    screen_name: name,
    screen_class,
  });

  if (isNativeWebView()) {
    const bridge = getBridgeInstance();
    if (!bridge) return;

    try {
      await bridge.request(METHODS.analyticsLogScreenView, {
        screen_name: name,
        screen_class,
        params: getCommonAnalyticsParams('firebase'),
      });
    } catch (error) {
      console.warn('[analytics] native logScreenView failed', name, error);
    }
  }
}

function trackNotificationPermission(params: { status: NotificationPermissionStatus }) {
  void logAnalyticsEvent(GaEvent.NOTIFICATION_PERMISSION, params);
}

function trackSignUp(params: { method: SignUpMethod; entry_source: EntrySource }) {
  void logAnalyticsEvent(GaEvent.SIGN_UP, params);
}

function trackPetProfileRegister(params: { entry_point: PetProfileEntryPoint; breed: string }) {
  void logAnalyticsEvent(GaEvent.PET_PROFILE_REGISTER, params);
}

function trackInviteOpen(params: { method: InviteOpenMethod; entry_source: InviteEntrySource }) {
  void logAnalyticsEvent(GaEvent.INVITE_OPEN, params);
}

function trackConnectionStart(params: { entry_source: InviteEntrySource }) {
  void logAnalyticsEvent(GaEvent.CONNECTION_START, params);
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

function trackConnectionResult(params: { status: ConnectionResultStatus; application_id: string }) {
  void logAnalyticsEvent(GaEvent.CONNECTION_RESULT, params);
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
  trackScreenView,
  trackNotificationPermission,
  trackSignUp,
  trackPetProfileRegister,
  trackInviteOpen,
  trackConnectionStart,
  trackConnectionStatus,
  trackConnectionResult,
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
  InviteOpenMethod,
  InviteEntrySource,
  PetProfileEntryPoint,
  ConnectionStatus,
  ConnectionActor,
  ConnectionResultStatus,
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
