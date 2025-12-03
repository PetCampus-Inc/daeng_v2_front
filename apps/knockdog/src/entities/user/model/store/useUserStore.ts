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
      setUser: (user: User | null) => set({ user }),
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

eventBus.subscribe('auth:login', (...args: unknown[]) => {
  const user = args[0] as User;
  useUserStore.getState().setUser(user);
});

// Cross-tab 동기화: 다른 탭/창에서 localStorage 변경 시 store 업데이트
// eventBus로 전달하면 될 줄 알았는데, 잘 안되서 우선 시간이 없어서 아래 방법으로 임시 작성함
// @TODO : 더 좋은 방법이 있으면 변경 필요
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e: StorageEvent) => {
    if (e.key === STORAGE_KEYS.USER && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed?.state?.user !== undefined) {
          useUserStore.getState().setUser(parsed.state.user);
        }
      } catch (error) {
        console.error('Failed to sync user from storage:', error);
      }
    } else if (e.key === STORAGE_KEYS.USER && e.newValue === null) {
      // 삭제된 경우
      useUserStore.getState().clearUser();
    }
  });
}

export { useUserStore };
