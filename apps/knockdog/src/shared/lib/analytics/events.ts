import { event } from './gtag';
import { trackSignUp } from './gaEvents';
import {
  consumePendingSignUpAnalytics,
  resolveEntrySource,
  savePendingSignUpAnalytics,
  toSignUpMethod,
} from './pendingSignUp';

/** @deprecated GA 가이드 v3 — 퍼널 중간 단계는 screen_view로 대체. 호출부 호환용 유지 */
export const AnalyticsEvent = {
  SIGN_UP_START: 'sign_up_start',
  SIGN_UP_NICKNAME_COMPLETED: 'sign_up_nickname_completed',
  SIGN_UP_LOCATION_COMPLETED: 'sign_up_location_completed',
  SIGN_UP_PET_COMPLETED: 'sign_up_pet_completed',
  SIGN_UP_COMPLETED: 'sign_up_completed',
  LOGIN: 'login',
  LOGOUT: 'logout',
} as const;

type SocialProvider = 'KAKAO' | 'GOOGLE' | 'APPLE';

export const trackSignUpStart = (provider: SocialProvider) => {
  savePendingSignUpAnalytics(toSignUpMethod(provider), 'organic');
  event({
    action: AnalyticsEvent.SIGN_UP_START,
    category: 'engagement',
    label: provider,
  });
};

export const trackSignUpNicknameCompleted = () => {
  event({
    action: AnalyticsEvent.SIGN_UP_NICKNAME_COMPLETED,
    category: 'engagement',
  });
};

export const trackSignUpLocationCompleted = () => {
  event({
    action: AnalyticsEvent.SIGN_UP_LOCATION_COMPLETED,
    category: 'engagement',
  });
};

export const trackSignUpPetCompleted = () => {
  event({
    action: AnalyticsEvent.SIGN_UP_PET_COMPLETED,
    category: 'engagement',
  });
};

/** 마케팅 동의 화면 호환 — 실제 sign_up은 필수 약관 완료에서 발화 */
export const trackSignUpCompleted = (marketingConsent: boolean) => {
  event({
    action: AnalyticsEvent.SIGN_UP_COMPLETED,
    category: 'engagement',
    label: marketingConsent ? 'marketing_agreed' : 'marketing_declined',
  });
};

export const trackLogin = (provider: SocialProvider) => {
  event({
    action: AnalyticsEvent.LOGIN,
    category: 'engagement',
    label: provider,
  });
};

export {
  consumePendingSignUpAnalytics,
  resolveEntrySource,
  savePendingSignUpAnalytics,
  toSignUpMethod,
  trackSignUp,
};
