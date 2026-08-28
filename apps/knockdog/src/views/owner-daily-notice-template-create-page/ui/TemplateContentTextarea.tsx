'use client';

import {
  type ChangeEvent,
  type FocusEvent,
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
    roots.add(node);
    node = node.parentElement;
  }

  return [...roots];
}

interface ScrollSnapshot {
  positions: Map<HTMLElement, number>;
  windowScrollY: number;
  textareaScrollTop: number;
}

function captureScrollSnapshot(
  anchor: HTMLElement | null,
  textarea: HTMLTextAreaElement | null
): ScrollSnapshot {
  const positions = new Map<HTMLElement, number>();

  for (const el of collectScrollRoots(anchor)) {
    positions.set(el, el.scrollTop);
  }

  return {
    positions,
    windowScrollY: window.scrollY || document.documentElement.scrollTop || 0,
    textareaScrollTop: textarea?.scrollTop ?? 0,
  };
}

function restoreScrollSnapshot(snapshot: ScrollSnapshot, activeElement: HTMLTextAreaElement) {
  if (document.activeElement !== activeElement) return;

  for (const [el, top] of snapshot.positions) {
    if (Math.abs(el.scrollTop - top) >= 2) {
      el.scrollTop = top;
    }
  }

  if (Math.abs(activeElement.scrollTop - snapshot.textareaScrollTop) >= 2) {
    activeElement.scrollTop = snapshot.textareaScrollTop;
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

    const handleTouchStart = () => {
      scrollSnapshotRef.current = captureScrollSnapshot(containerRef.current, textarea);
    };

    textarea.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      textarea.removeEventListener('touchstart', handleTouchStart);
      stopScrollLock();
      clearScrollRestoreTimers();
    };
  }, []);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value.slice(0, maxLength));
  };

  const handlePointerDown = (event: PointerEvent<HTMLTextAreaElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;

    scrollSnapshotRef.current = captureScrollSnapshot(containerRef.current, event.currentTarget);
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
    const snapshot =
      scrollSnapshotRef.current ?? captureScrollSnapshot(containerRef.current, textarea);
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
