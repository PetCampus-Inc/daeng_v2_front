import { SOCIAL_PROVIDER } from './constant/provider';

export type SocialProvider = (typeof SOCIAL_PROVIDER)[keyof typeof SOCIAL_PROVIDER];

export interface SocialUser {
  provider: SocialProvider;
  name: string;
  picture: string;
  email: string;
}
