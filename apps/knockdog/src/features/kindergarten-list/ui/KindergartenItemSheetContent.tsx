import { type ComponentProps } from 'react';
import { BottomSheet } from '@shared/ui/bottom-sheet';
import { cn } from '@knockdog/ui/lib';
import { motion, type MotionValue } from 'framer-motion';
import { RemoveScroll } from 'react-remove-scroll';
import { LoadingSpinner } from '@shared/ui/loading-spinner';
import type { KindergartenMain } from '@entities/kindergarten';
import { KindergartenCard } from './KindergartenCard';
import { KindergartenDetail } from './KindergartenDetail';

type BottomSheetSnapPoint = ComponentProps<typeof BottomSheet.Root>['activeSnapPoint'];

interface KindergartenItemSheetContentProps {
  displayData?: KindergartenMain;
  activeSnapPoint: BottomSheetSnapPoint;
  setActiveSnapPoint: (snapPoint: BottomSheetSnapPoint) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  visibleOpacity: MotionValue<number>;
  hiddenOpacity: MotionValue<number>;
  cardY: MotionValue<number>;
  detailY: MotionValue<number>;
  scaleUp: MotionValue<number>;
  scaleDown: MotionValue<number>;
  onBookmarkClick: (id: string, bookmarked: boolean) => void;
  onPhoneCall: () => void;
}

export function KindergartenItemSheetContent({
  displayData,
  activeSnapPoint,
  setActiveSnapPoint,
  activeTab,
  setActiveTab,
  visibleOpacity,
  hiddenOpacity,
  cardY,
  detailY,
  scaleUp,
  scaleDown,
  onBookmarkClick,
  onPhoneCall,
}: KindergartenItemSheetContentProps) {
  if (!displayData) {
    return (
      <>
        <BottomSheet.Handle />
        <BottomSheet.Title className='sr-only'>강아지 유치원 상세 정보</BottomSheet.Title>
        <div className='flex h-full w-full flex-col items-center justify-center'>
          <LoadingSpinner />
        </div>
      </>
    );
  }

  return (
    <>
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
          {...displayData}
          onBookmarkClick={onBookmarkClick}
          onPhoneCall={onPhoneCall}
          setActiveSnapPoint={setActiveSnapPoint}
          setActiveTab={setActiveTab}
        />
      </motion.div>

      <RemoveScroll forwardProps noIsolation enabled={activeSnapPoint === 1}>
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
            {...displayData}
            onBookmarkClick={onBookmarkClick}
            onPhoneCall={onPhoneCall}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </motion.div>
      </RemoveScroll>
    </>
  );
}
