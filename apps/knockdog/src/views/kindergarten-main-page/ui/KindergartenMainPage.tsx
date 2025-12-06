import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { overlay } from 'overlay-kit';
import { Float, Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import {
  CurrentLocationDisplayFAB,
  CurrentLocationFAB,
  ListFAB,
  MapView,
  RefreshFAB,
  useMapUrlState,
} from '@features/kindergarten-map';
import {
  FilterBottomSheet,
  KindergartenItemSheet,
  KindergartenListSheet,
  SearchHeader,
  useSearchUrlState,
} from '@features/kindergarten-list';
import { KindergartenList } from '@features/kindergarten-list/ui/KindergartenList';
import { SearchStateProvider, useSearchState } from '@features/kindergarten-map/model/useSearchState';
import { getRegionLevel } from '@features/kindergarten-map/lib/markers';
import type { BoundsSnapshot } from '@features/kindergarten-map/lib/searchState';
import { toBoundsSnapshot } from '@features/kindergarten-map/lib/bounds';
import type { KindergartenListItemWithMeta } from '@entities/kindergarten';
import { isEqualCoord, isValidCoord, useBasePoint, useBottomSheetSnapIndex, useSafeAreaInsets } from '@shared/lib';
import { useMarkerState } from '@shared/store';

export default function KindergartenMainPage() {
  return (
    <SearchStateProvider>
      <KindergartenMainPageContent />
    </SearchStateProvider>
  );
}

function KindergartenMainPageContent() {
  const mapRef = useRef<naver.maps.Map | null>(null);

  const searchParams = useSearchParams();

  const { center, zoomLevel } = useMapUrlState();
  const { query, rank } = useSearchUrlState();
  const { coord: basePoint } = useBasePoint();
  const { setActiveMarker } = useMarkerState();
  const { isFullExtended, setSnapIndex } = useBottomSheetSnapIndex();
  const { top } = useSafeAreaInsets();

  const { enter, setQuery: setSearchQuery, clearQuery, researchHere, mapSnapshot, snapshot } = useSearchState();

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const shouldShowRefresh = useMemo(() => {
    if (!mapSnapshot.center || !mapSnapshot.viewportBounds) return false;

    const zoomChanged = zoomLevel !== mapSnapshot.zoom;

    const snapshotCoord =
      snapshot.refPoint ??
      (snapshot.searchBounds ? { lat: snapshot.searchBounds.swLat, lng: snapshot.searchBounds.swLng } : null);
    const viewportCoord = { lat: mapSnapshot.viewportBounds.swLat, lng: mapSnapshot.viewportBounds.swLng };
    const snapshotCenterChanged = !isEqualCoord(snapshotCoord, viewportCoord);
    return zoomChanged || snapshotCenterChanged;
  }, [
    mapSnapshot.center,
    mapSnapshot.viewportBounds,
    mapSnapshot.zoom,
    zoomLevel,
    snapshot.refPoint,
    snapshot.searchBounds,
  ]);
  // ENTER 이벤트: 메인 페이지 진입 시 1회
  useEffect(() => {
    enter();
  }, [enter]);

  // SET_QUERY / CLEAR_QUERY 이벤트: URL query 변경 시
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length > 0) {
      setSearchQuery(trimmed);
      return;
    }
    clearQuery();
  }, [query, setSearchQuery, clearQuery]);

  /**
   * 재검색 핸들러
   * - 현재 mapState를 스냅샷으로 저장
   * - 검색 모드를 boundary로 전환
   */
  const handleRefresh = () => {
    if (!isValidCoord(basePoint) || !zoomLevel) return;

    const bounds = mapRef.current?.getBounds();
    const viewportBounds: BoundsSnapshot | null = toBoundsSnapshot(bounds);

    researchHere({
      viewportBounds,
      levelFromZoom: getRegionLevel(zoomLevel),
    });
  };

  const handleOpenCard = (item: KindergartenListItemWithMeta) => {
    const itemId = item.id;

    // 이미 활성화된 마커면 시트를 열지 않음
    if (useMarkerState.getState().activeMarkerId === itemId) {
      return;
    }

    setActiveMarker(item.id);

    overlay.open(({ isOpen, unmount }) => {
      return (
        <KindergartenItemSheet
          isOpen={isOpen}
          close={() => {
            if (useMarkerState.getState().activeMarkerId === itemId) {
              setActiveMarker(null);
            }
            unmount();
          }}
          {...item}
        />
      );
    });
  };

  const handleOpenFilter = () => {
    overlay.open(({ isOpen, close }) => (
      <FilterBottomSheet isOpen={isOpen} close={close} bounds={mapRef.current?.getBounds()} />
    ));
  };

  return (
    <>
      <MapView
        ref={mapRef}
        isMapLoaded={isMapLoaded}
        onMapLoadChange={setIsMapLoaded}
        onOpenCard={handleOpenCard}
        sortRank={rank}
      />

      {query.trim().length > 0 ? (
        <SearchHeader query={query} />
      ) : (
        <div
          className={cn(`absolute top-0 right-0 left-0 z-50 ${isFullExtended ? 'bg-fill-secondary-0' : ''}`)}
          style={{ paddingTop: top }}
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

      <KindergartenListSheet
        fabSlot={
          <div className='px-x4 absolute -top-[50px] flex w-full items-center justify-center'>
            <Float placement='top-start' offsetX='x4'>
              <CurrentLocationFAB />
            </Float>
            {shouldShowRefresh ? <RefreshFAB onClick={handleRefresh} /> : <CurrentLocationDisplayFAB />}
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
