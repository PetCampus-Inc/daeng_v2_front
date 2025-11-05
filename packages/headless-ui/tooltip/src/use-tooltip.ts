import * as React from 'react';
import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { useState, useRef, useEffect, useId, useCallback, useLayoutEffect } from 'react';

export type Placement = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface UseTooltipStateProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
  offset?: number;
  autoCloseMs?: number;
  closeOnOutsideClick?: boolean;
  closeOnEsc?: boolean;
  closeOnScroll?: boolean;
}

function useTooltipState(props: UseTooltipStateProps) {
  const [open = false, setOpen] = useControllableState({
    prop: props.open,
    defaultProp: props.defaultOpen ?? false,
    onChange: props.onOpenChange,
  });

  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const id = useId();

  // 자동 닫힘 타이머
  useEffect(() => {
    if (!props.autoCloseMs || !open) return;
    const timerId = setTimeout(() => setOpen(false), props.autoCloseMs);
    return () => clearTimeout(timerId);
  }, [open, props.autoCloseMs, setOpen]);

  // 바깥 클릭/터치로 닫기
  useEffect(() => {
    if (!open || !props.closeOnOutsideClick) return;
    const onDocPointer = (e: PointerEvent) => {
      const target = e.target as Node | null;
      const inTrigger = !!triggerRef.current && triggerRef.current.contains(target);
      const inContent = !!contentRef.current && contentRef.current.contains(target);
      if (!inTrigger && !inContent) setOpen(false);
    };
    document.addEventListener('pointerdown', onDocPointer, { capture: true });
    return () => document.removeEventListener('pointerdown', onDocPointer, { capture: true } as any);
  }, [open, props.closeOnOutsideClick, setOpen]);

  // ESC로 닫기
  useEffect(() => {
    if (!open || !props.closeOnEsc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, props.closeOnEsc, setOpen]);

  // 스크롤 시 닫기
  useEffect(() => {
    if (!open || props.closeOnScroll === false) return;
    const onScroll = () => setOpen(false);

    // 모든 스크롤 가능한 부모 요소에 리스너 추가
    const scrollableParents: (Window | Element)[] = [window];
    let parent: Element | null = triggerRef.current?.parentElement ?? null;
    while (parent) {
      const style = window.getComputedStyle(parent);
      if (
        style.overflow === 'auto' ||
        style.overflow === 'scroll' ||
        style.overflowY === 'auto' ||
        style.overflowY === 'scroll'
      ) {
        scrollableParents.push(parent);
      }
      parent = parent.parentElement;
    }

    scrollableParents.forEach((element) => {
      element.addEventListener('scroll', onScroll, { passive: true });
    });

    return () => {
      scrollableParents.forEach((element) => {
        element.removeEventListener('scroll', onScroll);
      });
    };
  }, [open, props.closeOnScroll, setOpen]);

  return {
    open,
    setOpen,
    triggerRef,
    contentRef,
    placement: props.placement ?? 'top-right',
    offset: props.offset ?? 8,
    id,
  };
}

export interface UseTooltipProps extends UseTooltipStateProps {}

export type UseTooltipReturn = ReturnType<typeof useTooltip>;

export function useTooltip(props: UseTooltipProps) {
  const { open, setOpen, triggerRef, contentRef, placement, offset, id } = useTooltipState(props);

  // 포지셔닝 스타일 계산
  const [positionStyle, setPositionStyle] = useState<React.CSSProperties>({
    visibility: 'hidden',
    position: 'fixed',
  });

  // 위치 계산 함수
  const calculatePosition = useCallback(() => {
    const trig = triggerRef.current;
    const cont = contentRef.current;
    if (!trig || !cont) return;

    const tr = trig.getBoundingClientRect();
    const cr = cont.getBoundingClientRect();
    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top-left':
        top = tr.top - cr.height - offset;
        left = tr.right - cr.width - offset;
        break;
      case 'top-right':
        top = tr.top - cr.height - offset;
        left = tr.left;
        break;
      case 'bottom-left':
        top = tr.bottom + offset;
        left = tr.right - cr.width - offset;
        break;
      case 'bottom-right':
        top = tr.bottom + offset;
        left = tr.left;
        break;
    }

    // 화면 밖으로 튀는 단순 보정
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (left + cr.width > vw) left = vw - cr.width - 8;
    if (left < 8) left = 8;
    if (top + cr.height > vh) top = vh - cr.height - 8;
    if (top < 8) top = 8;

    setPositionStyle({ position: 'fixed', top, left, visibility: 'visible' });
  }, [placement, offset]);

  // 초기 위치 계산 및 리사이즈 이벤트 처리
  useLayoutEffect(() => {
    if (!open) {
      setPositionStyle({ visibility: 'hidden', position: 'fixed' });
      return;
    }

    // 초기 위치 계산
    calculatePosition();

    // 리사이즈 시 위치 재계산
    const handleResize = () => {
      calculatePosition();
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [open, calculatePosition]);

  const handleTriggerClick = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      setOpen(!open);
    },
    [open, setOpen]
  );

  return {
    open,
    setOpen,
    triggerRef,
    contentRef,
    placement,
    offset,
    id,
    positionStyle,
    triggerProps: {
      ref: triggerRef,
      'aria-haspopup': 'dialog' as const,
      'aria-expanded': open,
      'aria-controls': open ? id : undefined,
      'data-state': open ? 'open' : 'closed',
      onPointerDown: handleTriggerClick,
    },
    contentProps: {
      ref: contentRef,
      id,
      role: 'tooltip',
      'data-state': open ? 'open' : 'closed',
      style: positionStyle,
    },
  };
}
