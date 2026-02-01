import { useRef, useEffect, useCallback, type RefObject } from 'react';

/**
 * 탭 전환 시 스크롤 정렬을 담당하는 훅
 *
 * - spacer 높이 계산 (짧은 컨텐츠에서 탭 헤더가 상단에 고정되도록)
 * - ResizeObserver로 컨텐츠 변화 감지 → spacer 재계산 + 대기 중인 스크롤 실행
 * - double-rAF fallback (동일 높이 컨텐츠 전환 등 ResizeObserver 미발생 케이스)
 */
export function useTabScrollAlignment(
  scrollContainerRef: RefObject<HTMLDivElement | null> | undefined,
  activeTab: string,
) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const pendingScrollRef = useRef(false);

  const recalculateSpacer = useCallback(() => {
    const scrollContainer = scrollContainerRef?.current;
    const tabsElement = tabsRef.current;
    const spacerElement = spacerRef.current;
    if (!scrollContainer || !tabsElement || !spacerElement) return;

    const currentSpacerHeight = spacerElement.offsetHeight;
    const tabsRect = tabsElement.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();
    const targetScrollTop = tabsRect.top - containerRect.top + scrollContainer.scrollTop;
    const maxScrollWithoutSpacer =
      scrollContainer.scrollHeight - currentSpacerHeight - scrollContainer.clientHeight;
    const needed = Math.ceil(Math.max(0, targetScrollTop - maxScrollWithoutSpacer));

    if (needed !== currentSpacerHeight) {
      spacerElement.style.height = `${needed}px`;
    }
  }, [scrollContainerRef]);

  const scrollToTabs = useCallback(() => {
    const scrollContainer = scrollContainerRef?.current;
    const tabsElement = tabsRef.current;
    if (!scrollContainer || !tabsElement) return;

    requestAnimationFrame(() => {
      const tabsRect = tabsElement.getBoundingClientRect();
      const containerRect = scrollContainer.getBoundingClientRect();
      const scrollTop = scrollContainer.scrollTop;
      const tabOffsetInContainer = tabsRect.top - containerRect.top + scrollTop;

      scrollContainer.scrollTo({
        top: tabOffsetInContainer,
        behavior: 'smooth',
      });
    });
  }, [scrollContainerRef]);

  /** recalculateSpacer + 대기 중인 스크롤이 있으면 실행 */
  const applyAlignment = useCallback(() => {
    recalculateSpacer();

    if (pendingScrollRef.current) {
      pendingScrollRef.current = false;
      scrollToTabs();
    }
  }, [recalculateSpacer, scrollToTabs]);

  // ResizeObserver: 컨텐츠 스왑/로딩/뷰포트 변화 후 spacer 재계산 + 대기 중인 스크롤 실행
  useEffect(() => {
    const tabsElement = tabsRef.current;
    const scrollContainer = scrollContainerRef?.current;
    if (!tabsElement) return;

    const observer = new ResizeObserver(() => {
      applyAlignment();
    });
    observer.observe(tabsElement);
    if (scrollContainer) {
      observer.observe(scrollContainer);
    }

    return () => observer.disconnect();
  }, [applyAlignment, scrollContainerRef]);

  // Fallback: ResizeObserver가 미발생하는 경우 (동일 높이 컨텐츠 전환 등)
  useEffect(() => {
    if (!pendingScrollRef.current) return;

    let cancelled = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled || !pendingScrollRef.current) return;
        applyAlignment();
      });
    });

    return () => {
      cancelled = true;
    };
  }, [activeTab, applyAlignment]);

  const requestScroll = useCallback(() => {
    pendingScrollRef.current = true;
  }, []);

  return { tabsRef, spacerRef, scrollToTabs, requestScroll };
}
