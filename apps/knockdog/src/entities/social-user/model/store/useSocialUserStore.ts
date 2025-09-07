import { create } from 'zustand';

import { SocialUser } from '../socialUser';
import { eventBus } from '@shared/utils';

interface SocialUserStore {
  /** 소셜 유저 정보 */
  socialUser: SocialUser | null;
  /** 소셜 유저 정보 저장 */
  setSocialUser: (socialUser: SocialUser | null) => void;
}

const useSocialUserStore = create<SocialUserStore>((set) => ({
  socialUser: null,
  setSocialUser: (socialUser) => set({ socialUser }),
}));

// 로그아웃 이벤트 구독
eventBus.subscribe('auth:logout', () => {
  // 로그아웃 시 소셜 유저 정보 초기화
  useSocialUserStore.setState({ socialUser: null });
});

export { useSocialUserStore };
