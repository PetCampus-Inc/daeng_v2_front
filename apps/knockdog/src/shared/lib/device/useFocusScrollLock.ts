'use client';

import {
  useEffect,
  useRef,
  type FocusEvent as ReactFocusEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';

import { useBridge } from '@shared/lib/bridge';

function isMobileWebView(): boolean {
  if (typeof window === 'undefined') return false;
  return document.documentElement.getAttribute('data-env') === 'webview';
}

function collectScrollRoots(anchor: HTMLElement | null): HTMLElement[] {
  const roots = new Set<HTMLElement>();

  for (const candidate of [document.documentElement, document.body, document.getElementById('root')]) {
    if (candidate instanceof HTMLElement) roots.add(candidate);
  }

  let node = anchor;
  while (node) {
    // 포커스된 입력창 자신의 내부 스크롤은 복원 대상에서 제외 — 그 안 스크롤은 유지
    if (node instanceof HTMLTextAreaElement || node instanceof HTMLInputElement) {
      node = node.parentElement;
      continue;
    }
    roots.add(node);
    node = node.parentElement;
  }

  return [...roots];
}

interface ScrollSnapshot {
  positions: Map<HTMLElement, number>;
  windowScrollY: number;
}

function captureScrollSnapshot(anchor: HTMLElement | null): ScrollSnapshot {
  const positions = new Map<HTMLElement, number>();

  for (const el of collectScrollRoots(anchor)) {
    positions.set(el, el.scrollTop);
  }

  return {
    positions,
    windowScrollY: window.scrollY || document.documentElement.scrollTop || 0,
  };
}

function restoreScrollSnapshot(snapshot: ScrollSnapshot, activeElement: HTMLElement) {
  if (document.activeElement !== activeElement) return;

  for (const [el, top] of snapshot.positions) {
    if (Math.abs(el.scrollTop - top) >= 2) {
      el.scrollTop = top;
    }
  }

  const currentTop = window.scrollY || document.documentElement.scrollTop || 0;
  if (Math.abs(currentTop - snapshot.windowScrollY) >= 2) {
    window.scrollTo({ top: snapshot.windowScrollY, left: 0, behavior: 'instant' });
  }
}

function lockPageScroll(): () => void {
  const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
  const root = document.getElementById('root');
  const html = document.documentElement;

  const previous = {
    htmlOverflow: html.style.overflow,
    htmlOverscrollBehavior: html.style.overscrollBehavior,
    bodyOverflow: document.body.style.overflow,
    bodyOverscrollBehavior: document.body.style.overscrollBehavior,
    bodyPosition: document.body.style.position,
    bodyTop: document.body.style.top,
    bodyWidth: document.body.style.width,
    rootOverflow: root?.style.overflow ?? '',
  };

  // body만 고정하면 html(documentElement)이 스크롤/바운스되는 경로가 남는다.
  // overscroll-behavior도 같이 꺼야 iOS 고무줄(rubber-band) 바운스가 안 보인다.
  html.style.overflow = 'hidden';
  html.style.overscrollBehavior = 'none';
  document.body.style.overflow = 'hidden';
  document.body.style.overscrollBehavior = 'none';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%';
  if (root) root.style.overflow = 'hidden';

  return () => {
    html.style.overflow = previous.htmlOverflow;
    html.style.overscrollBehavior = previous.htmlOverscrollBehavior;
    document.body.style.overflow = previous.bodyOverflow;
    document.body.style.overscrollBehavior = previous.bodyOverscrollBehavior;
    document.body.style.position = previous.bodyPosition;
    document.body.style.top = previous.bodyTop;
    document.body.style.width = previous.bodyWidth;
    if (root) root.style.overflow = previous.rootOverflow;
    window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' });
  };
}

const SCROLL_RESTORE_DELAYS_MS = [50, 150, 350, 500, 800] as const;

/**
 * 모바일 웹뷰가 포커스된 입력창을 보이게 하려고 페이지/웹뷰 자체를 스크롤시키는
 * 기본 동작을 막는다. input/textarea 어느 쪽에도 붙일 수 있다.
 *
 * 사용법: 대상 엘리먼트에 이 훅이 반환하는 fieldRef/handleFocus/handleBlur를 연결한다.
 * 마우스 클릭으로 캐럿 위치를 옮기는 경우엔 handlePointerDown도 같이 연결해야
 * (네이티브 터치는 훅 내부에서 자동으로 처리됨) 클릭 시점의 스크롤 위치를 정확히 스냅샷할 수 있다.
 */
function useFocusScrollLock<T extends HTMLElement>(): {
  fieldRef: RefObject<T | null>;
  handleFocus: (event: ReactFocusEvent<T>) => void;
  handleBlur: () => void;
  handlePointerDown: (event: ReactPointerEvent<T>) => void;
} {
  const bridge = useBridge();
  const fieldRef = useRef<T>(null);
  const scrollSnapshotRef = useRef<ScrollSnapshot | null>(null);
  const scrollRestoreTimersRef = useRef<number[]>([]);
  const scrollLockCleanupRef = useRef<(() => void) | null>(null);
  const pageScrollUnlockRef = useRef<(() => void) | null>(null);

  const clearScrollRestoreTimers = () => {
    for (const timerId of scrollRestoreTimersRef.current) {
      window.clearTimeout(timerId);
    }
    scrollRestoreTimersRef.current = [];
  };

  const stopScrollLock = () => {
    scrollLockCleanupRef.current?.();
    scrollLockCleanupRef.current = null;
    pageScrollUnlockRef.current?.();
    pageScrollUnlockRef.current = null;

    // CSS/JS 잠금만으로는 못 막는, 네이티브 웹뷰 자체의 포커스-스크롤 동작을 다시 켠다.
    if (isMobileWebView()) {
      bridge.emit('system.setWebViewScrollEnabled', { enabled: true });
    }
  };

  const startScrollLock = (snapshot: ScrollSnapshot, field: HTMLElement) => {
    stopScrollLock();

    if (isMobileWebView()) {
      pageScrollUnlockRef.current = lockPageScroll();
      // 웹뷰(네이티브 스크롤뷰)의 scrollEnabled는 outer 페이지 스크롤과 입력창
      // 내부 스크롤을 따로 구분하지 못해 같이 꺼진다. 전체화면이 절대 안 움직이는 걸
      // 우선해서, 포커스가 유지되는 동안은 계속 꺼둔다. blur/unmount 시
      // stopScrollLock에서 다시 켠다.
      bridge.emit('system.setWebViewScrollEnabled', { enabled: false });
    }

    const restoreIfScrolledAway = () => {
      restoreScrollSnapshot(snapshot, field);
    };

    const onScroll = (event: Event) => {
      // 입력창 자체의 내부 스크롤은 그대로 두고, 페이지/외부 스크롤만 되돌림
      if (event.target === field) return;
      restoreIfScrolledAway();
    };

    window.addEventListener('scroll', onScroll, { capture: true });
    window.visualViewport?.addEventListener('scroll', onScroll);
    window.visualViewport?.addEventListener('resize', onScroll);

    for (const el of collectScrollRoots(fieldRef.current)) {
      el.addEventListener('scroll', onScroll, { passive: true });
    }

    scrollLockCleanupRef.current = () => {
      window.removeEventListener('scroll', onScroll, { capture: true });
      window.visualViewport?.removeEventListener('scroll', onScroll);
      window.visualViewport?.removeEventListener('resize', onScroll);

      for (const el of collectScrollRoots(fieldRef.current)) {
        el.removeEventListener('scroll', onScroll);
      }
    };
  };

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

    const handleTouchStart = () => {
      // 네이티브 터치로 캐럿을 좌표에 두고, 페이지 스크롤만 focus 핸들러에서 복원
      scrollSnapshotRef.current = captureScrollSnapshot(fieldRef.current);
    };

    field.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      field.removeEventListener('touchstart', handleTouchStart);
      stopScrollLock();
      clearScrollRestoreTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<T>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;

    // 네이티브 클릭으로 캐럿을 좌표에 두고, 페이지 스크롤만 focus 핸들러에서 복원
    scrollSnapshotRef.current = captureScrollSnapshot(fieldRef.current);
  };

  const handleFocus = (event: ReactFocusEvent<T>) => {
    const field = event.currentTarget;
    const snapshot = scrollSnapshotRef.current ?? captureScrollSnapshot(fieldRef.current);
    scrollSnapshotRef.current = null;

    clearScrollRestoreTimers();
    startScrollLock(snapshot, field);

    const restoreIfScrolledAway = () => {
      restoreScrollSnapshot(snapshot, field);
    };

    restoreIfScrolledAway();

    requestAnimationFrame(() => {
      restoreIfScrolledAway();
      requestAnimationFrame(restoreIfScrolledAway);
    });

    for (const delay of SCROLL_RESTORE_DELAYS_MS) {
      scrollRestoreTimersRef.current.push(window.setTimeout(restoreIfScrolledAway, delay));
    }
  };

  const handleBlur = () => {
    clearScrollRestoreTimers();
    stopScrollLock();
  };

  return { fieldRef, handleFocus, handleBlur, handlePointerDown };
}

export { useFocusScrollLock };
