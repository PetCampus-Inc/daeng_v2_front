'use client';

import {
  type ChangeEvent,
  type CompositionEvent,
  type FocusEvent,
  type FormEvent,
  type PointerEvent,
  useEffect,
  useRef,
} from 'react';

import { Textarea, TextareaInput } from '@knockdog/ui';

interface TemplateContentTextareaProps {
  value: string;
  maxLength: number;
  placeholder: string;
  onChange: (value: string) => void;
}

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
    // textarea 내부 스크롤은 복원 대상에서 제외 — 본문 스크롤은 유지
    if (node instanceof HTMLTextAreaElement) {
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

  const previous = {
    bodyOverflow: document.body.style.overflow,
    bodyPosition: document.body.style.position,
    bodyTop: document.body.style.top,
    bodyWidth: document.body.style.width,
    rootOverflow: root?.style.overflow ?? '',
  };

  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%';
  if (root) root.style.overflow = 'hidden';

  return () => {
    document.body.style.overflow = previous.bodyOverflow;
    document.body.style.position = previous.bodyPosition;
    document.body.style.top = previous.bodyTop;
    document.body.style.width = previous.bodyWidth;
    if (root) root.style.overflow = previous.rootOverflow;
    window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' });
  };
}

function clampToMaxLength(value: string, maxLength: number) {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

const SCROLL_RESTORE_DELAYS_MS = [50, 150, 350, 500, 800] as const;

/** 템플릿 본문: 세로로만 남은 영역을 채움 (가로는 제목 필드와 동일) */
function TemplateContentTextarea({
  value,
  maxLength,
  placeholder,
  onChange,
}: TemplateContentTextareaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleTouchStart = (event: TouchEvent) => {
      scrollSnapshotRef.current = captureScrollSnapshot(containerRef.current);

      // 이미 포커스면 기본 동작 유지 (캐럿/본문 스크롤)
      if (document.activeElement === textarea) return;

      // 첫 탭: 브라우저 scrollIntoView로 본문·페이지가 위로 튀는 것 차단
      event.preventDefault();
      textarea.focus({ preventScroll: true });
    };

    textarea.addEventListener('touchstart', handleTouchStart, { passive: false });

    return () => {
      textarea.removeEventListener('touchstart', handleTouchStart);
      stopScrollLock();
      clearScrollRestoreTimers();
    };
  }, []);

  const emitChange = (nextValue: string) => {
    onChange(clampToMaxLength(nextValue, maxLength));
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    emitChange(event.target.value);
  };

  const handleBeforeInput = (event: FormEvent<HTMLTextAreaElement>) => {
    const inputEvent = event.nativeEvent as InputEvent;
    if (inputEvent.isComposing) return;

    const data = inputEvent.data;
    if (data == null || data.length === 0) return;

    const target = event.currentTarget;
    const selectionStart = target.selectionStart ?? target.value.length;
    const selectionEnd = target.selectionEnd ?? target.value.length;
    const nextLength = target.value.length - (selectionEnd - selectionStart) + data.length;

    if (nextLength > maxLength) {
      event.preventDefault();
    }
  };

  const handleCompositionEnd = (event: CompositionEvent<HTMLTextAreaElement>) => {
    emitChange(event.currentTarget.value);
  };

  const handlePointerDown = (event: PointerEvent<HTMLTextAreaElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;

    scrollSnapshotRef.current = captureScrollSnapshot(containerRef.current);

    if (document.activeElement === event.currentTarget) return;

    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
  };

  const startScrollLock = (snapshot: ScrollSnapshot, textarea: HTMLTextAreaElement) => {
    stopScrollLock();

    if (isMobileWebView()) {
      pageScrollUnlockRef.current = lockPageScroll();
    }

    const restoreIfScrolledAway = () => {
      restoreScrollSnapshot(snapshot, textarea);
    };

    const onScroll = (event: Event) => {
      // 본문 textarea 스크롤은 그대로 두고, 페이지/외부 스크롤만 되돌림
      if (event.target === textarea) return;
      restoreIfScrolledAway();
    };

    window.addEventListener('scroll', onScroll, { capture: true });
    window.visualViewport?.addEventListener('scroll', onScroll);
    window.visualViewport?.addEventListener('resize', onScroll);

    for (const el of collectScrollRoots(containerRef.current)) {
      el.addEventListener('scroll', onScroll, { passive: true });
    }

    scrollLockCleanupRef.current = () => {
      window.removeEventListener('scroll', onScroll, { capture: true });
      window.visualViewport?.removeEventListener('scroll', onScroll);
      window.visualViewport?.removeEventListener('resize', onScroll);

      for (const el of collectScrollRoots(containerRef.current)) {
        el.removeEventListener('scroll', onScroll);
      }
    };
  };

  const handleFocus = (event: FocusEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget;
    const snapshot = scrollSnapshotRef.current ?? captureScrollSnapshot(containerRef.current);
    scrollSnapshotRef.current = null;

    clearScrollRestoreTimers();
    startScrollLock(snapshot, textarea);

    const restoreIfScrolledAway = () => {
      restoreScrollSnapshot(snapshot, textarea);
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

  return (
    <div
      ref={containerRef}
      className='flex h-full min-h-0 w-full flex-col overscroll-none [&_>div]:flex [&_>div]:h-full [&_>div]:min-h-0 [&_>div]:w-full [&_>div]:flex-col'
    >
      <Textarea
        variant='secondary'
        className='flex h-full min-h-0 w-full flex-1 flex-col gap-6 overflow-hidden focus-within:!border-line-200'
      >
        <TextareaInput
          ref={textareaRef}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={handleChange}
          onBeforeInput={handleBeforeInput}
          onCompositionEnd={handleCompositionEnd}
          onPointerDown={handlePointerDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          spellCheck={false}
          className='touch-manipulation !h-auto min-h-0 w-full flex-1 resize-none overflow-y-auto overscroll-contain'
        />
        <p className='body2-regular text-text-caption shrink-0'>
          {value.length}/{maxLength}
        </p>
      </Textarea>
    </div>
  );
}

export { TemplateContentTextarea };
