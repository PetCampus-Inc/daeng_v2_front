import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { User } from '../user';
import { eventBus } from '@shared/utils';
import { STORAGE_KEYS } from '@shared/constants/storage';

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: STORAGE_KEYS.USER,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// 로그아웃 이벤트 구독
eventBus.subscribe('auth:logout', () => {
  useUserStore.getState().clearUser();
});

export { useUserStore };
