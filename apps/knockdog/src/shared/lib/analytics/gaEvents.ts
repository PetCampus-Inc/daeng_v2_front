'use client';

import { METHODS } from '@knockdog/bridge-core';

import { getBridgeInstance } from '@shared/lib/bridge';
import { isNativeWebView } from '@shared/lib/device';

import { event as gtagEvent, pageview, setGaUserId } from './gtag';

type AnalyticsParamValue = string | number | boolean;
type AnalyticsSurface = 'web' | 'native_webview';
type AnalyticsSink = 'web_ga4' | 'firebase';

/** GA4 가이드 커스텀 이벤트 */
const GaEvent = {
  AUTH_ATTEMPT: 'auth_attempt',
  AUTH_RESULT: 'auth_result',
  SIGN_UP: 'sign_up',
  SIGNUP_STEP: 'signup_step',
  INVITE_ACTION: 'invite_action',
  INVITE_OPEN: 'invite_open',
  CONNECTION_STEP: 'connection_step',
  PET_PROFILE_REGISTER: 'pet_profile_register',
  CONNECTION_STATUS: 'connection_status',
  OWNER_VERIFICATION_STEP: 'owner_verification_step',
  OWNER_VERIFICATION_APPROVED: 'owner_verification_approved',
  ATTENDANCE_ACTION: 'attendance_action',
  NOTEBOOK_COMPOSE_START: 'notebook_compose_start',
  NOTEBOOK_SENT: 'notebook_sent',
  NOTEBOOK_UPDATED: 'notebook_updated',
  NOTEBOOK_VIEW: 'notebook_view',
  ALBUM_UPLOAD_RESULT: 'album_upload_result',
  ALBUM_PHOTO_VIEW: 'album_photo_view',
  ALBUM_FAVORITED: 'album_favorited',
  NOTIFICATION_INBOX_CLICK: 'notification_inbox_click',
  NOTIFICATION_SETTINGS_CHANGED: 'notification_settings_changed',
  OWNER_ROLE_RELEASED: 'owner_role_released',
  ACCOUNT_WITHDRAWN: 'account_withdrawn',
  SCHOOL_DETAIL_VIEW: 'school_detail_view',
  MEMBER_APP_USE: 'member_app_use',
  SCHOOL_MEMO_VIEW: 'school_memo_view',
  SCHOOL_MEMO_CHANGE_RESULT: 'school_memo_change_result',
  SCHOOL_BOOKMARK_LIST_VIEW: 'school_bookmark_list_view',
  SCHOOL_BOOKMARK_CHANGED: 'school_bookmark_changed',
} as const;

type SignUpMethod = 'kakao' | 'google' | 'apple';
type EntrySource = 'invite_link' | 'invite_qr' | 'organic';
type InviteEntrySource = 'invite_link' | 'invite_qr';
type InviteChannel = 'link' | 'qr' | 'unknown';
type SignupSource = 'invite' | 'other' | 'unknown';
type AuthResult = 'success' | 'cancelled' | 'failed' | 'unknown';
type AccountType = 'new' | 'existing' | 'unknown';
type PetProfileEntryPoint = 'connection_request' | 'mypage';
type ConnectionStatus = 'submit' | 'approve' | 'reject' | 'cancel' | 'disconnect';
type ConnectionInitiator = 'guardian' | 'owner' | 'system';
type DisconnectReason = 'manual' | 'owner_role_release' | 'account_withdrawal' | 'other' | 'unknown';
type OwnerVerificationStep =
  | 'entry'
  | 'onboarding'
  | 'daycare_selection'
  | 'profile'
  | 'business_number'
  | 'terms'
  | 'business_check'
  | 'complete';
type StepPhase = 'view' | 'complete';
type SignupStep = 'terms' | 'account_creation';
type SignupPhase = 'view' | 'submit' | 'result';
type StepResult = 'success' | 'failed' | 'unknown';
type RoleReleaseReason = 'closure' | 'suspend' | 'other';
type RoleReleaseTrigger = 'manual' | 'account_withdrawal';
type WithdrawalReason = 'inaccurate_info' | 'bad_exploration' | 'missing_features' | 'other';
type AttendanceAction = 'check_in' | 'check_out' | 'cancel_check_in' | 'cancel_check_out';
type NotificationType = 'connection' | 'notebook' | 'album';
type OsPermission = 'not_determined' | 'granted' | 'denied' | 'provisional' | 'unknown';
type NotificationChangeSource = 'app_toggle' | 'os_prompt' | 'settings_return';
type AlbumUploadResult = 'success' | 'partial_success' | 'failed';
type SchoolEntryPoint = 'map' | 'search' | 'saved' | 'share' | 'other' | 'unknown';
type BookmarkEntryPoint = 'map' | 'search' | 'school_detail' | 'bookmark_list' | 'other' | 'unknown';
type AuthState = 'logged_in' | 'logged_out';

function createAnalyticsId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function track(name: string, params?: Record<string, AnalyticsParamValue | undefined>) {
  void logAnalyticsEvent(name, params);
}

const BLOCKED_PARAM_KEYS = new Set([
  'user_id',
  'session_id',
  'user_pseudo_id',
  'email',
  'phone',
  'phone_number',
  'name',
]);

const FLAG_PARAM_KEYS = new Set([
  'is_internal',
  'is_demo',
  'onboarding_eligible',
  'draft_restored',
  'app_push_enabled',
  'is_favorited',
  'was_owner',
  'has_text',
  'is_empty',
  'is_bookmarked',
]);

function toFlag(value: AnalyticsParamValue) {
  if (value === true || value === 1) return 1;
  if (value === false || value === 0) return 0;
  return undefined;
}

function sanitizeParams(params?: Record<string, AnalyticsParamValue | undefined>) {
  if (!params) return undefined;

  const next: Record<string, AnalyticsParamValue> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || BLOCKED_PARAM_KEYS.has(key)) continue;
    if (FLAG_PARAM_KEYS.has(key)) {
      const flag = toFlag(value);
      if (flag === undefined) continue;
      next[key] = flag;
      continue;
    }
    next[key] = value;
  }
  return Object.keys(next).length > 0 ? next : undefined;
}

function syncAnalyticsUserId(userId: string | null) {
  const nextUserId = userId?.trim() ? userId.trim() : null;
  setGaUserId(nextUserId);

  if (!isNativeWebView()) return;

  const bridge = getBridgeInstance();
  if (!bridge) return;

  bridge.request(METHODS.analyticsSetUserId, { user_id: nextUserId }).catch((error) => {
    console.warn('[analytics] native setUserId failed', error);
  });
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

function trackAuthAttempt(params: {
  method: SignUpMethod;
  entry_point: string;
  flow_id: string;
  auth_attempt_id: string;
}) {
  track(GaEvent.AUTH_ATTEMPT, params);
}

function trackAuthResult(params: {
  method: SignUpMethod;
  auth_result: AuthResult;
  account_type?: AccountType;
  flow_id: string;
  auth_attempt_id: string;
}) {
  track(GaEvent.AUTH_RESULT, {
    method: params.method,
    auth_result: params.auth_result,
    flow_id: params.flow_id,
    auth_attempt_id: params.auth_attempt_id,
    ...(params.account_type ? { account_type: params.account_type } : {}),
  });
}

function trackSignUp(params: { method: SignUpMethod; signup_source: SignupSource; flow_id?: string }) {
  track(GaEvent.SIGN_UP, params);
}

function trackSignupStep(params: {
  flow_id?: string;
  step: SignupStep;
  phase: SignupPhase;
  result?: StepResult;
}) {
  track(GaEvent.SIGNUP_STEP, {
    flow_id: params.flow_id,
    step: params.step,
    phase: params.phase,
    ...(params.phase === 'result' ? { result: params.result ?? 'unknown' } : {}),
  });
}

function trackInviteAction(
  params:
    | { action: 'share_sheet_open' }
    | { action: 'qr_save_result'; result: 'success' | 'failed' | 'unknown' }
) {
  track(GaEvent.INVITE_ACTION, params);
}

function trackInviteOpen(params: {
  invite_channel: InviteChannel;
  validation_result: 'valid' | 'invalid' | 'error';
  school_id?: string;
  flow_id?: string;
}) {
  track(GaEvent.INVITE_OPEN, params);
}

function trackConnectionStep(params: {
  flow_id: string;
  step: 'start' | 'guardian_info' | 'pet_selection' | 'consent' | 'submission';
  phase: StepPhase;
  invite_channel: InviteChannel;
}) {
  track(GaEvent.CONNECTION_STEP, params);
}

function trackPetProfileRegister(params: {
  pet_id: string;
  entry_point: PetProfileEntryPoint;
  breed_code?: string;
  birth_year?: number;
}) {
  track(GaEvent.PET_PROFILE_REGISTER, params);
}

function trackConnectionStatus(params: {
  status: ConnectionStatus;
  school_id?: string;
  school_pet_membership_id?: string;
  initiated_by: ConnectionInitiator;
  invite_channel?: InviteChannel;
  reason?: DisconnectReason;
  flow_id?: string;
  operation_id?: string;
}) {
  track(GaEvent.CONNECTION_STATUS, {
    status: params.status,
    school_id: params.school_id,
    school_pet_membership_id: params.school_pet_membership_id,
    initiated_by: params.initiated_by,
    ...(params.status === 'submit' ? { invite_channel: params.invite_channel } : {}),
    ...(params.status === 'disconnect' ? { reason: params.reason } : {}),
    ...(params.status === 'submit' || params.status === 'cancel' ? { flow_id: params.flow_id } : {}),
    operation_id: params.operation_id,
  });
}

function trackOwnerVerificationStep(params: {
  flow_id?: string;
  step: OwnerVerificationStep;
  phase: StepPhase;
  outcome?: 'success' | 'skipped' | 'blocked' | 'error';
  registration_path?: 'existing' | 'new' | 'unknown';
  verification_id?: string;
}) {
  track(GaEvent.OWNER_VERIFICATION_STEP, {
    ...params,
    ...(params.phase === 'complete' ? { outcome: params.outcome } : {}),
  });
}

function trackOwnerVerificationApproved(params: {
  verification_id?: string;
  school_id?: string;
  registration_path?: 'existing' | 'new';
  daycare_origin?: 'crawled' | 'owner_created' | 'other' | 'unknown';
  flow_id?: string;
}) {
  track(GaEvent.OWNER_VERIFICATION_APPROVED, params);
}

function trackAttendanceAction(params: {
  action: AttendanceAction;
  attendance_id?: string;
  school_id?: string;
  pet_id?: string;
  service_date?: string;
}) {
  track(GaEvent.ATTENDANCE_ACTION, params);
}

function trackNotebookComposeStart(params: {
  compose_id: string;
  entry_point?: string;
  draft_restored?: 0 | 1;
}) {
  track(GaEvent.NOTEBOOK_COMPOSE_START, params);
}

function trackNotebookSent(params: {
  notebook_id?: string;
  school_id?: string;
  pet_id?: string;
  service_date?: string;
}) {
  track(GaEvent.NOTEBOOK_SENT, params);
}

function trackNotebookUpdated(params: { notebook_id?: string; school_id?: string; revision?: number }) {
  track(GaEvent.NOTEBOOK_UPDATED, params);
}

function trackNotebookView(params: {
  notebook_id?: string;
  entry_point?: 'home' | 'calendar' | 'push' | 'inbox';
  connection_context?: 'current' | 'past';
  revision?: number;
}) {
  track(GaEvent.NOTEBOOK_VIEW, params);
}

function trackAlbumUploadResult(params: {
  upload_batch_id: string;
  school_id?: string;
  selected_count: number;
  excluded_count: number;
  published_count: number;
  result: AlbumUploadResult;
}) {
  track(GaEvent.ALBUM_UPLOAD_RESULT, params);
}

function trackAlbumPhotoView(params: {
  photo_id: string;
  school_id?: string;
  entry_point?: 'home' | 'notebook' | 'list' | 'push' | 'inbox';
  connection_context?: 'current' | 'past';
}) {
  track(GaEvent.ALBUM_PHOTO_VIEW, params);
}

function trackAlbumFavorited(params: { photo_id: string; is_favorited: 0 | 1 }) {
  track(GaEvent.ALBUM_FAVORITED, params);
}

function trackNotificationInboxClick(params: { notification_id: string; notification_type?: NotificationType }) {
  track(GaEvent.NOTIFICATION_INBOX_CLICK, params);
}

function trackNotificationSettingsChanged(params: {
  change_source: NotificationChangeSource;
  app_push_enabled?: 0 | 1;
  os_permission?: OsPermission;
}) {
  track(GaEvent.NOTIFICATION_SETTINGS_CHANGED, params);
}

function trackOwnerRoleReleased(params: {
  school_id?: string;
  reason: RoleReleaseReason;
  trigger: RoleReleaseTrigger;
}) {
  track(GaEvent.OWNER_ROLE_RELEASED, params);
}

function trackAccountWithdrawn(params: { reason: WithdrawalReason; was_owner?: 0 | 1 }) {
  track(GaEvent.ACCOUNT_WITHDRAWN, params);
}

function trackSchoolDetailView(params: {
  listing_id: string;
  listing_id_source?: string;
  entry_point?: SchoolEntryPoint;
  auth_state: AuthState;
  search_flow_id?: string;
  search_id?: string;
  search_surface?: 'suggestion' | 'results';
}) {
  track(GaEvent.SCHOOL_DETAIL_VIEW, params);
}

function trackMemberAppUse(params: { screen_name: string; is_internal?: 0 | 1; is_demo?: 0 | 1 }) {
  track(GaEvent.MEMBER_APP_USE, params);
}

function trackSchoolMemoView(params: {
  listing_id: string;
  listing_id_source?: string;
  has_text: 0 | 1;
  photo_count: number;
  entry_point?: 'school_detail' | 'other' | 'unknown';
}) {
  track(GaEvent.SCHOOL_MEMO_VIEW, params);
}

function trackSchoolMemoChangeResult(params: {
  listing_id: string;
  listing_id_source?: string;
  operation_id: string;
  action: 'text_save' | 'photo_add' | 'photo_delete';
  has_text?: 0 | 1;
  photo_count?: number;
  result: 'success' | 'failed' | 'unknown';
  reason_code?: string;
  search_flow_id?: string;
  search_id?: string;
  search_surface?: 'suggestion' | 'results';
}) {
  track(GaEvent.SCHOOL_MEMO_CHANGE_RESULT, params);
}

function trackSchoolBookmarkListView(params: {
  item_count: number;
  is_empty: 0 | 1;
  entry_point?: 'tab' | 'other' | 'unknown';
}) {
  track(GaEvent.SCHOOL_BOOKMARK_LIST_VIEW, params);
}

function trackSchoolBookmarkChanged(params: {
  listing_id: string;
  listing_id_source?: string;
  is_bookmarked: 0 | 1;
  entry_point?: BookmarkEntryPoint;
  search_flow_id?: string;
  search_id?: string;
  search_surface?: 'suggestion' | 'results';
}) {
  track(GaEvent.SCHOOL_BOOKMARK_CHANGED, params);
}

export {
  createAnalyticsId,
  GaEvent,
  logAnalyticsEvent,
  syncAnalyticsUserId,
  trackAccountWithdrawn,
  trackAlbumFavorited,
  trackAlbumPhotoView,
  trackAlbumUploadResult,
  trackAttendanceAction,
  trackAuthAttempt,
  trackAuthResult,
  trackConnectionStatus,
  trackConnectionStep,
  trackInviteAction,
  trackInviteOpen,
  trackMemberAppUse,
  trackNotebookComposeStart,
  trackNotebookSent,
  trackNotebookUpdated,
  trackNotebookView,
  trackNotificationInboxClick,
  trackNotificationSettingsChanged,
  trackOwnerRoleReleased,
  trackOwnerVerificationApproved,
  trackOwnerVerificationStep,
  trackPetProfileRegister,
  trackSchoolBookmarkChanged,
  trackSchoolBookmarkListView,
  trackSchoolDetailView,
  trackSchoolMemoChangeResult,
  trackSchoolMemoView,
  trackScreenView,
  trackSignUp,
  trackSignupStep,
};
export type {
  AccountType,
  AttendanceAction,
  AuthResult,
  AuthState,
  BookmarkEntryPoint,
  ConnectionInitiator,
  ConnectionStatus,
  DisconnectReason,
  EntrySource,
  InviteChannel,
  InviteEntrySource,
  NotificationType,
  OsPermission,
  PetProfileEntryPoint,
  RoleReleaseReason,
  RoleReleaseTrigger,
  SchoolEntryPoint,
  SignUpMethod,
  SignupSource,
  WithdrawalReason,
};
