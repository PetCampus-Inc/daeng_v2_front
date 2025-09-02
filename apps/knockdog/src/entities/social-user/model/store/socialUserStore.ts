import { create } from 'zustand';

import { SocialUser } from '../socialUser';

interface SocialUserStore {
  /** 소셜 유저 정보 */
  socialUser: SocialUser | null;
  /** 소셜 유저 정보 저장 */
  setSocialUser: (socialUser: SocialUser | null) => void;
}

export const useSocialUserStore = create<SocialUserStore>((set) => ({
  socialUser: null,
  setSocialUser: (socialUser) => set({ socialUser }),
}));
