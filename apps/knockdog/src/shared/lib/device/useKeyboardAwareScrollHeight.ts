'use client';

import { useEffect, useRef, type RefObject } from 'react';

const KEYBOARD_OPEN_THRESHOLD_PX = 80;
const MIN_SCROLL_HEIGHT_PX = 120;

function resetScrollContainerStyle(node: HTMLElement) {
  node.style.removeProperty('max-height');
  node.style.removeProperty('height');
}

function lockWindowScroll() {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/**
 * 모바일 키보드가 열릴 때 스크롤 컨테이너 높이를 visualViewport에 맞추고,
 * window/visualViewport 스크롤을 잠가 헤더가 같이 밀리지 않게 한다.
 */
function useKeyboardAwareScrollHeight<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const node = ref.current;

    const isKeyboardOpen = () =>
      viewport.height < window.innerHeight - KEYBOARD_OPEN_THRESHOLD_PX;

    const apply = () => {
      const scrollNode = ref.current;
      if (!scrollNode) return;

      if (!isKeyboardOpen()) {
        resetScrollContainerStyle(scrollNode);
        return;
      }

      lockWindowScroll();

      const top = scrollNode.getBoundingClientRect().top;
      const height = Math.max(viewport.height - top, MIN_SCROLL_HEIGHT_PX);
      scrollNode.style.maxHeight = `${height}px`;
      scrollNode.style.height = `${height}px`;
    };

    const handleWindowScroll = () => {
      if (isKeyboardOpen()) {
        lockWindowScroll();
      }
    };

    const handleViewportScroll = () => {
      if (isKeyboardOpen()) {
        lockWindowScroll();
      }
      apply();
    };

    viewport.addEventListener('resize', apply);
    viewport.addEventListener('scroll', handleViewportScroll);
    window.addEventListener('scroll', handleWindowScroll, { capture: true, passive: true });
    window.addEventListener('focusin', apply);
    window.addEventListener('focusout', apply);
    apply();

    return () => {
      viewport.removeEventListener('resize', apply);
      viewport.removeEventListener('scroll', handleViewportScroll);
      window.removeEventListener('scroll', handleWindowScroll, { capture: true });

      if (node) resetScrollContainerStyle(node);
    };
  }, []);

  return ref;
}

export { useKeyboardAwareScrollHeight };
