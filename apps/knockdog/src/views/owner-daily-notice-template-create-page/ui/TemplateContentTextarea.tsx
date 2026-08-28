'use client';

import { type ChangeEvent, type FocusEvent, useEffect, useRef } from 'react';

import { Textarea, TextareaInput } from '@knockdog/ui';

interface TemplateContentTextareaProps {
  value: string;
  maxLength: number;
  placeholder: string;
  onChange: (value: string) => void;
}

function getScrollableAncestor(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;

  while (node && node !== document.body) {
    const { overflowY } = window.getComputedStyle(node);
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      return node;
    }
    node = node.parentElement;
  }

  return null;
}

interface ScrollSnapshot {
  scrollParent: HTMLElement | null;
  top: number;
}

function captureScrollSnapshot(anchor: HTMLElement | null): ScrollSnapshot | null {
  if (!anchor) return null;

  const scrollParent = getScrollableAncestor(anchor);
  if (scrollParent) {
    return { scrollParent, top: scrollParent.scrollTop };
  }

  return {
    scrollParent: null,
    top: window.scrollY || document.documentElement.scrollTop || 0,
  };
}

function restoreScrollSnapshot(snapshot: ScrollSnapshot, activeElement: HTMLElement) {
  if (document.activeElement !== activeElement) return;

  if (snapshot.scrollParent) {
    if (Math.abs(snapshot.scrollParent.scrollTop - snapshot.top) < 4) return;
    snapshot.scrollParent.scrollTop = snapshot.top;
    return;
  }

  const currentTop = window.scrollY || document.documentElement.scrollTop || 0;
  if (Math.abs(currentTop - snapshot.top) < 4) return;
  window.scrollTo({ top: snapshot.top, left: 0, behavior: 'instant' });
}

/** 템플릿 본문: 세로로만 남은 영역을 채움 (가로는 제목 필드와 동일) */
function TemplateContentTextarea({
  value,
  maxLength,
  placeholder,
  onChange,
}: TemplateContentTextareaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollSnapshotRef = useRef<ScrollSnapshot | null>(null);
  const scrollRestoreTimersRef = useRef<number[]>([]);

  const clearScrollRestoreTimers = () => {
    for (const timerId of scrollRestoreTimersRef.current) {
      window.clearTimeout(timerId);
    }
    scrollRestoreTimersRef.current = [];
  };

  useEffect(() => clearScrollRestoreTimers, []);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value.slice(0, maxLength));
  };

  const handlePointerDown = () => {
    scrollSnapshotRef.current = captureScrollSnapshot(containerRef.current);
  };

  const handleFocus = (event: FocusEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget;
    const snapshot = scrollSnapshotRef.current ?? captureScrollSnapshot(containerRef.current);
    scrollSnapshotRef.current = null;

    if (!snapshot) return;

    clearScrollRestoreTimers();

    const restoreIfScrolledAway = () => {
      restoreScrollSnapshot(snapshot, textarea);
    };

    requestAnimationFrame(() => {
      restoreIfScrolledAway();
      requestAnimationFrame(restoreIfScrolledAway);
    });

    for (const delay of [50, 150, 350, 500]) {
      scrollRestoreTimersRef.current.push(window.setTimeout(restoreIfScrolledAway, delay));
    }
  };

  const handleBlur = () => {
    clearScrollRestoreTimers();
  };

  return (
    <div
      ref={containerRef}
      className='flex h-full min-h-0 w-full flex-col [&_>div]:flex [&_>div]:h-full [&_>div]:min-h-0 [&_>div]:w-full [&_>div]:flex-col'
    >
      <Textarea
        variant='secondary'
        className='flex h-full min-h-0 w-full flex-1 flex-col gap-6 overflow-hidden focus-within:!border-line-200'
      >
        <TextareaInput
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={handleChange}
          onPointerDown={handlePointerDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          spellCheck={false}
          className='!h-auto min-h-0 w-full flex-1 resize-none overflow-y-auto'
        />
        <p className='body2-regular text-text-caption shrink-0'>
          {value.length}/{maxLength}
        </p>
      </Textarea>
    </div>
  );
}

export { TemplateContentTextarea };
