import { event } from './gtag';

export const AnalyticsEvent = {
  // 회원가입 관련
  SIGN_UP_START: 'sign_up_start',
  SIGN_UP_NICKNAME_COMPLETED: 'sign_up_nickname_completed',
  SIGN_UP_LOCATION_COMPLETED: 'sign_up_location_completed',
  SIGN_UP_PET_COMPLETED: 'sign_up_pet_completed',
  SIGN_UP_COMPLETED: 'sign_up_completed',

  // 로그인 관련
  LOGIN: 'login',
  LOGOUT: 'logout',
} as const;

type SocialProvider = 'KAKAO' | 'GOOGLE' | 'APPLE';

export const trackSignUpStart = (provider: SocialProvider) => {
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
