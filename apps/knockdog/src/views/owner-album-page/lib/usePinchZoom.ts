'use client';

import { useCallback, useEffect, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';

const MIN_SCALE = 1;
const DOUBLE_TAP_THRESHOLD_MS = 320;
const DOUBLE_TAP_DISTANCE_PX = 40;
const TAP_MOVE_TOLERANCE_PX = 24;
/** pan 시작 전 허용 이동량 — 이하면 탭으로 취급 */
const PAN_SLOP_PX = 12;
/** 핀치 종료 시 이 비율 미만이면 1x(기본), 이상이면 cover(확장)로 스냅 */
const SNAP_RATIO = 0.5;

interface Transform {
  scale: number;
  x: number;
  y: number;
}

interface UsePinchZoomOptions {
  enabled?: boolean;
}

interface PinchSession {
  startDistance: number;
  startScale: number;
  startX: number;
  startY: number;
  focalX: number;
  focalY: number;
}

interface PanSession {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  originX: number;
  originY: number;
  isDragging: boolean;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getDistance(touchA: Touch, touchB: Touch) {
  return Math.hypot(touchA.clientX - touchB.clientX, touchA.clientY - touchB.clientY);
}

function getMidpoint(touchA: Touch, touchB: Touch) {
  return {
    x: (touchA.clientX + touchB.clientX) / 2,
    y: (touchA.clientY + touchB.clientY) / 2,
  };
}

/**
 * 1x 콘텐츠가 뷰포트(회색 배경)를 cover 할 때의 scale.
 * 확대 최대치 = 회색 영역 크기.
 */
function getCoverMaxScale(viewportW: number, viewportH: number, contentW: number, contentH: number) {
  if (contentW <= 0 || contentH <= 0 || viewportW <= 0 || viewportH <= 0) return MIN_SCALE;
  return Math.max(viewportW / contentW, viewportH / contentH, MIN_SCALE);
}

function clampTranslate(
  scale: number,
  x: number,
  y: number,
  viewportW: number,
  viewportH: number,
  contentW: number,
  contentH: number
): Transform {
  if (scale <= MIN_SCALE) return { scale: MIN_SCALE, x: 0, y: 0 };

  const scaledW = contentW * scale;
  const scaledH = contentH * scale;
  const maxX = Math.max(0, (scaledW - viewportW) / 2);
  const maxY = Math.max(0, (scaledH - viewportH) / 2);

  return {
    scale,
    x: clamp(x, -maxX, maxX),
    y: clamp(y, -maxY, maxY),
  };
}

function usePinchZoom({ enabled = true }: UsePinchZoomOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<Transform>({ scale: 1, x: 0, y: 0 });
  const maxScaleRef = useRef(MIN_SCALE);
  const contentSizeRef = useRef({ width: 0, height: 0 });
  const pinchRef = useRef<PinchSession | null>(null);
  const panRef = useRef<PanSession | null>(null);
  const isPinchingRef = useRef(false);
  const didPanRef = useRef(false);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const pointerDownRef = useRef<{ x: number; y: number } | null>(null);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return { viewportW: 0, viewportH: 0, contentW: 0, contentH: 0, maxScale: MIN_SCALE };

    const viewport = container.getBoundingClientRect();
    // scale 영향 없는 레이아웃 크기
    const contentW = content.offsetWidth;
    const contentH = content.offsetHeight;
    const maxScale = getCoverMaxScale(viewport.width, viewport.height, contentW, contentH);

    contentSizeRef.current = { width: contentW, height: contentH };
    maxScaleRef.current = maxScale;

    return {
      viewportW: viewport.width,
      viewportH: viewport.height,
      contentW,
      contentH,
      maxScale,
    };
  }, []);

  const applyTransform = useCallback((next: Transform, withTransition = false) => {
    const node = contentRef.current;
    if (!node) return;

    transformRef.current = next;
    node.style.transition = withTransition ? 'transform 200ms ease-out' : 'none';
    node.style.transform = `translate3d(${next.x}px, ${next.y}px, 0) scale(${next.scale})`;
  }, []);

  const snapToNearest = useCallback(() => {
    const { viewportW, viewportH, contentW, contentH, maxScale } = measure();
    const { scale } = transformRef.current;
    const threshold = MIN_SCALE + (maxScale - MIN_SCALE) * SNAP_RATIO;

    if (scale < threshold || maxScale <= MIN_SCALE) {
      applyTransform({ scale: MIN_SCALE, x: 0, y: 0 }, true);
      return;
    }

    applyTransform(
      clampTranslate(maxScale, transformRef.current.x, transformRef.current.y, viewportW, viewportH, contentW, contentH),
      true
    );
  }, [applyTransform, measure]);

  const reset = useCallback(() => {
    pinchRef.current = null;
    panRef.current = null;
    isPinchingRef.current = false;
    didPanRef.current = false;
    lastTapRef.current = null;
    pointerDownRef.current = null;
    applyTransform({ scale: 1, x: 0, y: 0 });
  }, [applyTransform]);

  const setScaleAtPoint = useCallback(
    (nextScale: number, clientX: number, clientY: number) => {
      const container = containerRef.current;
      if (!container) return;

      const { viewportW, viewportH, contentW, contentH, maxScale } = measure();
      const rect = container.getBoundingClientRect();
      const { scale, x, y } = transformRef.current;
      const clampedScale = clamp(nextScale, MIN_SCALE, maxScale);

      if (clampedScale <= MIN_SCALE) {
        applyTransform({ scale: MIN_SCALE, x: 0, y: 0 }, true);
        return;
      }

      const focalX = clientX - rect.left - rect.width / 2;
      const focalY = clientY - rect.top - rect.height / 2;
      const ratio = clampedScale / scale;

      applyTransform(
        clampTranslate(
          clampedScale,
          focalX - (focalX - x) * ratio,
          focalY - (focalY - y) * ratio,
          viewportW,
          viewportH,
          contentW,
          contentH
        ),
        true
      );
    },
    [applyTransform, measure]
  );

  const handleDoubleTapAt = useCallback(
    (clientX: number, clientY: number) => {
      lastTapRef.current = null;

      // 확대 상태 → 줌아웃, 기본 상태 → 줌인
      if (transformRef.current.scale > MIN_SCALE + 0.01) {
        applyTransform({ scale: MIN_SCALE, x: 0, y: 0 }, true);
        return;
      }

      const { maxScale } = measure();
      if (maxScale <= MIN_SCALE) return;
      setScaleAtPoint(maxScale, clientX, clientY);
    },
    [applyTransform, measure, setScaleAtPoint]
  );

  const registerTap = useCallback(
    (clientX: number, clientY: number) => {
      if (isPinchingRef.current || didPanRef.current) {
        didPanRef.current = false;
        return;
      }

      const now = Date.now();
      const lastTap = lastTapRef.current;

      if (
        lastTap &&
        now - lastTap.time <= DOUBLE_TAP_THRESHOLD_MS &&
        Math.hypot(clientX - lastTap.x, clientY - lastTap.y) <= DOUBLE_TAP_DISTANCE_PX
      ) {
        handleDoubleTapAt(clientX, clientY);
        return;
      }

      lastTapRef.current = { time: now, x: clientX, y: clientY };
    },
    [handleDoubleTapAt]
  );

  useEffect(() => {
    if (!enabled) {
      reset();
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      measure();
      const { scale, x, y } = transformRef.current;
      if (scale <= MIN_SCALE) return;

      const { viewportW, viewportH, contentW, contentH, maxScale } = measure();
      applyTransform(clampTranslate(Math.min(scale, maxScale), x, y, viewportW, viewportH, contentW, contentH));
    });
    resizeObserver.observe(container);

    const handleTouchStart = (event: TouchEvent) => {
      measure();

      if (event.touches.length >= 2) {
        const [touchA, touchB] = [event.touches[0], event.touches[1]];
        if (!touchA || !touchB) return;

        event.preventDefault();
        isPinchingRef.current = true;
        panRef.current = null;
        lastTapRef.current = null;
        pointerDownRef.current = null;
        didPanRef.current = false;

        const content = contentRef.current;
        if (content) content.style.transition = 'none';

        const rect = container.getBoundingClientRect();
        const mid = getMidpoint(touchA, touchB);
        const { scale, x, y } = transformRef.current;

        pinchRef.current = {
          startDistance: Math.max(getDistance(touchA, touchB), 1),
          startScale: scale,
          startX: x,
          startY: y,
          focalX: mid.x - rect.left - rect.width / 2,
          focalY: mid.y - rect.top - rect.height / 2,
        };
        return;
      }

      if (event.touches.length === 1 && transformRef.current.scale > MIN_SCALE) {
        const touch = event.touches[0];
        if (!touch) return;

        didPanRef.current = false;
        panRef.current = {
          pointerId: touch.identifier,
          startClientX: touch.clientX,
          startClientY: touch.clientY,
          originX: transformRef.current.x,
          originY: transformRef.current.y,
          isDragging: false,
        };
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length >= 2 && pinchRef.current) {
        const [touchA, touchB] = [event.touches[0], event.touches[1]];
        if (!touchA || !touchB) return;

        event.preventDefault();

        const { viewportW, viewportH, contentW, contentH, maxScale } = measure();
        const session = pinchRef.current;
        const distance = getDistance(touchA, touchB);
        const nextScale = clamp((distance / session.startDistance) * session.startScale, MIN_SCALE, maxScale);
        const ratio = nextScale / session.startScale;

        applyTransform(
          clampTranslate(
            nextScale,
            session.focalX - (session.focalX - session.startX) * ratio,
            session.focalY - (session.focalY - session.startY) * ratio,
            viewportW,
            viewportH,
            contentW,
            contentH
          )
        );
        return;
      }

      if (event.touches.length === 1 && panRef.current && transformRef.current.scale > MIN_SCALE) {
        const touch = event.touches[0];
        if (!touch || touch.identifier !== panRef.current.pointerId) return;

        const dx = touch.clientX - panRef.current.startClientX;
        const dy = touch.clientY - panRef.current.startClientY;

        // slop 이하면 탭으로 유지 (더블탭 줌아웃 가능)
        if (!panRef.current.isDragging) {
          if (Math.hypot(dx, dy) < PAN_SLOP_PX) return;
          panRef.current.isDragging = true;
          didPanRef.current = true;
          lastTapRef.current = null;
        }

        event.preventDefault();

        const { viewportW, viewportH, contentW, contentH } = measure();

        applyTransform(
          clampTranslate(
            transformRef.current.scale,
            panRef.current.originX + dx,
            panRef.current.originY + dy,
            viewportW,
            viewportH,
            contentW,
            contentH
          )
        );
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const wasPinching = isPinchingRef.current;
      const changedTouch = event.changedTouches[0];

      if (event.touches.length < 2 && isPinchingRef.current) {
        isPinchingRef.current = false;
        pinchRef.current = null;
      }

      if (event.touches.length === 0) {
        const hadPan = didPanRef.current || Boolean(panRef.current?.isDragging);
        panRef.current = null;

        if (wasPinching) {
          snapToNearest();
          didPanRef.current = false;
          return;
        }

        if (!hadPan && changedTouch) {
          registerTap(changedTouch.clientX, changedTouch.clientY);
        } else {
          didPanRef.current = false;
        }

        if (transformRef.current.scale <= MIN_SCALE + 0.01) {
          applyTransform({ scale: MIN_SCALE, x: 0, y: 0 });
        }
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);

    measure();

    return () => {
      resizeObserver.disconnect();
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [applyTransform, enabled, measure, registerTap, reset, snapToNearest]);

  const shouldBlockSwiper = () => isPinchingRef.current || transformRef.current.scale > MIN_SCALE;

  const handlePointerDownCapture = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabled) return;
    // 터치는 touchend에서 더블탭 처리. 마우스는 pointer로 처리.
    if (event.pointerType === 'touch') {
      if (shouldBlockSwiper()) event.stopPropagation();
      return;
    }
    pointerDownRef.current = { x: event.clientX, y: event.clientY };
    if (shouldBlockSwiper()) event.stopPropagation();
  };

  const handlePointerMoveCapture = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabled) return;
    if (shouldBlockSwiper()) event.stopPropagation();
  };

  const handlePointerUpCapture = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabled) return;
    if (shouldBlockSwiper()) event.stopPropagation();
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabled) return;
    if (event.pointerType === 'touch') return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (isPinchingRef.current) return;

    const pointerDown = pointerDownRef.current;
    pointerDownRef.current = null;
    if (!pointerDown) return;

    const moved = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
    if (moved > TAP_MOVE_TOLERANCE_PX) {
      lastTapRef.current = null;
      return;
    }

    registerTap(event.clientX, event.clientY);
  };

  return {
    reset,
    getContainerProps: () => ({
      ref: containerRef,
      onPointerDownCapture: handlePointerDownCapture,
      onPointerMoveCapture: handlePointerMoveCapture,
      onPointerUpCapture: handlePointerUpCapture,
      onPointerCancelCapture: handlePointerUpCapture,
      onPointerUp: handlePointerUp,
    }),
    getContentProps: () =>
      ({
        ref: contentRef,
        style: {
          transform: `translate3d(${transformRef.current.x}px, ${transformRef.current.y}px, 0) scale(${transformRef.current.scale})`,
          transformOrigin: 'center center',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        } satisfies CSSProperties,
      }) as const,
  };
}

export { usePinchZoom };
