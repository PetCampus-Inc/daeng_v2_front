'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { overlay } from 'overlay-kit';

import {
  isUnsavedExitDialogOpen,
  markUnsavedExitDialogClosed,
  UNSAVED_EXIT_OVERLAY_ID,
} from '@shared/lib/openUnsavedExitDialog';

const GUARD_STATE_KEY = '__unsavedExitGuard';
/** 글자 입력 직후 브라우저가 내는 popstate만 거른다. 그보다 늦은 뒤로가기는 이탈로 본다. */
const TEXT_ENTRY_POP_IGNORE_MS = 1000;
const NON_TEXT_INPUT_TYPES = new Set([
  'button',
  'submit',
  'reset',
  'checkbox',
  'radio',
  'file',
  'range',
  'color',
  'image',
  'hidden',
]);

interface GuardHistoryState {
  [GUARD_STATE_KEY]?: true;
}

function isTextEntryTarget(target: EventTarget | null) {
  if (target instanceof HTMLTextAreaElement) return !target.disabled && !target.readOnly;
  if (target instanceof HTMLInputElement) {
    return !target.disabled && !target.readOnly && !NON_TEXT_INPUT_TYPES.has(target.type);
  }
  return target instanceof HTMLElement && target.isContentEditable;
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
 *
 * 가드는 입력칸에 포커스가 있어도 건다. 포커스가 남은 채 뒤로가면 이탈로 본다.
 * 모바일 브라우저(한글 IME)는 pushState 직후 다음 글자에서 popstate를 보낸다.
 * 그 popstate만 이탈로 보지 않고 가드를 다시 건다.
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

    let cancelled = false;
    let isComposing = false;
    let lastEditAt = 0;
    let armTimer = 0;
    let detachPopState: (() => void) | null = null;

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

      // 경고 모달이 열린 채 브라우저 백 → 모달만 닫고 가드 재장착 (페이지 이탈/모달 재오픈 방지)
      if (isUnsavedExitDialogOpen()) {
        markUnsavedExitDialogClosed();
        overlay.close(UNSAVED_EXIT_OVERLAY_ID);
        pushGuardState();
        return;
      }

      const editedJustNow = lastEditAt > 0 && performance.now() - lastEditAt < TEXT_ENTRY_POP_IGNORE_MS;
      const isEditing = isTextEntryTarget(document.activeElement) && (isComposing || editedJustNow);
      if (isEditing) {
        pushGuardState();
        return;
      }

      // dirty 이탈 시도 → URL 복구 후 기존 이탈 핸들러 호출
      pushGuardState();
      onAttemptLeaveRef.current();
    };

    const arm = () => {
      if (cancelled || detachPopState) return;

      isComposing = false;
      pushGuardState();
      window.addEventListener('popstate', onPopState);
      detachPopState = () => window.removeEventListener('popstate', onPopState);
    };

    const scheduleArm = () => {
      window.clearTimeout(armTimer);
      armTimer = window.setTimeout(arm, 0);
    };

    const onFocusOut = () => {
      isComposing = false;
      scheduleArm();
    };

    const markEditing = (event: Event) => {
      if (!isTextEntryTarget(event.target)) return;
      lastEditAt = performance.now();
    };

    const onCompositionStart = () => {
      isComposing = true;
    };

    const onCompositionEnd = () => {
      isComposing = false;
      scheduleArm();
    };

    document.addEventListener('beforeinput', markEditing, true);
    document.addEventListener('input', markEditing, true);
    document.addEventListener('compositionupdate', markEditing, true);
    document.addEventListener('compositionstart', onCompositionStart, true);
    document.addEventListener('compositionend', onCompositionEnd, true);
    document.addEventListener('focusout', onFocusOut);
    arm();

    return () => {
      cancelled = true;
      window.clearTimeout(armTimer);
      document.removeEventListener('beforeinput', markEditing, true);
      document.removeEventListener('input', markEditing, true);
      document.removeEventListener('compositionupdate', markEditing, true);
      document.removeEventListener('compositionstart', onCompositionStart, true);
      document.removeEventListener('compositionend', onCompositionEnd, true);
      document.removeEventListener('focusout', onFocusOut);
      detachPopState?.();

      if (!detachPopState || !isGuardHistoryState(window.history.state)) return;

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
