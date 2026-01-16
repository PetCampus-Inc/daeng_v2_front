import React from 'react';
import { set, isVertical } from './helpers';
import { TRANSITIONS, VELOCITY_THRESHOLD } from './constants';
import { useControllableState } from './use-controllable-state';
import { DrawerDirection, SnapPoint, SnapContext } from './types';

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
  onSnapPointsResolved?: (resolved: number[]) => void;
}) {
  const [activeSnapPoint, setActiveSnapPoint] = useControllableState<SnapPoint | null>({
    prop: activeSnapPointProp,
    defaultProp: snapPoints?.[0],
    onChange: setActiveSnapPointProp,
  });

  const [measuredDrawerHeight, setMeasuredDrawerHeight] = React.useState(0);

  const activeSnapPointRef = React.useRef(activeSnapPoint);

  React.useEffect(() => {
    activeSnapPointRef.current = activeSnapPoint;
  }, [activeSnapPoint]);

  const hasContentSnap = React.useMemo(
    () => snapPoints?.some((s) => typeof s === 'object' && s !== null && s.type === 'content') ?? false,
    [snapPoints],
  );
  const isActiveContentSnap = React.useMemo(
    () => typeof activeSnapPoint === 'object' && activeSnapPoint !== null && activeSnapPoint.type === 'content',
    [activeSnapPoint],
  );

  React.useEffect(() => {
    if (!hasContentSnap) return;

    let rafId: number | null = null;
    let observer: ResizeObserver | null = null;

    const startObserving = () => {
      if (!drawerRef.current) {
        rafId = window.requestAnimationFrame(startObserving);
        return;
      }

      // Measure drawer content height so content-based snap points can resolve reliably.
      // We always keep the latest measurement to avoid stale values when switching snap points.
      observer = new ResizeObserver((entries) => {
        if (!isActiveContentSnap) return;
        for (const entry of entries) {
          const item = entry.borderBoxSize?.[0];
          const height = item ? item.blockSize : entry.contentRect.height;
          setMeasuredDrawerHeight(height);
        }
      });

      observer.observe(drawerRef.current);
    };

    startObserving();

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      observer?.disconnect();
    };
  }, [drawerRef, hasContentSnap, isActiveContentSnap, snapPoints]);

  React.useEffect(() => {
    if (!isActiveContentSnap || !drawerRef.current) return;
    const rect = drawerRef.current.getBoundingClientRect();
    if (rect.height > 0) {
      setMeasuredDrawerHeight(rect.height);
    }
  }, [isActiveContentSnap]);

  const [windowDimensions, setWindowDimensions] = React.useState(
    typeof window !== 'undefined'
      ? {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
        }
      : undefined,
  );

  React.useEffect(() => {
    function onResize() {
      setWindowDimensions({
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
      });
    }
    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isLastSnapPoint = React.useMemo(
    () => activeSnapPoint === snapPoints?.[snapPoints.length - 1] || null,
    [snapPoints, activeSnapPoint],
  );

  const activeSnapPointIndex = React.useMemo(() => {
    if (!snapPoints || snapPoints.length === 0) return null;
    const index = snapPoints.findIndex((snapPoint) => snapPoint === activeSnapPoint);
    return index >= 0 ? index : null;
  }, [snapPoints, activeSnapPoint]);

  React.useEffect(() => {
    if (!snapPoints || snapPoints.length === 0) return;
    if (activeSnapPointIndex !== null) return;
    if (activeSnapPoint == null) return;

    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Vaul:Snap] activeSnapPoint is not in snapPoints. Resetting to first snap point.', {
        activeSnapPoint,
        snapPoints,
      });
    }

    setActiveSnapPoint(snapPoints[0] ?? null);
  }, [activeSnapPointIndex, activeSnapPoint, setActiveSnapPoint, snapPoints]);

  const shouldFade =
    (snapPoints &&
      snapPoints.length > 0 &&
      (fadeFromIndex || fadeFromIndex === 0) &&
      !Number.isNaN(fadeFromIndex) &&
      snapPoints[fadeFromIndex] === activeSnapPoint) ||
    !snapPoints;

  const snapPointsOffset = React.useMemo(() => {
    const containerSize = container
      ? { width: container.getBoundingClientRect().width, height: container.getBoundingClientRect().height }
      : typeof window !== 'undefined'
      ? { width: window.innerWidth, height: window.innerHeight }
      : { width: 0, height: 0 };

    const ctx: SnapContext = {
      viewportHeight: containerSize.height,
      measuredDrawerHeight,
    };

    const resolve = (snapPoint: SnapPoint, axis: 'x' | 'y'): number => {
      const size = axis === 'y' ? containerSize.height : containerSize.width;
      if (typeof snapPoint === 'number') {
        // 0 to 1 is fraction, > 1 is pixels
        return snapPoint <= 1 ? snapPoint * size : snapPoint;
      }

      if (typeof snapPoint === 'string') {
        if (snapPoint.endsWith('%')) {
          return (parseFloat(snapPoint) / 100) * size;
        }
        return parseInt(snapPoint, 10);
      }

      if (typeof snapPoint === 'function') {
        return snapPoint(ctx);
      }

      if (typeof snapPoint === 'object' && snapPoint !== null && snapPoint.type === 'content') {
        const axis: 'x' | 'y' = isVertical(direction) ? 'y' : 'x';
        let size = isVertical(direction) ? measuredDrawerHeight : containerSize.width;
        if (size <= 0 && snapPoint.min !== undefined) {
          size = resolve(snapPoint.min as SnapPoint, axis);
        }
        if (snapPoint.min !== undefined) {
          size = Math.max(size, resolve(snapPoint.min as SnapPoint, axis));
        }
        if (snapPoint.max !== undefined) {
          size = Math.min(size, resolve(snapPoint.max as SnapPoint, axis));
        }
        return size;
      }

      return 0;
    };

    const offsets =
      snapPoints?.map((snapPoint) => {
        const heightOrWidth = resolve(snapPoint, isVertical(direction) ? 'y' : 'x');

        if (isVertical(direction)) {
          if (windowDimensions) {
            return direction === 'bottom'
              ? containerSize.height - heightOrWidth
              : -containerSize.height + heightOrWidth;
          }
          return heightOrWidth;
        }
        if (windowDimensions) {
          return direction === 'right' ? containerSize.width - heightOrWidth : -containerSize.width + heightOrWidth;
        }
        return heightOrWidth;
      }) ?? [];

    return offsets;
  }, [snapPoints, windowDimensions, container, measuredDrawerHeight, hasContentSnap, direction]);

  React.useEffect(() => {
    if (!onSnapPointsResolved) return;
    onSnapPointsResolved(snapPointsOffset);
  }, [snapPointsOffset, onSnapPointsResolved]);

  const activeSnapPointOffset = React.useMemo(
    () => (activeSnapPointIndex !== null ? snapPointsOffset?.[activeSnapPointIndex] : null),
    [snapPointsOffset, activeSnapPointIndex],
  );

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
    [drawerRef.current, snapPoints, snapPointsOffset, fadeFromIndex, overlayRef, setActiveSnapPoint],
  );

  React.useEffect(() => {
    if (activeSnapPointIndex === null) return;
    const offset = snapPointsOffset?.[activeSnapPointIndex];
    if (typeof offset === 'number') {
      snapToPoint(offset);
    }
  }, [activeSnapPointIndex, snapPointsOffset, snapToPoint]);

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
