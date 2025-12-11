import { useCallback, useEffect, useRef, useState } from 'react';
import { BottomSheet, TRANSITION_DURATION_MS } from '@knockdog/ui';
import { KindergartenCard } from './KindergartenCard';
import { KindergartenDetail } from './KindergartenDetail';
import { cn } from '@knockdog/ui/lib';
import type { KindergartenListItemWithMeta } from '@entities/kindergarten';

interface KindergartenItemSheetProps extends KindergartenListItemWithMeta {
  isOpen: boolean;
  close: () => void;
}

const snapPoints = ['328px', 1];
type SnapPoint = number | string | null;

type SheetView = 'card' | 'detail';
const VIEW_SWITCH_BUFFER_MS = 100; // 약 6프레임 (60fps 기준)
const VIEW_SWITCH_DELAY_MS = Math.max(TRANSITION_DURATION_MS - VIEW_SWITCH_BUFFER_MS, 0);

export function KindergartenItemSheet({ isOpen, close, ...props }: KindergartenItemSheetProps) {
  const [activeSnapPoint, setActiveSnapPoint] = useState<SnapPoint>(snapPoints[0] ?? null);
  const [view, setView] = useState<SheetView>('card');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTransitionTimer = useCallback(() => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
  }, []);

  const targetViewForSnap = useCallback((snap: SnapPoint): SheetView => {
    if (snap === 1) return 'detail';
    return 'card';
  }, []);

  const startViewTransition = useCallback(
    (targetView: SheetView) => {
      if (targetView === view) {
        clearTransitionTimer();
        setIsTransitioning(false);
        return;
      }

      setIsTransitioning(true);
      clearTransitionTimer();
      transitionTimerRef.current = setTimeout(() => {
        setView(targetView);
        setIsTransitioning(false);
        transitionTimerRef.current = null;
      }, VIEW_SWITCH_DELAY_MS);
    },
    [clearTransitionTimer, view]
  );

  const queueViewForSnap = useCallback(
    (snap: SnapPoint) => {
      if (snap === null) return;
      startViewTransition(targetViewForSnap(snap));
    },
    [startViewTransition, targetViewForSnap]
  );

  const handleSnapChange = useCallback(
    (snap: SnapPoint) => {
      setActiveSnapPoint(snap);
      queueViewForSnap(snap);
    },
    [queueViewForSnap]
  );

  // 시트가 닫힐 때 상태 초기화
  // Note: 시트가 이미 닫혀있으므로 이 상태 업데이트는 화면에 영향 X,
  // 다음에 시트가 열릴 때 올바른 초기 상태로 시작하기 위해 필요함
  useEffect(() => {
    if (!isOpen) {
      clearTransitionTimer();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveSnapPoint(snapPoints[0] ?? null);
      setView('card');
      setIsTransitioning(false);
    }
  }, [clearTransitionTimer, isOpen]);

  useEffect(() => {
    return () => {
      clearTransitionTimer();
    };
  }, [clearTransitionTimer]);

  return (
    <BottomSheet.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          close();
        }
      }}
      modal={false}
      snapPoints={snapPoints}
      activeSnapPoint={activeSnapPoint}
      setActiveSnapPoint={handleSnapChange}
      snapToSequentialPoint
    >
      <BottomSheet.Portal>
        <BottomSheet.Body
          onPointerDownOutside={(e: Event) => {
            e.preventDefault();
            close();
          }}
          className={cn(
            'bottom-[68px] z-50 h-full',
            activeSnapPoint === snapPoints[1] && 'h-full',
            isTransitioning && 'pointer-events-none'
          )}
        >
          {view === 'card' ? <KindergartenCard {...props} /> : <KindergartenDetail {...props} />}
        </BottomSheet.Body>
      </BottomSheet.Portal>
    </BottomSheet.Root>
  );
}
