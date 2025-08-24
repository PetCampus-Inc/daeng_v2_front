export const SOCIAL_PROVIDER_KO = {
  KAKAO: '카카오',
  GOOGLE: '구글',
  APPLE: '애플',
} as const;

export const SOCIAL_PROVIDER = {
  KAKAO: 'KAKAO',
  GOOGLE: 'GOOGLE',
  APPLE: 'APPLE',
} as const;

export type SocialProvider = (typeof SOCIAL_PROVIDER)[keyof typeof SOCIAL_PROVIDER];

export interface SocialUser {
  provider: SocialProvider;
  name: string;
  picture: string;
  email: string;
}
