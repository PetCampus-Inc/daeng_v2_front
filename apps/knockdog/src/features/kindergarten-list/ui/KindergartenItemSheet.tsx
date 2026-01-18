'use client';

import { type ComponentProps, useCallback, useMemo, useRef, useState } from 'react';
import { BottomSheet } from '@knockdog/ui';
import { KindergartenCard } from './KindergartenCard';
import { cn } from '@knockdog/ui/lib';
import { motion, useIsomorphicLayoutEffect, useTransform } from 'framer-motion';
import { useDetailBookmarkToggle } from '../model/useDetailBookmarkToggle';
import { useSheetDragProgress } from '../model/useViewportProgress';
import { overlay } from 'overlay-kit';
import { Header } from '@widgets/Header';
import { KindergartenDetail } from '@features/kindergarten-list/ui/KindergartenDetail';
import { PhoneCallSheet } from '@features/kindergarten-list/ui/PhoneCallSheet';
import { useKindergartenMainQuery } from '@features/kindergarten-main';
import { isNativeWebView, useSafeAreaInsets, useShare } from '@shared/lib';
import { TOP_BAR_HEIGHT } from '@shared/constants';
import { LoadingSpinner } from '@shared/ui/loading-spinner';

const MIN_SNAP_POINT_OFFSET = 328;

type BottomSheetSnapPoint = ComponentProps<typeof BottomSheet.Root>['activeSnapPoint'];
interface KindergartenItemSheetProps {
  itemId: string;
  coords: { lat: number; lng: number };
  isOpen: boolean;
  onClose: () => void;
}
export function KindergartenItemSheet({ itemId, coords, isOpen, onClose }: KindergartenItemSheetProps) {
  const { top } = useSafeAreaInsets();
  const MAX_SNAP_POINT_OFFSET = isNativeWebView() ? TOP_BAR_HEIGHT + top : TOP_BAR_HEIGHT;

  const dynamicSnapPoints = useMemo(() => [{ type: 'content' as const, min: MIN_SNAP_POINT_OFFSET }, 1], []);
  const [activeSnapPoint, setActiveSnapPoint] = useState<BottomSheetSnapPoint>(dynamicSnapPoints[0] ?? null);

  const headerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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

  const { data: mainData } = useKindergartenMainQuery({ id: itemId, lng: coords.lng, lat: coords.lat });
  const { mutate: toggleBookmark } = useDetailBookmarkToggle({ id: itemId, lng: coords.lng, lat: coords.lat });

  const share = useShare();
  const handleShare = () => {
    const shareData = {
      message: `${mainData?.title}\n ${process.env.NEXT_PUBLIC_WEB_URL}/kindergarten/${mainData?.id}`,
      url: `${process.env.NEXT_PUBLIC_WEB_URL}/kindergarten/${mainData?.id}`,
    };
    share(shareData);
  };

  const openPhoneCallSheet = () =>
    overlay.open(({ isOpen, close }) => (
      <PhoneCallSheet isOpen={isOpen} close={close} phoneNumber={mainData?.phoneNumber ?? ''} />
    ));

  const onBookmarkClick = useCallback(
    (id: string, bookmarked: boolean) => {
      toggleBookmark({ id, bookmarked });
    },
    [toggleBookmark]
  );

  useIsomorphicLayoutEffect(() => {
    if (containerRef.current) {
      setContainer(containerRef.current);
    }
  }, [containerRef]);

  return (
    <>
      {/* 헤더 영역 */}
      <motion.div
        ref={headerRef}
        className='absolute top-0 left-0 z-50 w-full bg-white pt-(--safe-area-inset-top,0px)'
        style={{ opacity: hiddenOpacity }}
      >
        <Header className='block'>
          <Header.LeftSection>
            <Header.BackButton onClick={() => setActiveSnapPoint(dynamicSnapPoints[0] ?? null)} />
            <Header.HomeButton onClick={onClose} />
          </Header.LeftSection>

          <Header.Title>{mainData?.title}</Header.Title>

          <Header.RightSection>
            <Header.ShareButton onClick={handleShare} disabled={!mainData} />
          </Header.RightSection>
        </Header>
      </motion.div>

      {/* 바텀시트 컨테이너 */}
      <div
        ref={containerRef}
        className='pointer-events-none absolute bottom-0 h-[calc(100%-var(--top-bar-height)-var(--safe-area-inset-top,0px))] w-full'
      >
        {container && (
          <BottomSheet.Root
            open={isOpen}
            onOpenChange={(open) => !open && onClose()}
            modal={false}
            snapPoints={dynamicSnapPoints}
            activeSnapPoint={activeSnapPoint}
            setActiveSnapPoint={(snap) => setActiveSnapPoint(snap)}
            snapToSequentialPoint
            container={container}
            onSnapPointsResolved={(resolved) => {
              snapOffsetsRef.current = resolved;
            }}
          >
            <BottomSheet.Body
              ref={viewRef}
              className={cn(
                'pointer-events-auto absolute inset-x-0 top-0 z-[50] max-h-full',
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
              {!mainData ? (
                <div className='flex min-h-[328px] w-full flex-col items-center justify-center bg-white'>
                  <div className='w-full pt-2'>
                    <BottomSheet.Handle />
                  </div>
                  <BottomSheet.Title className='sr-only'>강아지 유치원 상세 정보</BottomSheet.Title>
                  <LoadingSpinner />
                </div>
              ) : (
                <>
                  {/* 카드 뷰 */}
                  <motion.div
                    className={cn(
                      'top-0 left-0 h-fit w-full',
                      activeSnapPoint === 1 ? 'pointer-events-none absolute opacity-0' : 'relative'
                    )}
                    style={{
                      opacity: visibleOpacity,
                      y: cardY,
                      scale: scaleDown,
                    }}
                  >
                    <BottomSheet.Handle />
                    <BottomSheet.Title className='sr-only'>강아지 유치원 상세 정보</BottomSheet.Title>
                    <KindergartenCard
                      {...mainData}
                      onBookmarkClick={onBookmarkClick}
                      onPhoneCall={openPhoneCallSheet}
                    />
                  </motion.div>

                  {/* 상세 뷰 */}
                  <motion.div
                    className={cn(
                      'pointer-events-none h-full bg-white',
                      activeSnapPoint === 1 ? 'pointer-events-auto relative w-full' : 'absolute inset-0'
                    )}
                    style={{
                      opacity: hiddenOpacity,
                      y: detailY,
                      scale: scaleUp,
                    }}
                  >
                    <KindergartenDetail
                      {...mainData}
                      onBookmarkClick={onBookmarkClick}
                      onPhoneCall={openPhoneCallSheet}
                    />
                  </motion.div>
                </>
              )}
            </BottomSheet.Body>
          </BottomSheet.Root>
        )}
      </div>
    </>
  );
}
