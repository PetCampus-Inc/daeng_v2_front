import React, { type ComponentProps, useMemo, useRef, useState } from 'react';
import { RemoveScroll } from 'react-remove-scroll';
import { cn } from '@knockdog/ui/lib';
import { BottomSheet } from '@shared/ui/bottom-sheet';
import { useBottomSheetSnapIndex, useIsomorphicLayoutEffect } from '@shared/lib';
import { useMarkerState } from '@shared/store';

// 최소 스냅포인트: 149px(바텀시트 최소 높이) + 68px(바텀바 높이)
// 최대 스냅포인트: 화면높이 - 64px(검색 헤더바 높이) - 16px (Handle 높이)
interface KindergartenListSheetProps {
  fabSlot: React.ReactNode;
  children: React.ReactNode;
}

export function KindergartenListSheet({ fabSlot, children }: KindergartenListSheetProps) {
  const MIN_SNAP_POINT = 141;
  const snapPoints = useMemo(() => [MIN_SNAP_POINT, 0.5, 1], [MIN_SNAP_POINT]);
  const { snapIndex, setSnapIndex, isFullExtended } = useBottomSheetSnapIndex();

  const activeMarkerId = useMarkerState((state) => state.activeMarkerId);
  const isMarkerActive = !!activeMarkerId;

  const containerRef = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  const handleSnapChange = (newSnap: ComponentProps<typeof BottomSheet.Root>['activeSnapPoint']) => {
    if (newSnap == null) return;
    const index = snapPoints.findIndex((point) => point === newSnap);
    if (index !== -1) {
      setSnapIndex(index);
    }
  };

  useIsomorphicLayoutEffect(() => {
    if (containerRef.current) {
      setContainer(containerRef.current);
    }
  }, [containerRef]);

  return (
    <div
      ref={containerRef}
      className='pointer-events-none absolute bottom-0 h-[calc(100%-var(--top-bar-height)-var(--safe-area-inset-top,0px))] w-full overflow-hidden'
    >
      <BottomSheet.Root
        defaultOpen
        dismissible={false}
        modal={false}
        snapPoints={snapPoints}
        activeSnapPoint={snapPoints[snapIndex] ?? snapPoints[0]}
        setActiveSnapPoint={handleSnapChange}
        container={container}
      >
        <RemoveScroll forwardProps noIsolation>
          <BottomSheet.Body
            className={cn(
              'pointer-events-auto absolute inset-x-0 h-full max-h-[calc(100dvh-64px)] shadow-[0px_-2px_10px] shadow-black/6 focus-visible:outline-none',
              isMarkerActive && 'hidden',
              isFullExtended && 'rounded-none shadow-none'
            )}
          >
            {!isFullExtended && (
              <>
                {fabSlot}
                <BottomSheet.Handle className='mt-x3 mb-x1' />
              </>
            )}
            <BottomSheet.Title className='sr-only'>강아지 유치원 목록</BottomSheet.Title>
            {children}
          </BottomSheet.Body>
        </RemoveScroll>
      </BottomSheet.Root>
    </div>
  );
}
