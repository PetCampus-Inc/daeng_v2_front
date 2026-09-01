import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    (set) => ({
      prefersGuardianView: false,
      setPrefersGuardianView: (value) => {
        console.log('[QA207-DEBUG] setPrefersGuardianView', { value, at: Date.now() });
        set({ prefersGuardianView: value });
      },
      togglePrefersGuardianView: () =>
        set((state) => {
          const next = !state.prefersGuardianView;
          console.log('[QA207-DEBUG] togglePrefersGuardianView', { next, at: Date.now() });
          return { prefersGuardianView: next };
        }),
      resetPrefersGuardianView: () => {
        console.log('[QA207-DEBUG] resetPrefersGuardianView', { at: Date.now() });
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
    console.log('[QA207-DEBUG] __knockdogSetPrefersGuardianView called', { value, at: Date.now() });
    useMypageRoleViewStore.getState().setPrefersGuardianView(value);
  };
}

/** 네이티브 앱의 탭은 각각 별도 WebView라, 다른 탭(예: 푸시가 이동시킨 탭)에서 쓴
 * localStorage 변경의 storage 이벤트를 백그라운드 탭이 서스펜드돼 놓칠 수 있다
 * (useUserStore.ts와 동일한 패턴). 네이티브가 활성 탭에 주입하는 focus 이벤트에서
 * persist 저장소를 다시 읽어 최신 값으로 맞춘다 — 이게 없으면 놓친 탭이 stale한
 * prefersGuardianView로 SyncNativeMainTabModeEffect를 실행해 되돌아간 것처럼 보인다. */
if (typeof window !== 'undefined') {
  const rehydrateFromNativeFocus = (source: string) => {
    const startedAt = Date.now();
    console.log('[QA207-DEBUG] rehydrateFromNativeFocus start', {
      source,
      at: startedAt,
      beforePrefersGuardianView: useMypageRoleViewStore.getState().prefersGuardianView,
    });
    Promise.resolve(useMypageRoleViewStore.persist.rehydrate())
      .then(() => {
        console.log('[QA207-DEBUG] rehydrateFromNativeFocus done', {
          source,
          startedAt,
          finishedAt: Date.now(),
          durationMs: Date.now() - startedAt,
          afterPrefersGuardianView: useMypageRoleViewStore.getState().prefersGuardianView,
        });
      })
      .catch((error: unknown) => {
        console.error('Failed to sync mypage role view on native tab focus:', error);
      });
  };

  window.addEventListener('knockdog:native-tab-focus', () => rehydrateFromNativeFocus('focus-event'));

  // WebViewScreen은 화면 focus/load 완료 시점에 focus 이벤트를 주입하는데, 이 리스너
  // 등록보다 그 주입이 먼저 일어나면 신호를 놓친다. 이미 focus된 상태라면 곧바로 한 번
  // 동기화하고, 그마저도 놓쳤을 경우를 대비해 짧은 시간 뒤 한 번 더 시도한다.
  if (window.__knockdogNativeTabFocused === true) {
    rehydrateFromNativeFocus('mount-already-focused');
  }

  window.setTimeout(() => {
    if (window.__knockdogNativeTabFocused !== false) rehydrateFromNativeFocus('2s-fallback');
  }, 2_000);
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

    const current = useMypageRoleViewStore.getState().prefersGuardianView;

    if (e.newValue === null) {
      if (current === false) return;
      runWithoutPersisting(() => useMypageRoleViewStore.getState().resetPrefersGuardianView());
      return;
    }

    try {
      const parsed = JSON.parse(e.newValue) as { state?: { prefersGuardianView?: boolean } };
      const incoming = parsed?.state?.prefersGuardianView;
      console.log('[QA207-DEBUG] storage event', { incoming, current, at: Date.now() });
      if (typeof incoming === 'boolean' && incoming !== current) {
        runWithoutPersisting(() => useMypageRoleViewStore.getState().setPrefersGuardianView(incoming));
      }
    } catch (error) {
      console.error('Failed to sync mypage role view from storage:', error);
    }
  });
}

export { useMypageRoleViewStore };
