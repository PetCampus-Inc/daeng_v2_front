import React from 'react';
import { set, isVertical } from './helpers';
import { TRANSITIONS, VELOCITY_THRESHOLD } from './constants';
import { useControllableState } from './use-controllable-state';
import { ContentSnap, DrawerDirection, SnapPoint } from './types';

function isContentSnap(snapPoint: SnapPoint): snapPoint is ContentSnap {
  return typeof snapPoint === 'object' && snapPoint !== null && 'type' in snapPoint && snapPoint.type === 'content';
}

// SnapPoint 비교를 위해 content 타입은 값 기반으로 비교한다.
function isSameSnapPoint(a: SnapPoint | null | undefined, b: SnapPoint | null | undefined) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (isContentSnap(a) && isContentSnap(b)) {
    return a.min === b.min && a.max === b.max;
  }
  return false;
}

export function useSnapPoints({
  activeSnapPointProp,
  setActiveSnapPointProp,
  snapPoints,
  drawerRef,
  overlayRef,
  fadeFromIndex,
  onSnapPointChange,
  direction = 'bottom',
  container,
  snapToSequentialPoint,
  isOpen,
  // "isDragging" here means real drag movement, not pointer-down state.
  // This keeps dynamic content measurement stable on taps/clicks.
  isDragging,
  shouldAnimate = true,
  onSnapPointsResolved,
}: {
  activeSnapPointProp?: SnapPoint | null;
  setActiveSnapPointProp?(snapPoint: SnapPoint | null): void;
  snapPoints?: SnapPoint[];
  fadeFromIndex?: number;
  drawerRef: React.RefObject<HTMLDivElement>;
  overlayRef: React.RefObject<HTMLDivElement>;
  onSnapPointChange(activeSnapPointIndex: number): void;
  direction?: DrawerDirection;
  container?: HTMLElement | null | undefined;
  snapToSequentialPoint?: boolean;
  isOpen: boolean;
  isDragging: boolean;
  shouldAnimate?: boolean;
  onSnapPointsResolved?: (resolved: number[]) => void;
}) {
  const [activeSnapPoint, setActiveSnapPoint] = useControllableState<SnapPoint | null>({
    prop: activeSnapPointProp,
    defaultProp: snapPoints?.[0],
    onChange: setActiveSnapPointProp,
  });

  /** content snap 계산에 사용할 drawer(또는 container) 크기 측정값 */
  const [measuredDrawerSize, setMeasuredDrawerSize] = React.useState<number>(0);
  /** 마지막 반영된 측정값(measuredDrawerSize)을 저장하는 ref */
  const measuredDrawerSizeRef = React.useRef(0);
  /** open 애니메이션 중 측정된 값(measuredDrawerSize)을 임시 저장하는 ref */
  const pendingMeasuredSizeRef = React.useRef<number | null>(null);
  /** ResizeObserver 측정을 rAF로 배치하기 위한 프레임 id */
  const measurementFrameRef = React.useRef<number | null>(null);
  /** 활성 content snap에서 사용하는 ResizeObserver 인스턴스 */
  const observerRef = React.useRef<ResizeObserver | null>(null);
  /** open 애니메이션 종료 시점 추적을 위한 타이머 */
  const openAnimationTimeoutRef = React.useRef<number | null>(null);
  /** open 애니메이션 진행 여부 */
  const [isOpenAnimating, setIsOpenAnimating] = React.useState(false);

  const [windowDimensions, setWindowDimensions] = React.useState(
    typeof window !== 'undefined'
      ? {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
        }
      : undefined,
  );

  React.useEffect(() => {
    // window 리사이즈 시 현재 viewport 정보 갱신
    function onResize() {
      setWindowDimensions({
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
      });
    }
    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, []);

  React.useEffect(() => {
    if (!isOpen || !shouldAnimate) {
      setIsOpenAnimating(false);
      if (openAnimationTimeoutRef.current !== null) {
        window.clearTimeout(openAnimationTimeoutRef.current);
      }
      return;
    }

    // open 애니메이션 중 측정 반영 지연
    setIsOpenAnimating(true);
    if (openAnimationTimeoutRef.current !== null) {
      window.clearTimeout(openAnimationTimeoutRef.current);
    }
    openAnimationTimeoutRef.current = window.setTimeout(() => {
      setIsOpenAnimating(false);
    }, TRANSITIONS.DURATION * 1000);

    return () => {
      if (openAnimationTimeoutRef.current !== null) {
        window.clearTimeout(openAnimationTimeoutRef.current);
      }
    };
  }, [isOpen, shouldAnimate]);

  const hasContentSnap = React.useMemo(
    () => snapPoints?.some((snapPoint) => isContentSnap(snapPoint)) ?? false,
    [snapPoints],
  );

  const isLastSnapPoint = React.useMemo(
    () => (snapPoints ? isSameSnapPoint(activeSnapPoint, snapPoints[snapPoints.length - 1]) : null),
    [snapPoints, activeSnapPoint],
  );

  const activeSnapPointIndex = React.useMemo(
    () => snapPoints?.findIndex((snapPoint) => isSameSnapPoint(snapPoint, activeSnapPoint)) ?? null,
    [snapPoints, activeSnapPoint],
  );

  const shouldFade =
    (snapPoints &&
      snapPoints.length > 0 &&
      (fadeFromIndex || fadeFromIndex === 0) &&
      !Number.isNaN(fadeFromIndex) &&
      isSameSnapPoint(snapPoints[fadeFromIndex], activeSnapPoint)) ||
    !snapPoints;

  // 오픈 애니메이션이 끝난 뒤 대기 중인 측정값을 반영
  React.useEffect(() => {
    if (isOpenAnimating) return;
    if (pendingMeasuredSizeRef.current === null) return;

    const nextValue = pendingMeasuredSizeRef.current;
    pendingMeasuredSizeRef.current = null;
    if (measuredDrawerSizeRef.current === nextValue) return;
    measuredDrawerSizeRef.current = nextValue;
    setMeasuredDrawerSize(nextValue);
  }, [isOpenAnimating]);

  // 활성 content 스냅일 때만 ResizeObserver로 측정값 갱신
  React.useEffect(() => {
    const shouldObserve =
      isOpen &&
      hasContentSnap &&
      !!activeSnapPoint &&
      isContentSnap(activeSnapPoint) &&
      !isDragging &&
      drawerRef.current;
    if (!shouldObserve) {
      observerRef.current?.disconnect();
      observerRef.current = null;
      if (measurementFrameRef.current !== null) {
        window.cancelAnimationFrame(measurementFrameRef.current);
        measurementFrameRef.current = null;
      }
      return;
    }

    const element = drawerRef.current;

    // 현재 drawer 크기를 측정하고 상태에 반영
    const measure = () => {
      const nextValue = isVertical(direction)
        ? element.getBoundingClientRect().height
        : element.getBoundingClientRect().width;

      if (isOpenAnimating) {
        pendingMeasuredSizeRef.current = nextValue;
        return;
      }

      if (measuredDrawerSizeRef.current === nextValue) return;
      measuredDrawerSizeRef.current = nextValue;
      setMeasuredDrawerSize(nextValue);
    };

    // 활성 content snap에서만 ResizeObserver로 크기를 감지
    observerRef.current = new ResizeObserver(() => {
      if (measurementFrameRef.current !== null) return;
      measurementFrameRef.current = window.requestAnimationFrame(() => {
        measurementFrameRef.current = null;
        measure();
      });
    });
    observerRef.current.observe(element);
    measure();

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      if (measurementFrameRef.current !== null) {
        window.cancelAnimationFrame(measurementFrameRef.current);
        measurementFrameRef.current = null;
      }
    };
  }, [activeSnapPoint, drawerRef, direction, hasContentSnap, isDragging, isOpen, isOpenAnimating]);

  // SnapPoint를 실제 px 오프셋으로 변환
  const snapPointsOffset = React.useMemo(() => {
    const containerSize = container
      ? { width: container.getBoundingClientRect().width, height: container.getBoundingClientRect().height }
      : typeof window !== 'undefined'
      ? { width: window.innerWidth, height: window.innerHeight }
      : { width: 0, height: 0 };
    const axisSize = isVertical(direction) ? containerSize.height : containerSize.width;

    const resolveLength = (length: number | string) => {
      if (typeof length === 'string') {
        return Number.parseInt(length, 10);
      }

      if (length >= 0 && length <= 1) {
        return axisSize * length;
      }

      return length;
    };

    // SnapPoint를 실제 drawer 크기(px)로 해석
    const resolveSnapPointSize = (snapPoint: SnapPoint, index: number) => {
      if (typeof snapPoint === 'function') {
        return resolveLength(
          snapPoint({
            viewportHeight: containerSize.height,
            measuredDrawerHeight: measuredDrawerSize,
          }),
        );
      }

      if (!isContentSnap(snapPoint)) {
        return resolveLength(snapPoint);
      }

      const minSize = resolveLength(snapPoint.min);
      const maxSize = snapPoint.max !== undefined ? resolveLength(snapPoint.max) : undefined;
      const isActiveContentSnap = index === activeSnapPointIndex;
      const shouldUseMeasured = isOpen && !isDragging && !isOpenAnimating && isActiveContentSnap;
      const measuredSize = shouldUseMeasured && measuredDrawerSize > 0 ? measuredDrawerSize : 0;
      let size = measuredSize > 0 ? measuredSize : minSize;

      size = Math.max(size, minSize);
      if (maxSize !== undefined) {
        size = Math.min(size, maxSize);
      }

      return size;
    };

    const resolvedSizes = snapPoints?.map((snapPoint, index) => resolveSnapPointSize(snapPoint, index)) ?? [];
    const clampedSizes = resolvedSizes.map((size, index) => {
      const snapPoint = snapPoints?.[index];
      if (!snapPoint || !isContentSnap(snapPoint)) return size;

      // content snap이 이웃 snap을 넘지 않도록 clamp
      let clamped = size;
      const prevSize = resolvedSizes[index - 1];
      const nextSize = resolvedSizes[index + 1];
      if (typeof prevSize === 'number') {
        clamped = Math.max(clamped, prevSize);
      }
      if (typeof nextSize === 'number') {
        clamped = Math.min(clamped, nextSize);
      }

      return clamped;
    });

    return clampedSizes.map((size) => {
      if (isVertical(direction)) {
        return direction === 'bottom' ? axisSize - size : -axisSize + size;
      }

      return direction === 'right' ? axisSize - size : -axisSize + size;
    });
  }, [
    activeSnapPointIndex,
    container,
    direction,
    isDragging,
    isOpen,
    isOpenAnimating,
    measuredDrawerSize,
    snapPoints,
    windowDimensions,
  ]);

  const activeSnapPointOffset = React.useMemo(
    () => (activeSnapPointIndex !== null ? snapPointsOffset?.[activeSnapPointIndex] : null),
    [snapPointsOffset, activeSnapPointIndex],
  );

  React.useEffect(() => {
    if (!snapPointsOffset || !onSnapPointsResolved) return;
    onSnapPointsResolved(snapPointsOffset);
  }, [onSnapPointsResolved, snapPointsOffset]);

  // 지정된 스냅 포인트로 이동하고 오버레이 상태 동기화
  const snapToPoint = React.useCallback(
    (dimension: number) => {
      const newSnapPointIndex = snapPointsOffset?.findIndex((snapPointDim) => snapPointDim === dimension) ?? null;
      onSnapPointChange(newSnapPointIndex);

      set(drawerRef.current, {
        transition: `transform ${TRANSITIONS.DURATION}s cubic-bezier(${TRANSITIONS.EASE.join(',')})`,
        transform: isVertical(direction) ? `translate3d(0, ${dimension}px, 0)` : `translate3d(${dimension}px, 0, 0)`,
      });

      if (
        snapPointsOffset &&
        newSnapPointIndex !== snapPointsOffset.length - 1 &&
        fadeFromIndex !== undefined &&
        newSnapPointIndex !== fadeFromIndex &&
        newSnapPointIndex < fadeFromIndex
      ) {
        set(overlayRef.current, {
          transition: `opacity ${TRANSITIONS.DURATION}s cubic-bezier(${TRANSITIONS.EASE.join(',')})`,
          opacity: '0',
        });
      } else {
        set(overlayRef.current, {
          transition: `opacity ${TRANSITIONS.DURATION}s cubic-bezier(${TRANSITIONS.EASE.join(',')})`,
          opacity: '1',
        });
      }

      setActiveSnapPoint(snapPoints?.[Math.max(newSnapPointIndex, 0)]);
    },
    [drawerRef.current, direction, fadeFromIndex, overlayRef, setActiveSnapPoint, snapPoints, snapPointsOffset],
  );

  // activeSnapPoint가 바뀌면 드래그 중이 아닐 때 위치 맞추기
  React.useEffect(() => {
    if (isDragging) return;
    if (activeSnapPoint || activeSnapPointProp) {
      const newIndex =
        snapPoints?.findIndex(
          (snapPoint) => isSameSnapPoint(snapPoint, activeSnapPointProp) || isSameSnapPoint(snapPoint, activeSnapPoint),
        ) ?? -1;
      if (snapPointsOffset && newIndex !== -1 && typeof snapPointsOffset[newIndex] === 'number') {
        snapToPoint(snapPointsOffset[newIndex] as number);
      }
    }
  }, [activeSnapPoint, activeSnapPointProp, isDragging, snapPoints, snapPointsOffset, snapToPoint]);

  // 드래그 종료 시 velocity와 이동 거리를 기준으로 스냅 결정
  function onRelease({
    draggedDistance,
    closeDrawer,
    velocity,
    dismissible,
  }: {
    draggedDistance: number;
    closeDrawer: () => void;
    velocity: number;
    dismissible: boolean;
  }) {
    if (fadeFromIndex === undefined) return;

    const currentPosition =
      direction === 'bottom' || direction === 'right'
        ? (activeSnapPointOffset ?? 0) - draggedDistance
        : (activeSnapPointOffset ?? 0) + draggedDistance;
    const isOverlaySnapPoint = activeSnapPointIndex === fadeFromIndex - 1;
    const isFirst = activeSnapPointIndex === 0;
    const hasDraggedUp = draggedDistance > 0;

    if (isOverlaySnapPoint) {
      set(overlayRef.current, {
        transition: `opacity ${TRANSITIONS.DURATION}s cubic-bezier(${TRANSITIONS.EASE.join(',')})`,
      });
    }

    if (!snapToSequentialPoint && velocity > 2 && !hasDraggedUp) {
      if (dismissible) closeDrawer();
      else snapToPoint(snapPointsOffset[0]); // snap to initial point
      return;
    }

    if (!snapToSequentialPoint && velocity > 2 && hasDraggedUp && snapPointsOffset && snapPoints) {
      snapToPoint(snapPointsOffset[snapPoints.length - 1] as number);
      return;
    }

    // Find the closest snap point to the current position
    const closestSnapPoint = snapPointsOffset?.reduce((prev, curr) => {
      if (typeof prev !== 'number' || typeof curr !== 'number') return prev;

      return Math.abs(curr - currentPosition) < Math.abs(prev - currentPosition) ? curr : prev;
    });

    const dim = isVertical(direction) ? window.innerHeight : window.innerWidth;
    if (velocity > VELOCITY_THRESHOLD && Math.abs(draggedDistance) < dim * 0.4) {
      const dragDirection = hasDraggedUp ? 1 : -1; // 1 = up, -1 = down

      // Don't do anything if we swipe upwards while being on the last snap point
      if (dragDirection > 0 && isLastSnapPoint && snapPoints) {
        snapToPoint(snapPointsOffset[snapPoints.length - 1]);
        return;
      }

      if (isFirst && dragDirection < 0 && dismissible) {
        closeDrawer();
      }

      if (activeSnapPointIndex === null) return;

      snapToPoint(snapPointsOffset[activeSnapPointIndex + dragDirection]);
      return;
    }

    snapToPoint(closestSnapPoint);
  }

  // 드래그 중 이동값에 맞게 transform 적용
  function onDrag({ draggedDistance }: { draggedDistance: number }) {
    if (activeSnapPointOffset === null) return;
    const newValue =
      direction === 'bottom' || direction === 'right'
        ? activeSnapPointOffset - draggedDistance
        : activeSnapPointOffset + draggedDistance;

    // Don't do anything if we exceed the last(biggest) snap point
    if ((direction === 'bottom' || direction === 'right') && newValue < snapPointsOffset[snapPointsOffset.length - 1]) {
      return;
    }
    if ((direction === 'top' || direction === 'left') && newValue > snapPointsOffset[snapPointsOffset.length - 1]) {
      return;
    }

    set(drawerRef.current, {
      transform: isVertical(direction) ? `translate3d(0, ${newValue}px, 0)` : `translate3d(${newValue}px, 0, 0)`,
    });
  }

  function getPercentageDragged(absDraggedDistance: number, isDraggingDown: boolean) {
    if (!snapPoints || typeof activeSnapPointIndex !== 'number' || !snapPointsOffset || fadeFromIndex === undefined)
      return null;

    // If this is true we are dragging to a snap point that is supposed to have an overlay
    const isOverlaySnapPoint = activeSnapPointIndex === fadeFromIndex - 1;
    const isOverlaySnapPointOrHigher = activeSnapPointIndex >= fadeFromIndex;

    if (isOverlaySnapPointOrHigher && isDraggingDown) {
      return 0;
    }

    // Don't animate, but still use this one if we are dragging away from the overlaySnapPoint
    if (isOverlaySnapPoint && !isDraggingDown) return 1;
    if (!shouldFade && !isOverlaySnapPoint) return null;

    // Either fadeFrom index or the one before
    const targetSnapPointIndex = isOverlaySnapPoint ? activeSnapPointIndex + 1 : activeSnapPointIndex - 1;

    // Get the distance from overlaySnapPoint to the one before or vice-versa to calculate the opacity percentage accordingly
    const snapPointDistance = isOverlaySnapPoint
      ? snapPointsOffset[targetSnapPointIndex] - snapPointsOffset[targetSnapPointIndex - 1]
      : snapPointsOffset[targetSnapPointIndex + 1] - snapPointsOffset[targetSnapPointIndex];

    const percentageDragged = absDraggedDistance / Math.abs(snapPointDistance);

    if (isOverlaySnapPoint) {
      return 1 - percentageDragged;
    } else {
      return percentageDragged;
    }
  }

  return {
    isLastSnapPoint,
    activeSnapPoint,
    shouldFade,
    getPercentageDragged,
    setActiveSnapPoint,
    activeSnapPointIndex,
    onRelease,
    onDrag,
    snapPointsOffset,
  };
}
