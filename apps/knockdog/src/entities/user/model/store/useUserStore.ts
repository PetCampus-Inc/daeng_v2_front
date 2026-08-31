import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { normalizeUserAddresses, User } from '../user';
import { eventBus } from '@shared/utils';
import { STORAGE_KEYS } from '@shared/constants/storage';
import { createSuppressibleJSONStorage } from '@shared/lib/storage';

const { storage, runWithoutPersisting } = createSuppressibleJSONStorage();

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
      storage,
      onRehydrateStorage: () => (state) => {
        if (!state?.user) return;

        const addresses = normalizeUserAddresses(state.user.addresses);
        const hasChanged =
          addresses.length !== state.user.addresses.length ||
          addresses.some((address, index) => address !== state.user?.addresses[index]);

        if (hasChanged) {
          state.setUser({ ...state.user, addresses });
        }
      },
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
          // 받은 값을 그대로 재기록하면(zustand persist가 매번 localStorage에
          // 재기록) 다른 탭에서 다시 storage 이벤트로 잡혀 서로 반사하는 무한
          // 핑퐁이 될 수 있다(mypageRoleViewStore의 prefersGuardianView에서
          // 실기기로 확인된 것과 동일한 패턴 — 두 탭이 실제로 다른 값을 주고받는
          // 경우 "같은 값이면 건너뛴다" 비교만으로는 못 막아서, 반영 자체를
          // runWithoutPersisting으로 감싸 localStorage 재기록을 원천 차단한다).
          const current = useUserStore.getState().user;
          if (JSON.stringify(parsed.state.user) !== JSON.stringify(current)) {
            runWithoutPersisting(() => useUserStore.getState().setUser(parsed.state.user));
          }
        }
      } catch (error) {
        console.error('Failed to sync user from storage:', error);
      }
    } else if (e.key === STORAGE_KEYS.USER && e.newValue === null) {
      // 삭제된 경우
      if (useUserStore.getState().user !== null) {
        runWithoutPersisting(() => useUserStore.getState().clearUser());
      }
    }
  });

  // 네이티브 앱의 탭은 각각 별도 WebView라 로그인·주소 변경이 다른 탭에서
  // 발생했을 때 storage 이벤트를 받지 못할 수 있다. 네이티브가 활성 탭에
  // 주입하는 focus 이벤트에서 persist 저장소를 다시 읽어 최신 사용자 상태를 맞춘다.
  const rehydrateFromNativeFocus = () => {
    Promise.resolve(useUserStore.persist.rehydrate()).catch((error: unknown) => {
      console.error('Failed to sync user store on native tab focus:', error);
    });
  };

  window.addEventListener('knockdog:native-tab-focus', rehydrateFromNativeFocus);

  // WebViewScreen은 화면 focus/load 완료 시점에 focus 이벤트를 주입하는데, 이
  // 리스너 등록보다 그 주입이 먼저 일어나면 신호를 놓친다(예: 회원가입 직후
  // reset()으로 새로 뜬 탭에서 이 모듈이 평가되기 전에 이미 focus 처리된 경우).
  // 놓치면 이 탭의 user가 계속 비어 있어, user 필요 화면(약관 동의 시트 등)이
  // 영영 안 뜨는 것처럼 보일 수 있다. 이미 focus된 상태라면 곧바로 한 번
  // 동기화하고, 그마저도 놓쳤을 경우를 대비해 짧은 시간 뒤 한 번 더 시도한다.
  if (window.__knockdogNativeTabFocused === true) {
    rehydrateFromNativeFocus();
  }

  window.setTimeout(() => {
    if (window.__knockdogNativeTabFocused !== false) rehydrateFromNativeFocus();
  }, 2_000);
}

export { useUserStore };
