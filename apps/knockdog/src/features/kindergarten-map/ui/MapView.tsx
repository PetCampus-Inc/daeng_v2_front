import { useEffect, useImperativeHandle, useRef } from 'react';
import { Map as NaverMap, Marker } from '@knockdog/react-naver-map';
import { useMapUrlState } from '../model/useMapUrlState';
import { getRegionLevel, isAggregationZoom, isBusinessZoom } from '../lib/markers';
import { DEFAULT_MAP_ZOOM_LEVEL } from '../config/map';
import { getMapCenter, getMapZoom } from '../lib/map';
import { useSearchListQuery, useAggregationQuery } from '../model/useMapQuery';
import { BBoxDebug } from './BBoxDebug';
import { useSearchState } from '../model/useSearchState';
import type { KindergartenListItemWithMeta, KindergartenListWithMeta, SortType } from '@entities/kindergarten';
import { isValidCoord, useBasePoint, useGeolocationQuery } from '@shared/lib';
import { AggregationMarker, CurrentLocationMarker, PlaceMarker } from '@shared/ui/map';
import type { Coord } from '@shared/types';
import { useMarkerState } from '@shared/store';
import { toBoundsSnapshot } from '../lib/bounds';

interface MapViewProps {
  ref?: React.Ref<naver.maps.Map | null>;
  isMapLoaded: boolean;
  onMapLoadChange?: (loaded: boolean) => void;
  onOpenCard?: (item: KindergartenListItemWithMeta) => void;
  sortRank?: SortType;
}
export function MapView(props: MapViewProps) {
  const { ref, isMapLoaded, onMapLoadChange, onOpenCard, sortRank } = props;

  const map = useRef<naver.maps.Map | null>(null);
  const lastFittedKeyRef = useRef<string | null>(null);
  useImperativeHandle(ref, () => map.current!);

  const { center, setCenter, zoomLevel, setZoomLevel } = useMapUrlState();
  const { coord: basePoint } = useBasePoint();
  const { data: currentLocation } = useGeolocationQuery();
  const { activeMarkerId } = useMarkerState();
  const { snapshot, mapSnapshot, mapChange, zoomLevelChange, aggMarkerClick } = useSearchState();

  const mapCenter = getMapCenter({ center, basePoint });
  const mapZoom = getMapZoom(zoomLevel);

  const isBusinessZoomLevel = isBusinessZoom(zoomLevel ?? 0);
  const showAggregationMarkers = isAggregationZoom(zoomLevel ?? 0);
  // 검색 lock이 걸린 상태(scope=bounds, searchLock=1)에서는 리스트 쿼리가 멈추더라도
  // 이미 확보한 업체 마커를 계속 보여주기 위해 줌 조건만으로 표시 여부를 결정한다.
  const showBusinessMarkers = isBusinessZoomLevel || snapshot.searchLock === 1;

  const { listQuery, searchList: overlay, isLoading, isFetching } = useSearchListQuery({ rank: sortRank });

  const { aggregation, geoBounds } = useAggregationQuery();

  /** 지도 (url)상태 초기화 */
  useEffect(() => {
    if (!isMapLoaded || !map.current) return;
    if (isValidCoord(center)) return;
    if (!isValidCoord(basePoint)) return;

    setCenter(basePoint);
    setZoomLevel(DEFAULT_MAP_ZOOM_LEVEL);
  }, [isMapLoaded, basePoint, center, setCenter, setZoomLevel]);

  /**
   * GLOBAL 스코프에서 query/filters 변동 후 agg 응답 bounds로 1회 fitBounds.
   * 동일 SearchSnapshot(스코프/레벨/쿼리/필터)에서는 중복 실행을 막는다.
   * nearby/bounds 스코프에서는 서버 bounds로 자동 이동하지 않는다.
   */
  useEffect(() => {
    if (!isMapLoaded || !map.current) return;
    if (snapshot.scope !== 'global') return;
    if (!geoBounds) return;

    const fitKey = `global:${snapshot.query}:${snapshot.filters.join(',')}`;
    if (lastFittedKeyRef.current === fitKey) return;

    const bounds = new naver.maps.LatLngBounds(
      new naver.maps.LatLng(geoBounds.swLat, geoBounds.swLng),
      new naver.maps.LatLng(geoBounds.neLat, geoBounds.neLng)
    );
    map.current.fitBounds(bounds);
    lastFittedKeyRef.current = fitKey;
  }, [geoBounds, isMapLoaded, snapshot.filters, snapshot.query, snapshot.scope]);

  /**
   * 지도 로드 핸들러
   * @description 지도 로드 시 isMapLoaded 플래그 활성화
   */
  const handleMapLoad = (map: naver.maps.Map) => {
    onMapLoadChange?.(true);
    const center = map.getCenter();
    const bounds = map.getBounds();
    const zoom = map.getZoom();

    mapChange({
      center: center ? { lat: center.y, lng: center.x } : null,
      zoom,
      viewportBounds: toBoundsSnapshot(bounds),
    });
  };

  /**
   * 지도 드래그 종료 핸들러
   * @description 지도 드래그 종료 시 center 업데이트
   */
  const handleDragEnd = () => {
    if (!map.current) return;
    const coord = map.current.getCenter();
    const centerCoord = { lat: coord.y, lng: coord.x };
    const zoom = map.current.getZoom();
    const bounds = map.current.getBounds();

    setCenter(centerCoord);

    const viewportBounds = toBoundsSnapshot(bounds);

    mapChange({
      center: centerCoord,
      zoom,
      viewportBounds,
    });
  };

  /**
   * 집계 마커 클릭 핸들러
   * @description 집계 마커 클릭 시 지도 중심 이동 및 상세 정보 표시
   */
  const handleAggregationClick = (_: string, coord: Coord, nextZoom: number) => {
    if (map.current) {
      const bounds = map.current.getBounds();
      const viewportBounds = toBoundsSnapshot(bounds);
      if (viewportBounds) {
        aggMarkerClick(viewportBounds);
      }

      map.current.setCenter(coord);
      map.current.setZoom(nextZoom, true);
    }
  };

  /**
   * 마커 클릭 핸들러
   * @description 마커 클릭 시 지도 중심 이동, 상세 정보 표시 및 마커 활성화 처리
   */
  const handleMarkerClick = (item: KindergartenListItemWithMeta) => {
    map.current?.panTo(item.coord);
    onOpenCard?.(item);
  };

  /**
   * 줌 변경 완료 핸들러
   * - 줌 변경 완료 시 center, zoom 업데이트
   * - 항상 스냅샷 업데이트를 요청하고, 실제 API 호출 여부는 상태머신에서 제어
   */
  const handleZoomEnd = () => {
    if (!map.current) return;

    const coord = map.current.getCenter();
    const zoom = map.current.getZoom();
    const bounds = map.current.getBounds();

    const nextRegionLevel = getRegionLevel(zoom);
    const prevRegionLevel = snapshot.searchedLevel;

    const viewportBounds = toBoundsSnapshot(bounds);

    mapChange({
      center: { lat: coord.y, lng: coord.x },
      zoom,
      viewportBounds,
    });

    zoomLevelChange({
      prevLevel: prevRegionLevel,
      nextLevel: nextRegionLevel,
      viewportBounds,
    });

    if (nextRegionLevel !== prevRegionLevel) {
      setCenter({ lat: coord.y, lng: coord.x });
    }
  };

  return (
    <>
      <NaverMap
        ref={map}
        center={mapCenter}
        zoom={mapZoom}
        isPanto
        minZoom={7}
        maxZoom={19}
        baseTileOpacity={0.88}
        className='relative z-0 h-full w-full'
        onLoad={handleMapLoad}
        onDragEnd={handleDragEnd}
        onZoomChanged={(zoom) => setZoomLevel(zoom)}
        onZoomEnd={handleZoomEnd}
      >
        {/* 현재 위치 마커 */}
        {currentLocation && (
          <Marker
            position={currentLocation}
            customIcon={{
              content: <CurrentLocationMarker />,
              align: 'center',
            }}
          />
        )}

        {/* 지도 집계 마커 (줌레벨 0~13) */}
        {showAggregationMarkers &&
          aggregation.map((item) => (
            <Marker
              key={item.code}
              position={item.coord}
              onClick={() => handleAggregationClick(item.code, item.coord, item.nextZoom)}
              customIcon={{
                content: <AggregationMarker label={item.label} count={item.count} />,
                align: 'center',
              }}
            />
          ))}

        {/* 업체 마커 (줌레벨 14~) */}
        {showBusinessMarkers &&
          overlay.map((item) => (
            <Marker
              key={item.id}
              position={item.coord}
              onClick={() => handleMarkerClick(item)}
              customIcon={{
                content: <PlaceMarker title={item.title} distance={item.dist} selected={item.id === activeMarkerId} />,
                offsetY: 12,
              }}
            />
          ))}

        {listQuery.data?.pages.map(
          (page: KindergartenListWithMeta) =>
            page.schoolResult.exact && (
              <Marker
                key={page.schoolResult.exact.id}
                position={page.schoolResult.exact.coord}
                // onClick={() => handleMarkerClick(page.schoolResult.exact)}
                customIcon={{
                  content: (
                    <PlaceMarker
                      title={page.schoolResult.exact.title}
                      distance={page.schoolResult.exact.dist}
                      selected={page.schoolResult.exact.id === activeMarkerId}
                    />
                  ),
                  offsetY: 12,
                }}
              />
            )
        )}

        {/* 개발용 BBox 디버깅 - 개발 환경에서만 표시 */}
        {process.env.NODE_ENV === 'development' && (
          <BBoxDebug serverBounds={geoBounds} viewportBounds={mapSnapshot.viewportBounds} map={map.current} />
        )}
      </NaverMap>
    </>
  );
}
