const SOCIAL_PROVIDER = {
  KAKAO: 'KAKAO',
  GOOGLE: 'GOOGLE',
  APPLE: 'APPLE',
} as const;

type SocialProvider = (typeof SOCIAL_PROVIDER)[keyof typeof SOCIAL_PROVIDER];

interface SocialUser {
  provider: SocialProvider;
  name: string;
  picture: string;
  email: string;
}

export { SOCIAL_PROVIDER, type SocialUser, type SocialProvider };
