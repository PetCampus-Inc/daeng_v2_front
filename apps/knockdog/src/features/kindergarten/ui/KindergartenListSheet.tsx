import React, { useRef, useState } from 'react';
import { RemoveScroll } from 'react-remove-scroll';
import { BottomSheet } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import { KindergartenList } from './KindergartenList';

import { BOTTOM_BAR_HEIGHT } from '@shared/constants';
import { useBottomSheetSnapIndex, useIsomorphicLayoutEffect } from '@shared/lib';
import { useMarkerState } from '@shared/store';

// 최소 스냅포인트: 149px(바텀시트 최소 높이) + 68px(바텀바 높이)
// 최대 스냅포인트: 화면높이 - 72px(검색바 높이) - 8px(여백)
const MIN_SNAP_POINT = BOTTOM_BAR_HEIGHT + 157;
const MAX_SNAP_POINT_OFFSET = 72 - 8;

export function KindergartenListSheet({ fabSlot }: { fabSlot: React.ReactNode }) {
  const snapPoints = [`${MIN_SNAP_POINT}px`, 0.5, 1];

  const { snapIndex, setSnapIndex, isFullExtended } = useBottomSheetSnapIndex();

  const activeMarkerId = useMarkerState((state) => state.activeMarkerId);
  const isMarkerActive = !!activeMarkerId;

  const containerRef = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  const activeSnapPoint = snapPoints[snapIndex] ?? snapPoints[0];

  const handleSnapChange = (newSnap: number | string | null) => {
    const index = snapPoints.findIndex((point) => point === newSnap);
    if (index !== -1) {
      setSnapIndex(index as 0 | 1 | 2);
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
      className='pointer-events-none absolute bottom-0 w-full'
      style={{
        height: `calc(100vh - ${MAX_SNAP_POINT_OFFSET}px)`,
      }}
    >
      <BottomSheet.Root
        defaultOpen
        dismissible={false}
        modal={false}
        snapPoints={snapPoints}
        activeSnapPoint={activeSnapPoint}
        setActiveSnapPoint={handleSnapChange}
        container={container}
      >
        <RemoveScroll forwardProps noIsolation>
          <BottomSheet.Body
            className={cn(
              'shadow-black/6 absolute inset-x-0 z-50 h-full shadow-[0px_-2px_10px] focus-visible:outline-none',
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
            <KindergartenList />
          </BottomSheet.Body>
        </RemoveScroll>
      </BottomSheet.Root>
    </div>
  );
}
