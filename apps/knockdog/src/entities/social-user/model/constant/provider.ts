const SOCIAL_PROVIDER = {
  KAKAO: 'KAKAO',
  GOOGLE: 'GOOGLE',
  APPLE: 'APPLE',
} as const;

const SOCIAL_PROVIDER_KO = {
  KAKAO: '카카오',
  GOOGLE: '구글',
  APPLE: '애플',
} as const;

const SOCIAL_PROVIDER_ICONS = {
  KAKAO: 'KakaoLogo',
  GOOGLE: 'GoogleLogo',
  APPLE: 'AppleLogo',
} as const;

export { SOCIAL_PROVIDER, SOCIAL_PROVIDER_KO, SOCIAL_PROVIDER_ICONS };
