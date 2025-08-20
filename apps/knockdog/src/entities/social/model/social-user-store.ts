import { create } from 'zustand';

import { SocialUser } from './social-user';

interface SocialUserStore {
  socialUser: SocialUser | null;
  setSocialUser: (socialUser: SocialUser) => void;
}

export const useSocialUserStore = create<SocialUserStore>((set) => ({
  socialUser: null,
  setSocialUser: (socialUser) => set({ socialUser }),
}));
