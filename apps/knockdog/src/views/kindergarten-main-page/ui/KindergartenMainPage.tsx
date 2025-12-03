import { startTransition, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { overlay } from 'overlay-kit';
import { Float, Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import {
  CurrentLocationDisplayFAB,
  CurrentLocationFAB,
  DEFAULT_MAP_ZOOM_LEVEL,
  getRegionLevel,
  ListFAB,
  MapView,
  RefreshFAB,
  SEARCH_MODES,
  useMapUrlState,
} from '@features/kindergarten-map';
import {
  FilterBottomSheet,
  KindergartenItemSheet,
  KindergartenListSheet,
  SearchHeader,
  isValidLatLngBounds,
  useSearchUrlState,
} from '@features/kindergarten-list';
import { KindergartenList } from '@features/kindergarten-list/ui/KindergartenList';
import type { KindergartenListItemWithMeta } from '@entities/kindergarten';
import { isEqualCoord, isValidCoord, useBasePoint, useBottomSheetSnapIndex, useSafeAreaInsets } from '@shared/lib';
import type { Coord } from '@shared/types';
import { useMarkerState } from '@shared/store';

export default function KindergartenMainPage() {
  const mapRef = useRef<naver.maps.Map | null>(null);

  const searchParams = useSearchParams();

  const { center, zoomLevel, setSearchedLevel, setSearchMode } = useMapUrlState();
  const { query } = useSearchUrlState();
  const { coord: basePoint } = useBasePoint();
  const { setActiveMarker } = useMarkerState();
  const { isFullExtended, setSnapIndex } = useBottomSheetSnapIndex();
  const { top } = useSafeAreaInsets();

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapSnapshot, setMapSnapshot] = useState<{
    center: Partial<Coord> | null;
    bounds: naver.maps.LatLngBounds | null;
    zoomLevel: number;
  }>({
    center: null,
    bounds: null,
    zoomLevel: 0,
  });

  const shouldShowRefresh = useMemo(() => {
    return !(isEqualCoord(center, mapSnapshot.center) && zoomLevel === mapSnapshot.zoomLevel);
  }, [center, zoomLevel, mapSnapshot.center, mapSnapshot.zoomLevel]);

  /** 지도 스냅샷 초기화 */
  useEffect(() => {
    if (!isMapLoaded || mapSnapshot.center !== null) return;

    const initialCenter = center || (isValidCoord(basePoint) && basePoint);

    if (!initialCenter) return;

    const initialZoom = zoomLevel ?? DEFAULT_MAP_ZOOM_LEVEL;
    const bounds = mapRef.current?.getBounds();
    const initialBounds = isValidLatLngBounds(bounds) ? bounds : null;

    startTransition(() => {
      setMapSnapshot({
        center: initialCenter,
        bounds: initialBounds,
        zoomLevel: initialZoom,
      });
    });

    setSearchedLevel(getRegionLevel(initialZoom));
  }, [isMapLoaded, center, basePoint, zoomLevel, mapSnapshot.center, setSearchedLevel]);

  /**
   * 검색 레벨 변경 완료 핸들러
   * @description 검색 레벨 변경 완료 시 스냅샷 업데이트
   */
  const handleSearchLevelChange = (center: Coord, zoom: number, bounds: naver.maps.LatLngBounds) => {
    setMapSnapshot({ center, bounds, zoomLevel: zoom });
  };

  /**
   * 재검색 핸들러
   * - 현재 mapState를 스냅샷으로 저장
   * - 검색 모드를 boundary로 전환
   */
  const handleRefresh = () => {
    if (!isValidCoord(basePoint) || !zoomLevel) return;

    const bounds = mapRef.current?.getBounds();
    const validBounds = isValidLatLngBounds(bounds) ? bounds : null;

    setMapSnapshot({
      center: { lat: center?.lat, lng: center?.lng },
      bounds: validBounds,
      zoomLevel,
    });
    setSearchMode(SEARCH_MODES.BOUNDARY);
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
        onSearchLevelChange={handleSearchLevelChange}
        onMapLoadChange={setIsMapLoaded}
        onOpenCard={handleOpenCard}
        mapSnapshot={mapSnapshot}
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
        <KindergartenList mapSnapshot={mapSnapshot} onOpenFilter={handleOpenFilter} />
      </KindergartenListSheet>
    </>
  );
}
