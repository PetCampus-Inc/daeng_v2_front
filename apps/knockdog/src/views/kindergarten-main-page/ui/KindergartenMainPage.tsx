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
import { toBoundsSnapshot } from '@features/kindergarten-map/lib/bounds';
import { isEqualFilters, type KindergartenListItemWithMeta } from '@entities/kindergarten';
import { isEqualCoord, useBottomSheetSnapIndex, useSafeAreaInsets } from '@shared/lib';
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
  const { liveState, committedState, dispatch } = useSearchMachine();
  const { query, filters } = committedState;

  const { setActiveMarker } = useMarkerState();
  const { isFullExtended, setSnapIndex } = useBottomSheetSnapIndex();
  const { top } = useSafeAreaInsets();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const prevQueryRef = useRef(query);
  const prevFiltersRef = useRef(filters);

  // URL 상태(committedState)가 외부 요인(뒤로가기 등)으로 변경되면,
  // 지도 뷰를 직접 제어하여 동기화합니다.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !committedState.center) return;

    const committedLatLng = new naver.maps.LatLng(committedState.center.lat, committedState.center.lng);

    // 현재 지도 중심과 committed 상태의 중심이 다를 경우에만 이동
    if (!map.getCenter().equals(committedLatLng)) {
      map.setCenter(committedLatLng);
    }
    // 현재 지도 줌과 committed 상태의 줌이 다를 경우에만 변경
    if (map.getZoom() !== committedState.zoom) {
      map.setZoom(committedState.zoom);
    }
  }, [committedState.center, committedState.zoom]);

  const shouldShowRefresh = useMemo(() => {
    if (!liveState.viewportBounds) return false;

    const zoomChanged = liveState.zoom !== committedState.zoom;
    if (zoomChanged) return true;

    if (committedState.searchCenter && liveState.center) {
      return !isEqualCoord(committedState.searchCenter, liveState.center);
    }

    return false;
  }, [liveState, committedState]);

  // URL의 query 변경을 감지하고 이벤트를 발생
  useEffect(() => {
    if (query !== prevQueryRef.current) {
      const trimmed = query.trim();
      if (trimmed.length > 0) {
        dispatch({ type: 'QUERY_CHANGED', query: trimmed });
      } else {
        dispatch({ type: 'CLEAR_QUERY' });
      }
      prevQueryRef.current = query;
    }
  }, [query, dispatch]);

  // URL의 filters 변경을 감지하고 이벤트를 발생
  useEffect(() => {
    if (!isEqualFilters(filters, prevFiltersRef.current)) {
      if (filters.length > 0) {
        dispatch({ type: 'FILTERS_CHANGED', filters });
      } else {
        dispatch({ type: 'CLEAR_FILTERS' });
      }
      prevFiltersRef.current = filters;
    }
  }, [filters, dispatch]);

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

  const handleOpenCard = (item: KindergartenListItemWithMeta) => {
    const itemId = item.id;

    if (useMarkerState.getState().activeMarkerId === itemId) {
      return;
    }

    setActiveMarker(itemId);
    setSelectedItemId(itemId);
    setIsSheetOpen(true);
  };

  const handleOpenFilter = () => {
    overlay.open(({ isOpen, close }) => (
      <FilterBottomSheet
        isOpen={isOpen}
        close={close}
        bounds={mapRef.current?.getBounds()}
        initialFilters={liveState.filters}
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

      {liveState.query.trim().length > 0 ? (
        <SearchHeader query={liveState.query} />
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

      {isSheetOpen && selectedItemId && (
        <KindergartenItemSheet
          isOpen={isSheetOpen}
          onClose={() => {
            if (useMarkerState.getState().activeMarkerId === selectedItemId) {
              setActiveMarker(null);
            }
            setIsSheetOpen(false);
            setSelectedItemId(null);
          }}
          itemId={selectedItemId}
        />
      )}
    </>
  );
}
