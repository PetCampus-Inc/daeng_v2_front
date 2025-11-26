import React, { useRef, useState } from 'react';
import { RemoveScroll } from 'react-remove-scroll';
import { cn } from '@knockdog/ui/lib';
import { BOTTOM_BAR_HEIGHT } from '@shared/constants';
import { BottomSheet } from '@shared/ui/bottom-sheet';
import { isNativeWebView, useBottomSheetSnapIndex, useIsomorphicLayoutEffect, useSafeAreaInsets } from '@shared/lib';
import { useMarkerState } from '@shared/store';

// 최소 스냅포인트: 149px(바텀시트 최소 높이) + 68px(바텀바 높이)
// 최대 스냅포인트: 화면높이 - 72px(검색바 높이) - 8px(여백)

// ✅ 구(HEAD)·신(리팩토링) 버전 병합: children을 기본으로 받되, 하위호환으로 bottomSlot도 함께 허용
export function KindergartenListSheet({
  fabSlot,
  children,
  bottomSlot,
}: {
  fabSlot: React.ReactNode;
  children?: React.ReactNode;
  bottomSlot?: React.ReactNode;
}) {
  const { top } = useSafeAreaInsets();

  // 리팩토링 분기 반영
  const MIN_SNAP_POINT = isNativeWebView() ? 141 : BOTTOM_BAR_HEIGHT + 141;
  const MAX_SNAP_POINT_OFFSET = isNativeWebView() ? 72 + top : 72;

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
              'absolute inset-x-0 z-50 h-full shadow-[0px_-2px_10px] shadow-black/6 focus-visible:outline-none',
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

            {/* 신버전(children) 우선, 구버전(bottomSlot)도 렌더링해 하위호환 보장 */}
            {children}
            {bottomSlot}
          </BottomSheet.Body>
        </RemoveScroll>
      </BottomSheet.Root>
    </div>
  );
}
