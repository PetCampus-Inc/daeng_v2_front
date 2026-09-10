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

function hasHistoryTrap(state: unknown): boolean {
  return Boolean(state && typeof state === 'object' && HISTORY_TRAP_KEY in (state as object));
}

/**
 * cleanup 시 현재 entry가 자식 trap이어도 우리 trap이 스택에서 빠질 때까지 pop.
 * (자식 cleanup의 history.back popstate가 오기 전에 부모 cleanup이 동기 실행되면
 * 부모 trap이 orphan으로 남는 레이스 방지)
 */
function discardHistoryTrap(trapId: string, setBypass: (value: boolean) => void) {
  if (!hasHistoryTrap(window.history.state)) return;

  const finish = () => {
    setBypass(false);
  };

  const onPop = () => {
    window.removeEventListener('popstate', onPop);

    // 자식(nested)을 걷어낸 뒤 우리 trap이 top이면 한 번 더
    if (isHistoryTrapState(window.history.state, trapId)) {
      window.addEventListener('popstate', onPopDone);
      window.history.back();
      return;
    }

    finish();
  };

  const onPopDone = () => {
    window.removeEventListener('popstate', onPopDone);
    finish();
  };

  setBypass(true);

  if (isHistoryTrapState(window.history.state, trapId)) {
    window.addEventListener('popstate', onPopDone);
    window.history.back();
    return;
  }

  // nested child trap이 top — 우리 id가 나올 때까지(최대 한 단계 자식) pop 후 재검사
  window.addEventListener('popstate', onPop);
  window.history.back();
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
      discardHistoryTrap(trapId, (value) => {
        bypassRef.current = value;
      });
    };
  }, [isActive]);
}

export { useHistoryBackTrap };
