'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const GUARD_STATE_KEY = '__unsavedExitGuard';

interface GuardHistoryState {
  [GUARD_STATE_KEY]?: true;
}

function isGuardHistoryState(state: unknown): state is GuardHistoryState {
  return Boolean(state && typeof state === 'object' && GUARD_STATE_KEY in state);
}

function pushGuardState() {
  window.history.pushState({ [GUARD_STATE_KEY]: true } satisfies GuardHistoryState, '', window.location.href);
}

/**
 * dirty일 때만 history trap을 걸어 브라우저 뒤로가기(Chrome back / 제스처)를
 * 페이지 `onAttemptLeave`(이탈 경고 모달)로 연결함
 *
 * 뒤로가기를 영구 차단하지 않음: 확인 시 `releaseAndLeave`로 trap 해제 후 실제 이탈
 */
function useUnsavedBrowserBackGuard(isDirty: boolean, onAttemptLeave: () => void) {
  const onAttemptLeaveRef = useRef(onAttemptLeave);
  onAttemptLeaveRef.current = onAttemptLeave;

  const bypassRef = useRef(false);
  const pendingLeaveRef = useRef<(() => void) | null>(null);
  const [isSuspended, setIsSuspended] = useState(false);

  const shouldArm = isDirty && !isSuspended;

  const releaseAndLeave = useCallback((leave: () => void) => {
    if (!isGuardHistoryState(window.history.state)) {
      leave();
      return;
    }

    pendingLeaveRef.current = leave;
    bypassRef.current = true;
    window.history.back();
  }, []);

  const suspendGuard = useCallback(() => {
    setIsSuspended(true);
  }, []);

  const resumeGuard = useCallback(() => {
    setIsSuspended(false);
  }, []);

  useEffect(() => {
    if (!shouldArm) return;

    pushGuardState();

    const onPopState = () => {
      if (bypassRef.current) {
        bypassRef.current = false;
        const pendingLeave = pendingLeaveRef.current;
        pendingLeaveRef.current = null;
        pendingLeave?.();
        return;
      }

      // OverlayProvider 등이 가드 위에 쌓은 history를 back으로 걷어낸 경우.
      // 여전히 guard state면 사용자 이탈이 아니라 overlay cleanup이므로 무시.
      // (사진 소스 시트/이탈 모달 닫기 → 경고 재오픈/중첩 방지)
      if (isGuardHistoryState(window.history.state)) {
        return;
      }

      // dirty 이탈 시도 → URL 복구 후 기존 이탈 핸들러 호출
      pushGuardState();
      onAttemptLeaveRef.current();
    };

    window.addEventListener('popstate', onPopState);

    return () => {
      window.removeEventListener('popstate', onPopState);

      if (!isGuardHistoryState(window.history.state)) return;

      // dirty 해제/중첩 네비/언마운트 시 trap만 제거 (이탈 콜백 없음)
      const discardTrap = () => {
        window.removeEventListener('popstate', discardTrap);
        bypassRef.current = false;
        pendingLeaveRef.current = null;
      };

      window.addEventListener('popstate', discardTrap);
      bypassRef.current = true;
      window.history.back();
    };
  }, [shouldArm]);

  return { releaseAndLeave, suspendGuard, resumeGuard };
}

export { useUnsavedBrowserBackGuard };
