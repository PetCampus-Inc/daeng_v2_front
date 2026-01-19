'use client';

import { type ComponentProps, useCallback, useMemo, useRef, useState } from 'react';
import { BottomSheet } from '@shared/ui/bottom-sheet';
import { cn } from '@knockdog/ui/lib';
import { useTransform } from 'framer-motion';
import { useSheetDragProgress } from '../model/useViewportProgress';
import { isNativeWebView, useSafeAreaInsets } from '@shared/lib';
import { TOP_BAR_HEIGHT } from '@shared/constants';
import type { KindergartenListItem } from '@entities/kindergarten';
import { FloatingPortal } from '@floating-ui/react';
import { KindergartenItemSheetContent } from './KindergartenItemSheetContent';
import { KindergartenItemSheetHeader } from './KindergartenItemSheetHeader';
import { useKindergartenItemSheetActions } from '../model/useKindergartenItemSheetActions';
import { useKindergartenItemSheetData } from '../model/useKindergartenItemSheetData';

const MIN_SNAP_POINT_OFFSET = 328;

type BottomSheetSnapPoint = ComponentProps<typeof BottomSheet.Root>['activeSnapPoint'];
interface KindergartenItemSheetProps extends KindergartenListItem {
  isOpen: boolean;
  onClose: () => void;
  coords: { lat: number; lng: number };
}

export function KindergartenItemSheet({ coords, isOpen, onClose, ...item }: KindergartenItemSheetProps) {
  const { top } = useSafeAreaInsets();
  const MAX_SNAP_POINT_OFFSET = isNativeWebView() ? TOP_BAR_HEIGHT + top : TOP_BAR_HEIGHT;

  const dynamicSnapPoints = useMemo(() => [{ type: 'content' as const, min: MIN_SNAP_POINT_OFFSET }, 1], []);
  const [activeSnapPoint, setActiveSnapPoint] = useState<BottomSheetSnapPoint>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const snapOffsetsRef = useRef<number[] | null>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  const { viewRef, dragProgress } = useSheetDragProgress({
    minSnapPoint: MIN_SNAP_POINT_OFFSET,
    maxSnapPointOffset: MAX_SNAP_POINT_OFFSET,
    containerRef,
    snapOffsetsRef,
    enabled: isOpen,
  });

  const visibleOpacity = useTransform(dragProgress, [0, 1], [1, 0]);
  const hiddenOpacity = useTransform(dragProgress, [0, 1], [0, 1]);
  const cardY = useTransform(dragProgress, [0, 1], [0, 100]);
  const detailY = useTransform(dragProgress, [0, 1], [100, 0]);
  const scaleUp = useTransform(dragProgress, [0, 1], [0.8, 1]);
  const scaleDown = useTransform(dragProgress, [0, 1], [1, 0.8]);

  const { displayData } = useKindergartenItemSheetData({ item, coords });
  const { onBookmarkClick, onShare, onPhoneCall } = useKindergartenItemSheetActions({
    displayData,
    id: item.id,
    coords,
  });

  const handleBack = useCallback(() => {
    setActiveSnapPoint(dynamicSnapPoints[0] as BottomSheetSnapPoint);
  }, [dynamicSnapPoints]);

  const setContainerRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
    setContainer(node);
  }, []);

  if (!isOpen) return null;

  return (
    <FloatingPortal root={document.getElementById('main')}>
      <KindergartenItemSheetHeader
        ref={headerRef}
        title={displayData?.title}
        onBack={handleBack}
        onHome={onClose}
        onShare={onShare}
        canShare={Boolean(displayData)}
        opacity={hiddenOpacity}
      />

      {/* 바텀시트 컨테이너 */}
      <div
        ref={setContainerRef}
        className='pointer-events-none absolute bottom-0 h-[calc(100%-var(--top-bar-height)-var(--safe-area-inset-top,0px))] w-full'
      >
        <BottomSheet.Root
          open={isOpen}
          onOpenChange={onClose}
          modal={false}
          snapPoints={dynamicSnapPoints as ComponentProps<typeof BottomSheet.Root>['snapPoints']}
          activeSnapPoint={activeSnapPoint}
          setActiveSnapPoint={setActiveSnapPoint}
          snapToSequentialPoint
          container={container}
          {...({
            onSnapPointsResolved: (resolved: number[]) => {
              snapOffsetsRef.current = resolved;
            },
          } as any)}
        >
          <BottomSheet.Body
            ref={viewRef}
            className={cn(
              'pointer-events-auto absolute inset-x-0 top-0 z-50 max-h-full',
              activeSnapPoint === 1 ? 'h-full' : 'h-fit'
            )}
            style={{
              ['--initial-transform' as never]: `calc(100vh - ${MAX_SNAP_POINT_OFFSET}px)`,
            }}
            onPointerDownOutside={(e) => {
              e.preventDefault();
              if (!headerRef.current?.contains(e.target as Node)) {
                onClose();
              }
            }}
          >
            {/* Visual Apron: 바텀시트 하단 gap을 가려주는 역할 */}
            <div aria-hidden='true' className='absolute top-[99%] left-0 h-screen w-full bg-white' />

            <KindergartenItemSheetContent
              displayData={displayData}
              activeSnapPoint={activeSnapPoint}
              visibleOpacity={visibleOpacity}
              hiddenOpacity={hiddenOpacity}
              cardY={cardY}
              detailY={detailY}
              scaleUp={scaleUp}
              scaleDown={scaleDown}
              onBookmarkClick={onBookmarkClick}
              onPhoneCall={onPhoneCall}
            />
          </BottomSheet.Body>
        </BottomSheet.Root>
      </div>
    </FloatingPortal>
  );
}
