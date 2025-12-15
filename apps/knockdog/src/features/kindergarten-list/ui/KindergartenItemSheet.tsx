import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BottomSheet, TRANSITION_DURATION_MS } from '@knockdog/ui';
import { KindergartenCard } from './KindergartenCard';
import { KindergartenDetail } from './KindergartenDetail';
import { cn } from '@knockdog/ui/lib';
import { useBookmarkToggle } from '../model/useBookmarkToggle';
import { useSearchListQuery } from '@features/kindergarten-map';

interface KindergartenItemSheetProps {
  itemId: string;
  isOpen: boolean;
  onClose: () => void;
}

const snapPoints = ['328px', 1];
type SnapPoint = number | string | null;

type SheetView = 'card' | 'detail';
const VIEW_SWITCH_BUFFER_MS = 100; // 약 6프레임 (60fps 기준)
const VIEW_SWITCH_DELAY_MS = Math.max(TRANSITION_DURATION_MS - VIEW_SWITCH_BUFFER_MS, 0);

export function KindergartenItemSheet({ itemId, isOpen, onClose }: KindergartenItemSheetProps) {
  const { searchListQueryKey, searchList, exact } = useSearchListQuery();
  const { onBookmarkClick } = useBookmarkToggle(searchListQueryKey);

  // 상위에서 내려준 아이템 스냅샷을 그대로 쓰면 북마크 토글 후에도 예전 isBookmarked를 참조하는 stale closure가 발생함
  // 해결) id만 받고 매 렌더마다 최신 쿼리 캐시(searchList/exact)에서 해당 아이템을 다시 조회
  // TODO: 더 나은 방법이 있을지 고민...
  const currentItem = useMemo(() => {
    const list = searchList.find((item) => item.id === itemId);
    if (list) return list;
    if (exact?.id === itemId) return exact;
    return null;
  }, [exact, itemId, searchList]);

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
          onClose();
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
            onClose();
          }}
          className={cn(
            'bottom-[68px] z-50 h-full',
            activeSnapPoint === snapPoints[1] && 'h-full',
            isTransitioning && 'pointer-events-none'
          )}
        >
          {currentItem ? (
            view === 'card' ? (
              <KindergartenCard {...currentItem} onBookmarkClick={onBookmarkClick} />
            ) : (
              <KindergartenDetail {...currentItem} />
            )
          ) : null}
        </BottomSheet.Body>
      </BottomSheet.Portal>
    </BottomSheet.Root>
  );
}
