import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// TEMP DEBUG: 원장/보호자 깜빡임 원인 파악용. 확인 끝나면 제거.
import { pushRoleFlickerDebugLog } from './roleFlickerDebugLogStore';

import { STORAGE_KEYS } from '@shared/constants/storage';
import { createSuppressibleJSONStorage } from '@shared/lib/storage';

const { storage, runWithoutPersisting } = createSuppressibleJSONStorage();

interface MypageRoleViewStore {
  prefersGuardianView: boolean;
  setPrefersGuardianView: (value: boolean) => void;
  togglePrefersGuardianView: () => void;
  resetPrefersGuardianView: () => void;
}

const useMypageRoleViewStore = create<MypageRoleViewStore>()(
  persist(
    (set, get) => ({
      prefersGuardianView: false,
      setPrefersGuardianView: (value) => {
        pushRoleFlickerDebugLog(`[store] setPrefersGuardianView(${value}) prev=${get().prefersGuardianView}`);
        set({ prefersGuardianView: value });
      },
      togglePrefersGuardianView: () => {
        pushRoleFlickerDebugLog(`[store] togglePrefersGuardianView() prev=${get().prefersGuardianView}`);
        set((state) => ({ prefersGuardianView: !state.prefersGuardianView }));
      },
      resetPrefersGuardianView: () => {
        pushRoleFlickerDebugLog(`[store] resetPrefersGuardianView() prev=${get().prefersGuardianView}`);
        set({ prefersGuardianView: false });
      },
    }),
    {
      name: STORAGE_KEYS.MYPAGE_ROLE_VIEW,
      storage,
    }
  )
);

declare global {
  interface Window {
    /** 네이티브(푸시 딥링크 등)가 강제로 특정 탭으로 이동시킬 때 뷰 선호도를 맞추기 위해 호출 */
    __knockdogSetPrefersGuardianView?: (value: boolean) => void;
  }
}

/** 네이티브가 원장/보호자 전용 탭으로 강제 이동시킬 때, 이후 다른 탭으로 넘어가도
 * 모드가 되돌아가지 않도록 뷰 선호도를 같이 맞춘다. */
if (typeof window !== 'undefined') {
  window.__knockdogSetPrefersGuardianView = (value: boolean) => {
    pushRoleFlickerDebugLog(`[source=native-call] __knockdogSetPrefersGuardianView(${value})`);
    useMypageRoleViewStore.getState().setPrefersGuardianView(value);
  };
}

/** 탭 WebView 간 prefersGuardianView 동기화
 *
 * 받은 값을 그대로 setPrefersGuardianView로 다시 쓰면(zustand persist가 매번
 * localStorage에 재기록) 그 재기록이 다른 탭에서 또 storage 이벤트로 잡혀 서로
 * 반사하는 무한 핑퐁이 될 수 있다. 실기기에서 값이 초당 수백 번 왕복하는 것을
 * 확인했는데, 두 탭이 서로 다른 값을 실제로 주고받는 경우(예: 다른 탭이 별도
 * 이유로 반대 값을 쓰는 경우) "같은 값이면 건너뛴다" 가드만으로는 막지 못했다.
 * storage 이벤트로 받은 값을 반영하는 동안은 runWithoutPersisting으로 감싸
 * localStorage 재기록 자체를 막아, 몇 개 탭이 얽혀있든 재전파를 원천 차단한다.
 */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e: StorageEvent) => {
    if (e.key !== STORAGE_KEYS.MYPAGE_ROLE_VIEW) return;

    pushRoleFlickerDebugLog(`[source=storage-event] newValue=${e.newValue}`);

    const current = useMypageRoleViewStore.getState().prefersGuardianView;

    if (e.newValue === null) {
      if (current === false) return;
      runWithoutPersisting(() => useMypageRoleViewStore.getState().resetPrefersGuardianView());
      return;
    }

    try {
      const parsed = JSON.parse(e.newValue) as { state?: { prefersGuardianView?: boolean } };
      const incoming = parsed?.state?.prefersGuardianView;
      if (typeof incoming === 'boolean' && incoming !== current) {
        runWithoutPersisting(() => useMypageRoleViewStore.getState().setPrefersGuardianView(incoming));
      }
    } catch (error) {
      console.error('Failed to sync mypage role view from storage:', error);
    }
  });
}

export { useMypageRoleViewStore };
