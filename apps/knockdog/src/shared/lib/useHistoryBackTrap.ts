'use client';

import { useEffect, useRef } from 'react';

const HISTORY_TRAP_KEY = '__knockdogHistoryTrap';

interface HistoryTrapState {
  [HISTORY_TRAP_KEY]?: string;
}

function isHistoryTrapState(state: unknown, id: string): boolean {
  return Boolean(
    state && typeof state === 'object' && (state as HistoryTrapState)[HISTORY_TRAP_KEY] === id
  );
}

/**
 * isActive일 때 같은 URL로 pushState해 브라우저 뒤로가기를 onBack으로 소비.
 * 헤더/코드로 닫을 때는 cleanup에서 history.back()으로 trap만 제거해 앨범 화면에 남김.
 *
 * OverlayProvider / useUnsavedBrowserBackGuard와 동일 패턴.
 */
function useHistoryBackTrap(isActive: boolean, onBack: () => void) {
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;
  const bypassRef = useRef(false);
  const trapIdRef = useRef(`trap-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (!isActive) return;

    const trapId = trapIdRef.current;

    window.history.pushState(
      { ...(window.history.state as object | null), [HISTORY_TRAP_KEY]: trapId },
      '',
      window.location.href
    );

    const onPopState = () => {
      if (bypassRef.current) {
        bypassRef.current = false;
        return;
      }

      // Overlay 등이 위에 쌓은 entry를 걷어낸 경우 — trap이 남아있으면 사용자 이탈이 아님
      if (isHistoryTrapState(window.history.state, trapId)) {
        return;
      }

      onBackRef.current();
    };

    window.addEventListener('popstate', onPopState);

    return () => {
      window.removeEventListener('popstate', onPopState);

      if (!isHistoryTrapState(window.history.state, trapId)) return;

      const discardTrap = () => {
        window.removeEventListener('popstate', discardTrap);
        bypassRef.current = false;
      };

      window.addEventListener('popstate', discardTrap);
      bypassRef.current = true;
      window.history.back();
    };
  }, [isActive]);
}

export { useHistoryBackTrap };
