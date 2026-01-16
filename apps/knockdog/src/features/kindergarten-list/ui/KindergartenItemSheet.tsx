'use client';

import { type ComponentProps, useMemo, useRef, useState } from 'react';
import { ActionButton, BottomSheet, Icon } from '@knockdog/ui';
import { KindergartenCard } from './KindergartenCard';
import { cn } from '@knockdog/ui/lib';
import { motion, useIsomorphicLayoutEffect, useTransform } from 'framer-motion';
import { RemoveScroll } from 'react-remove-scroll';
import { useBookmarkToggle } from '../model/useBookmarkToggle';
import { useSheetDragProgress } from '../model/useViewportProgress';
import { overlay } from 'overlay-kit';
import { Header } from '@widgets/Header';
import { KindergartenDetail } from '@features/kindergarten-list/ui/KindergartenDetail';
import { useSearchListQuery } from '@features/kindergarten-map';
import { PhoneCallSheet } from '@features/kindergarten-list/ui/PhoneCallSheet';
import { isNativeWebView, useSafeAreaInsets, useShare } from '@shared/lib';
import { TOP_BAR_HEIGHT } from '@shared/constants';

type BottomSheetSnapPoint = ComponentProps<typeof BottomSheet.Root>['activeSnapPoint'];
interface KindergartenItemSheetProps {
  itemId: string;
  isOpen: boolean;
  onClose: () => void;
}

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
  const MAX_SNAP_POINT_OFFSET = isNativeWebView() ? TOP_BAR_HEIGHT + top : TOP_BAR_HEIGHT;

  const dynamicSnapPoints = useMemo(() => [{ type: 'content' as const, min: 328 }, 1], []);
  const [activeSnapPoint, setActiveSnapPoint] = useState<BottomSheetSnapPoint>(dynamicSnapPoints[0] ?? null);

  const headerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  const { viewRef, dragProgress } = useSheetDragProgress({
    minSnapPoint: 328,
    maxSnapPointOffset: MAX_SNAP_POINT_OFFSET,
    enabled: isOpen,
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

  const openPhoneCallActionSheet = () =>
    overlay.open(({ isOpen, close }) => (
      <PhoneCallSheet isOpen={isOpen} close={close} phoneNumber={currentItem?.phoneNumber ?? ''} />
    ));

  useIsomorphicLayoutEffect(() => {
    if (containerRef.current) {
      setContainer(containerRef.current);
    }
  }, [containerRef]);

  if (currentItem == null) return null;

  return (
    <>
      <motion.div
        ref={headerRef}
        className='fixed top-0 left-0 z-50 w-screen bg-white pt-(--safe-area-inset-top,0px)'
        style={{ opacity: hiddenOpacity }}
      >
        <Header className='block'>
          <Header.LeftSection>
            <Header.BackButton onClick={() => setActiveSnapPoint(dynamicSnapPoints[0] ?? null)} />
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
        className='pointer-events-none absolute bottom-0 h-[calc(100vh-calc(var(--top-bar-height)+var(--safe-area-inset-top,0px)))] w-full'
      >
        {container && (
          <BottomSheet.Root
            open={isOpen}
            onOpenChange={(open) => {
              if (!open) {
                onClose();
              }
            }}
            modal={false}
            snapPoints={dynamicSnapPoints}
            activeSnapPoint={activeSnapPoint}
            setActiveSnapPoint={(snap) => setActiveSnapPoint(snap)}
            snapToSequentialPoint
            container={container}
          >
            <BottomSheet.Portal>
              <BottomSheet.Body
                onPointerDownOutside={(e) => {
                  e.preventDefault();
                  if (!headerRef.current?.contains(e.target as Node)) {
                    onClose();
                  }
                }}
                className={cn(
                  'pointer-events-auto absolute inset-x-0 top-0 z-50',
                  activeSnapPoint === 1
                    ? 'h-[calc(100vh-calc(var(--top-bar-height)+var(--safe-area-inset-top,0px)))]'
                    : 'h-fit'
                )}
                style={{
                  ['--initial-transform' as never]: `calc(100vh - ${MAX_SNAP_POINT_OFFSET}px)`,
                }}
              >
                <RemoveScroll noIsolation>
                  {/* Visual Apron: 바텀시트 하단 gap을 가려주는 역할 */}
                  <div aria-hidden='true' className='absolute top-[99%] left-0 h-screen w-full bg-white' />
                  <div ref={viewRef} className={cn('relative h-full', activeSnapPoint === 1 && 'overflow-y-auto')}>
                    {/* 카드 뷰 */}
                    <motion.div
                      className={cn(
                        'top-0 left-0 h-fit w-full pb-[88px]',
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
                      <KindergartenCard {...currentItem} onBookmarkClick={onBookmarkClick} />
                    </motion.div>

                    {/* 상세 뷰 */}
                    <motion.div
                      className={cn(
                        'pointer-events-none h-full bg-white',
                        activeSnapPoint === 1 ? 'pointer-events-auto relative w-full pb-[88px]' : 'absolute inset-0'
                      )}
                      style={{
                        opacity: hiddenOpacity,
                        y: detailY,
                        scale: scaleUp,
                      }}
                    >
                      <KindergartenDetail kindergartenId={currentItem.id} />
                    </motion.div>
                  </div>
                </RemoveScroll>
                <div className='p-x4 gap-x2 fixed right-0 bottom-0 left-0 flex items-center bg-white pb-[calc(env(safe-area-inset-bottom)+16px)]'>
                  <ActionButton variant='primaryLine' size='medium' onClick={openPhoneCallActionSheet}>
                    전화하기
                  </ActionButton>
                  <ActionButton variant='primaryFill' size='medium' disabled>
                    비교하기
                  </ActionButton>
                  <button
                    aria-label='보관하기'
                    className='radius-r3 bg-fill-primary-50 flex size-[44px] shrink-0 items-center justify-center'
                    onClick={() => onBookmarkClick(currentItem.id, currentItem.isBookmarked ?? false)}
                  >
                    <Icon
                      icon={currentItem.isBookmarked ? 'BookmarkFill' : 'BookmarkLine'}
                      className='size-x6 text-fill-primary-500'
                    />
                  </button>
                </div>
              </BottomSheet.Body>
            </BottomSheet.Portal>
          </BottomSheet.Root>
        )}
      </div>
    </>
  );
}
