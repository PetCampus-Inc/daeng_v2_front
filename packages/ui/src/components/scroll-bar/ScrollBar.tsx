'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

import { cn } from '@knockdog/ui/lib';

interface ScrollBarProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  contentClassName?: string;
  viewportProps?: HTMLAttributes<HTMLDivElement>;
}

/* 커스텀 스크롤바 트랙 너비 */
const SCROLLBAR_WIDTH_CLASS = 'w-2.5';
/*`p-0.5`(좌우 각 2px)는 동일하게 유지해야 함*/
const SCROLLBAR_TRACK_PADDING = 4;
/** 콘텐츠가 길어져도 thumb가 너무 작아지지 않도록 보장하는 최소 높이(px) */
const SCROLLBAR_MIN_THUMB_HEIGHT = 24;

/* 네이티브 스크롤바를 숨기고 오른쪽에 커스텀 스크롤바를 렌더링하는 스크롤 영역 */
function ScrollBar({
  children,
  className,
  contentClassName,
  viewportProps,
  ...props
}: ScrollBarProps) {
  /* 실제 scrollTop이 변하는 overflow 컨테이너 */
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dimensionsRef = useRef({ maxThumbTop: 0, maxScrollTop: 0 });

  const [thumbHeight, setThumbHeight] = useState(0);
  const [thumbTop, setThumbTop] = useState(0);
  /* overflow 없으면 커스텀 스크롤바 자체를 숨김 */
  const [isScrollable, setIsScrollable] = useState(false);

  /* viewport 크기·콘텐츠 크기·scrollTop 변화 시 thumb 전체 상태를 재계산*/
  const updateScrollbar = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const { scrollHeight, clientHeight, scrollTop } = viewport;
    const maxScrollTop = scrollHeight - clientHeight;
    /* 서브픽셀 오차 방지: 1px 이하 overflow는 스크롤 불필요로 처리 */
    const hasOverflow = maxScrollTop > 1;

    setIsScrollable((prev) => (prev === hasOverflow ? prev : hasOverflow));

    if (!hasOverflow) {
      dimensionsRef.current = { maxThumbTop: 0, maxScrollTop: 0 };
      setThumbHeight((prev) => (prev === 0 ? prev : 0));
      setThumbTop((prev) => (prev === 0 ? prev : 0));
      return;
    }

    const trackHeight = Math.max(0, clientHeight - SCROLLBAR_TRACK_PADDING);
    /* 비율 = (보이는 영역 / 전체 콘텐츠) × 트랙 높이, 최소 높이 보장 */
    const nextThumbHeight = Math.min(
      trackHeight,
      Math.max(
        (clientHeight / scrollHeight) * trackHeight,
        SCROLLBAR_MIN_THUMB_HEIGHT
      )
    );
    const maxThumbTop = Math.max(0, trackHeight - nextThumbHeight);
    const nextThumbTop = Math.round((scrollTop / maxScrollTop) * maxThumbTop);

    dimensionsRef.current = { maxThumbTop, maxScrollTop };
    setThumbHeight((prev) => (prev === nextThumbHeight ? prev : nextThumbHeight));
    setThumbTop((prev) => (prev === nextThumbTop ? prev : nextThumbTop));
  }, []);

  /* scroll 이벤트 전용 핸들러, 캐시된 maxThumbTop으로 thumbTop만 갱신*/
  const handleScroll = useCallback(() => {
    const viewport = viewportRef.current;
    const { maxThumbTop, maxScrollTop } = dimensionsRef.current;

    if (!viewport || maxScrollTop <= 1) return;

    const nextThumbTop = Math.round(
      (viewport.scrollTop / maxScrollTop) * maxThumbTop
    );

    setThumbTop((prev) => (prev === nextThumbTop ? prev : nextThumbTop));
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;

    if (!viewport) return;

    updateScrollbar();
    viewport.addEventListener('scroll', handleScroll, { passive: true });

    /* ResizeObserver 미지원 환경에서는 스크롤 이벤트 + 초기 계산만으로 동작 */
    if (typeof ResizeObserver === 'undefined') {
      return () => {
        viewport.removeEventListener('scroll', handleScroll);
      };
    }

    const resizeObserver = new ResizeObserver(updateScrollbar);

    resizeObserver.observe(viewport);

    if (content) {
      resizeObserver.observe(content);
    }

    return () => {
      viewport.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [handleScroll, updateScrollbar]);

  return (
    <div className={cn('flex min-h-0 overflow-hidden', className)} {...props}>
      {/*
        gap-x1: 콘텐츠 ↔ 스크롤바 사이 4px
        px-x4 py-x3: 박스 내부 패딩 (스크롤바까지 포함하여 오른쪽 여백 유지)
      */}
      <div className='gap-x1 px-x4 py-x3 flex min-h-0 min-w-0 flex-1 overflow-hidden'>
        <div
          ref={viewportRef}
          tabIndex={viewportProps?.tabIndex ?? 0}
          role={viewportProps?.role ?? 'region'}
          aria-label={viewportProps?.['aria-label']}
          className={cn(
            /* basis-0 + min-h-0: flex 자식이 부모 높이를 넘지 않고 스크롤 가능하게 */
            'min-h-0 flex-1 basis-0 overflow-x-hidden overflow-y-auto',
            '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          )}
        >
          <div ref={contentRef} className={contentClassName}>
            {children}
          </div>
        </div>

        {isScrollable ? (
          <div
            aria-hidden
            className={cn(
              'bg-fill-secondary-200 flex shrink-0 flex-col self-stretch rounded p-0.5',
              SCROLLBAR_WIDTH_CLASS
            )}
          >
            <div className='relative min-h-0 flex-1'>
              {/*
                top 대신 transform 사용하여 스크롤 중 레이아웃 리플로우 최소화
                absolute + inset-x-0: 트랙 p-0.5 안에서 가로 중앙 정렬
              */}
              <div
                className='bg-fill-secondary-400 absolute inset-x-0 rounded-full'
                style={{
                  height: thumbHeight,
                  transform: `translateY(${thumbTop}px)`,
                }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export { ScrollBar };
