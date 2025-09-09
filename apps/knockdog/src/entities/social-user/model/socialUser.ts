import { SOCIAL_PROVIDER } from './constant/provider';

type SocialProvider = (typeof SOCIAL_PROVIDER)[keyof typeof SOCIAL_PROVIDER];

interface SocialUser {
  provider: SocialProvider;
  name: string;
  picture: string;
  email: string;
}

export { SOCIAL_PROVIDER, type SocialUser, type SocialProvider };
