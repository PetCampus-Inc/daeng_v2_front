'use client';

import { useRef, useState } from 'react';
import { cn } from '@knockdog/ui/lib';
import { BottomSheet, Icon } from '@knockdog/ui';
import { RemoveScroll } from 'react-remove-scroll';
import Link from 'next/link';

import { DogSchoolListWidget } from '@widgets/dogschool-list';
import { NaverMap } from '@shared/ui/naver-map';
import { getViewportSize, useIsomorphicLayoutEffect } from '@shared/lib';
import { BOTTOM_BAR_HEIGHT } from '@shared/constants';

// 최소 스냅포인트: 149px(바텀시트 최소 높이) + 68px(바텀바 높이) + 1px(보더)
// 최대 스냅포인트: 화면높이 - 48px(검색바 높이) + 8px(여백)
const MIN_SNAP_POINT = BOTTOM_BAR_HEIGHT + 149;
const MAX_SNAP_POINT = getViewportSize().height - 64 + 8;

export default function Home() {
  const snapPoints = [`${MIN_SNAP_POINT}px`, 0.5, 1];
  const [snap, setSnap] = useState<number | string | null>(
    snapPoints[0] ?? null
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  const isFullyExtended = snap === snapPoints[snapPoints.length - 1];

  useIsomorphicLayoutEffect(() => {
    if (containerRef.current) {
      setContainer(containerRef.current);
    }
  }, []);

  return (
    <>
      <NaverMap />
      <div className='z-2 bg-primitive-neutral-50/12 pointer-events-none absolute top-0 h-full w-full touch-none' />

      {/* search bar */}
      <div
        className={cn(
          'px-x4 pb-x2 absolute top-0 z-50 w-full pt-[calc(env(safe-area-inset-top)+8px)] transition-colors ease-out',
          isFullyExtended && 'bg-fill-secondary-0'
        )}
      >
        <Link href='/search'>
          <div className='radius-r2 border-line-600 bg-fill-secondary-0 px-x4 flex h-[48px] items-center border'>
            <div
              role='button'
              aria-label='검색창 열기'
              className='text-text-tertiary body1-regular flex-1'
            >
              업체 또는 주소를 검색하세요
            </div>
            <Icon icon='Search' className='size-x5 text-text-tertiary' />
          </div>
        </Link>
      </div>

      {/* chips */}
      <div className='px-x4 gap-x2 absolute top-[calc(env(safe-area-inset-top)+64px)] z-20 flex w-full'>
        <button className='radius-r2 py-x2 px-x3_5 gap-x1 border-line-200 bg-fill-secondary-700 body2-semibold text-text-primary-inverse flex shrink-0 items-center border-[1.4px]'>
          <Icon
            icon='Note'
            className='text-fill-primary-500 size-x4 inline-flex items-center justify-center'
          />
          메모
        </button>
        <button className='radius-r2 py-x2 px-x3_5 gap-x1 border-line-200 bg-fill-secondary-700 body2-semibold text-text-primary-inverse flex shrink-0 items-center border-[1.4px]'>
          <Icon
            icon='BookmarkFill'
            className='text-fill-primary-500 inline-flex size-[16.8px] items-center justify-center'
          />
          북마크
        </button>
      </div>

      {/* bottom sheet container */}
      <div
        ref={containerRef}
        className='pointer-events-none absolute bottom-0 w-full'
        style={{
          height: `${MAX_SNAP_POINT}px`,
        }}
      >
        <BottomSheet.Root
          defaultOpen
          dismissible={false}
          modal={isFullyExtended}
          snapPoints={snapPoints}
          activeSnapPoint={snap}
          setActiveSnapPoint={setSnap}
          container={container}
        >
          <RemoveScroll forwardProps>
            <BottomSheet.Content
              className={cn(
                'shadow-black/6 absolute inset-x-0 h-full shadow-[0px_-2px_10px] focus-visible:outline-none',
                isFullyExtended && 'rounded-none shadow-none'
              )}
            >
              {!isFullyExtended && (
                <BottomSheet.Handle className='mt-x3 mb-x1' />
              )}
              <div
                className={cn(
                  'scrollbar-hide mx-auto h-full w-full',
                  isFullyExtended ? 'overflow-y-auto' : 'overflow-hidden'
                )}
              >
                <DogSchoolListWidget />
              </div>
            </BottomSheet.Content>
          </RemoveScroll>
        </BottomSheet.Root>
      </div>
    </>
  );
}
