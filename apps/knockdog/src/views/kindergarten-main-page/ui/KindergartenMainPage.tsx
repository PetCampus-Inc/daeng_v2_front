import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { overlay } from 'overlay-kit';
import { Chip, Float, Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import { useQueryClient } from '@tanstack/react-query';
import {
  CurrentLocationDisplayFAB,
  CurrentLocationFAB,
  ListFAB,
  MapView,
  ResearchFAB,
  DisplayFilterProvider,
  useDisplayFilterContext,
} from '@features/kindergarten-map';
import {
  FilterBottomSheet,
  KindergartenItemSheet,
  KindergartenListSheet,
  SearchHeader,
} from '@features/kindergarten-list';
import { KindergartenList } from '@features/kindergarten-list/ui/KindergartenList';
import { SearchStateProvider, useSearchMachine } from '@features/kindergarten-map/model/useSearchMachine';
import { getRegionLevel } from '@features/kindergarten-map/lib/markers';
import type { BoundsSnapshot } from '@features/kindergarten-map/lib/searchMachine';
import { boundsSnapshotToBounds, toBoundsSnapshot } from '@features/kindergarten-map/lib/bounds';
import type { KindergartenListItem } from '@entities/kindergarten';
import { isEqualCoord, useBottomSheetSnapIndex } from '@shared/lib';
import { useMarkerState } from '@shared/store';

export default function KindergartenMainPage() {
  return (
    <SearchStateProvider>
      <DisplayFilterProvider>
        <KindergartenMainPageContent />
      </DisplayFilterProvider>
    </SearchStateProvider>
  );
}

function KindergartenMainPageContent() {
  const mapRef = useRef<naver.maps.Map | null>(null);
  const searchParams = useSearchParams();
  const { liveState, committedState, searchState, dispatch } = useSearchMachine();
  const { isOnlyBookmarked, isOnlyMemoed, toggleBookmarked, toggleMemoed } = useDisplayFilterContext();

  const { setActiveMarker } = useMarkerState();
  const { isFullExtended, setSnapIndex } = useBottomSheetSnapIndex();

  const shouldShowRefresh = useMemo(() => {
    if (!liveState.viewportBounds) return false;

    const zoomChanged = liveState.zoom !== searchState.zoom;
    if (zoomChanged) return true;

    if (committedState.searchCenter && liveState.center) {
      return !isEqualCoord(committedState.searchCenter, liveState.center);
    }

    return false;
  }, [liveState, committedState.searchCenter, searchState.zoom]);

  /**
   * 재검색 핸들러
   * - 현재 mapState를 스냅샷으로 저장
   * - 검색 모드를 boundary로 전환
   */
  const handleRefresh = () => {
    const bounds = mapRef.current?.getBounds();
    const viewportBounds: BoundsSnapshot | null = toBoundsSnapshot(bounds);

    dispatch({
      type: 'RESEARCH_HERE',
      viewportBounds,
      levelFromZoom: getRegionLevel(liveState.zoom),
    });
  };

  const handleOpenCard = (item: KindergartenListItem) => {
    const itemId = item.id;

    if (useMarkerState.getState().activeMarkerId === itemId) {
      return;
    }

    setActiveMarker(itemId);

    overlay.open(({ isOpen, unmount }) => (
      <KindergartenItemSheet
        isOpen={isOpen}
        onClose={() => {
          if (useMarkerState.getState().activeMarkerId === itemId) {
            setActiveMarker(null);
          }
          unmount();
        }}
        {...item}
        coords={{ lng: committedState.refPoint?.lng ?? 0, lat: committedState.refPoint?.lat ?? 0 }}
      />
    ));
  };

  const handleOpenFilter = () => {
    overlay.open(({ isOpen, close }) => (
      <FilterBottomSheet
        isOpen={isOpen}
        close={close}
        bounds={boundsSnapshotToBounds(liveState.viewportBounds)}
        initialFilters={committedState.filters}
        onApply={(newFilters) => {
          if (newFilters.length > 0) {
            dispatch({ type: 'FILTERS_CHANGED', filters: newFilters });
          } else {
            dispatch({ type: 'CLEAR_FILTERS' });
          }
        }}
      />
    ));
  };

  return (
    <>
      <MapView ref={mapRef} onOpenCard={handleOpenCard} />

      {committedState.query.trim().length > 0 ? (
        <SearchHeader query={committedState.query} />
      ) : (
        <div
          className={cn(
            `absolute top-0 right-0 left-0 z-50 pt-(--safe-area-inset-top,0px) ${isFullExtended ? 'bg-fill-secondary-0' : ''
            }`
          )}
        >
          <div className='px-x4 flex h-16 w-full items-center transition-colors ease-out'>
            <Link href={`/search${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`} className='w-full'>
              <div className='radius-r2 border-line-600 bg-fill-secondary-0 px-x4 flex h-12 items-center border'>
                <Icon icon='Search' className='size-x6 text-fill-secondary-700 mr-x2' />
                <div role='button' aria-label='검색창 열기' className='text-text-tertiary body1-regular flex-1'>
                  업체 또는 주소를 검색하세요
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      <div className='px-x4 gap-x2 absolute top-[calc(var(--top-bar-height)+var(--safe-area-inset-top,0px))] flex w-full items-center'>
        <Chip.Toggle variant='outline' checked={isOnlyMemoed} onChange={toggleMemoed}>
          <Chip.PrefixIcon>
            <Icon icon='Note' className='size-x4' />
          </Chip.PrefixIcon>
          <Chip.Label>메모</Chip.Label>
        </Chip.Toggle>
        <Chip.Toggle variant='outline' checked={isOnlyBookmarked} onChange={toggleBookmarked}>
          <Chip.PrefixIcon>
            <Icon icon='BookmarkFill' className='size-x4' />
          </Chip.PrefixIcon>
          <Chip.Label>북마크</Chip.Label>
        </Chip.Toggle>
      </div>

      <KindergartenListSheet
        fabSlot={
          <div className='px-x4 absolute -top-[50px] flex w-full items-center justify-center'>
            <Float placement='top-start' offsetX='x4'>
              <CurrentLocationFAB />
            </Float>
            {shouldShowRefresh && <ResearchFAB onClick={handleRefresh} />}
            <div className={shouldShowRefresh ? 'hidden' : 'block'}>
              <CurrentLocationDisplayFAB />
            </div>
            <Float placement='top-end' offsetX='x4'>
              <ListFAB onClick={() => setSnapIndex(2)} />
            </Float>
          </div>
        }
      >
        <KindergartenList onOpenFilter={handleOpenFilter} region={searchParams?.get('region')} />
      </KindergartenListSheet>
    </>
  );
}
