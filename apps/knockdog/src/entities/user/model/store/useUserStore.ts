import { create } from 'zustand';

import { User } from '../user';
import { eventBus } from '@shared/utils';

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
}

const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

// 로그아웃 이벤트 구독
eventBus.subscribe('auth:logout', () => {
  // 로그아웃 시 유저 정보 초기화
  useUserStore.setState({ user: null });
});

export { useUserStore };
