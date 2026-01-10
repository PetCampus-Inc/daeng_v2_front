'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BottomSheet, TRANSITION_DURATION_MS } from '@knockdog/ui';
import { KindergartenCard } from './KindergartenCard';
import { cn } from '@knockdog/ui/lib';
import { motion, useIsomorphicLayoutEffect, useTransform } from 'framer-motion';
import { RemoveScroll } from 'react-remove-scroll';
import { useBookmarkToggle } from '../model/useBookmarkToggle';
import { useSheetDragProgress } from '../model/useViewportProgress';
import { Header } from '@widgets/Header';
import { KindergartenDetail } from '@features/kindergarten-list/ui/KindergartenDetail';
import { useSearchListQuery } from '@features/kindergarten-map';
import { isNativeWebView, useSafeAreaInsets, useShare } from '@shared/lib';
import { BOTTOM_BAR_HEIGHT } from '@shared/constants';

interface KindergartenItemSheetProps {
  itemId: string;
  isOpen: boolean;
  onClose: () => void;
}

type SnapPoint = number | string | null;

const MIN_SNAP_POINT = isNativeWebView() ? 328 : BOTTOM_BAR_HEIGHT + 328;
const snapPoints = [`${MIN_SNAP_POINT}px`, 1];

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

  const { top } = useSafeAreaInsets();
  const MAX_SNAP_POINT_OFFSET = isNativeWebView() ? 64 + top : 64;

  const [activeSnapPoint, setActiveSnapPoint] = useState<SnapPoint>(snapPoints[0] ?? null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const { top: safeAreaTop } = useSafeAreaInsets();
  const isMaxSnap = activeSnapPoint === snapPoints[1];

  const { viewRef, dragProgress } = useSheetDragProgress({
    minSnapPoint: MIN_SNAP_POINT,
    maxSnapPointOffset: MAX_SNAP_POINT_OFFSET,
  });

  const visibleOpacity = useTransform(dragProgress, [0, 1], [1, 0]);
  const hiddenOpacity = useTransform(dragProgress, [0, 1], [0, 1]);
  const cardY = useTransform(dragProgress, [0, 1], [0, 100]);
  const detailY = useTransform(dragProgress, [0, 1], [100, 0]);
  const scaleUp = useTransform(dragProgress, [0, 1], [0.8, 1]);
  const scaleDown = useTransform(dragProgress, [0, 1], [1, 0.8]);

  const share = useShare();
  const handleShare = () => {
    const shareData = {
      message: `${currentItem?.title}\n https://knockdog.com/kindergarten/${currentItem?.id}`,
      url: `https://knockdog.com/kindergarten/${currentItem?.id}`,
    };

    share(shareData);
  };

  useIsomorphicLayoutEffect(() => {
    if (containerRef.current) {
      setContainer(containerRef.current);
    }
  }, [containerRef]);

  if (currentItem == null) return null;
  return (
    <>
      <motion.div
        className='fixed top-0 left-0 z-50 w-screen bg-white'
        style={{ paddingTop: safeAreaTop, opacity: hiddenOpacity }}
      >
        <Header className='block'>
          <Header.LeftSection>
            <Header.BackButton onClick={() => setActiveSnapPoint(snapPoints[0] ?? null)} />
            <Header.HomeButton onClick={onClose} />
          </Header.LeftSection>

          <Header.Title>{currentItem.title}</Header.Title>

          <Header.RightSection>
            <Header.ShareButton onClick={handleShare} />
          </Header.RightSection>
        </Header>
      </motion.div>

      <div
        ref={containerRef}
        className='pointer-events-none absolute bottom-0 w-full'
        style={{ height: `calc(100vh - ${MAX_SNAP_POINT_OFFSET}px)` }}
      >
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
          setActiveSnapPoint={(snapPoint) => setActiveSnapPoint(snapPoint)}
          snapToSequentialPoint
          container={container}
        >
          <RemoveScroll forwardProps noIsolation>
            <BottomSheet.Body
              onPointerDownOutside={(e) => {
                e.preventDefault();
                onClose();
              }}
              className={cn(
                'pointer-events-auto absolute inset-x-0 z-50 h-full max-h-[calc(100vh-64px)]',
                activeSnapPoint === snapPoints[1] && 'h-full'
              )}
            >
              <div ref={viewRef} className={cn('h-full', isMaxSnap && 'overflow-y-auto')}>
                <motion.div
                  className='absolute inset-0'
                  style={{
                    opacity: visibleOpacity,
                    y: cardY,
                    scale: scaleDown,
                  }}
                >
                  <KindergartenCard {...currentItem} onBookmarkClick={onBookmarkClick} />
                </motion.div>

                <motion.div
                  className={cn('pointer-events-none h-full bg-white', isMaxSnap && 'pointer-events-auto')}
                  style={{
                    opacity: hiddenOpacity,
                    y: detailY,
                    scale: scaleUp,
                  }}
                >
                  <KindergartenDetail kindergartenId={currentItem.id} />
                </motion.div>
              </div>
            </BottomSheet.Body>
          </RemoveScroll>
        </BottomSheet.Root>
      </div>
    </>
  );
}
