import { useEffect, useImperativeHandle, useRef } from 'react';
import { Map as NaverMap, Marker } from '@knockdog/react-naver-map';
import { useMapUrlState } from '../model/useMapUrlState';
import { getRegionLevel } from '../lib/markers';
import { DEFAULT_MAP_ZOOM_LEVEL } from '../config/map';
import { getMapCenter, getMapZoom } from '../lib/map';
import { useMapQuery } from '../model/useMapQuery';
import { isValidCoord, useBasePoint, useGeolocationQuery } from '@shared/lib';
import { AggregationMarker, CurrentLocationMarker, PlaceMarker } from '@shared/ui/map';
import type { Coord } from '@shared/types';
import type { KindergartenListItemWithMeta } from '@entities/kindergarten';
import { useMarkerState } from '@shared/store';

interface MapViewProps {
  ref?: React.Ref<naver.maps.Map | null>;
  isMapLoaded: boolean;
  onMapLoadChange?: (loaded: boolean) => void;
  onSearchLevelChange?: (center: Coord, zoom: number, bounds: naver.maps.LatLngBounds) => void;
  onOpenCard?: (item: KindergartenListItemWithMeta) => void;
  mapSnapshot: {
    center: Partial<Coord> | null;
    bounds: naver.maps.LatLngBounds | null;
    zoomLevel: number;
  };
}
export function MapView(props: MapViewProps) {
  const { ref, isMapLoaded, onMapLoadChange, onSearchLevelChange, onOpenCard, mapSnapshot } = props;

  const map = useRef<naver.maps.Map | null>(null);
  useImperativeHandle(ref, () => map.current!);

  const { center, setCenter, zoomLevel, setZoomLevel, searchedLevel, setSearchedLevel } = useMapUrlState();
  const { coord: basePoint } = useBasePoint();
  const { data: currentLocation } = useGeolocationQuery();
  const { activeMarkerId, setActiveMarker } = useMarkerState();

  const mapCenter = getMapCenter({ center, basePoint });
  const mapZoom = getMapZoom(zoomLevel);

  const {
    searchList: overlay,
    isLoading,
    isFetching,
  } = useMapQuery({
    mapSnapshot,
  });

  /** 지도 (url)상태 초기화 */
  useEffect(() => {
    if (!isMapLoaded || !map.current) return;
    if (isValidCoord(center)) return;
    if (!isValidCoord(basePoint)) return;

    setCenter(basePoint);
    setZoomLevel(DEFAULT_MAP_ZOOM_LEVEL);
  }, [isMapLoaded, basePoint, center, setCenter, setZoomLevel]);

  /**
   * 지도 로드 핸들러
   * @description 지도 로드 시 isMapLoaded 플래그 활성화
   */
  const handleMapLoad = (map: naver.maps.Map) => {
    onMapLoadChange?.(true);
  };

  /**
   * 지도 드래그 종료 핸들러
   * @description 지도 드래그 종료 시 center 업데이트
   */
  const handleDragEnd = () => {
    if (!map.current) return;
    const coord = map.current.getCenter();
    setCenter({ lat: coord.y, lng: coord.x });
  };

  /**
   * 집계 마커 클릭 핸들러
   * @description 집계 마커 클릭 시 지도 중심 이동 및 상세 정보 표시
   */
  const handleAggregationClick = (_: string, coord: Coord, nextZoom: number) => {
    map.current?.setCenter(coord);
    map.current?.setZoom(nextZoom, true);
  };

  /**
   * 마커 클릭 핸들러
   * @description 마커 클릭 시 지도 중심 이동, 상세 정보 표시 및 마커 활성화 처리
   */
  const handleMarkerClick = (item: KindergartenListItemWithMeta) => {
    map.current?.panTo(item.coord);
    setActiveMarker(item.id);
    onOpenCard?.(item);
  };

  /**
   * 줌 변경 완료 핸들러
   * - 줌 변경 완료 시 center, zoom 업데이트
   * - 검색 레벨 비교 후 스냅샷 업데이트
   */
  const handleZoomEnd = () => {
    if (!map.current) return;
    const coord = map.current.getCenter();
    const zoom = map.current.getZoom();
    setCenter({ lat: coord.y, lng: coord.x });

    const currentRegionLevel = getRegionLevel(zoom);
    if (currentRegionLevel !== searchedLevel) {
      setSearchedLevel(currentRegionLevel);
      onSearchLevelChange?.({ lat: coord.y, lng: coord.x }, zoom, map.current.getBounds() as naver.maps.LatLngBounds);
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

        {/* 지도 집계 마커 */}
        {/* {aggregation.map((item) => (
          <Marker
            key={item.code}
            position={item.coord}
            onClick={() => handleAggregationClick(item.code, item.coord, item.nextZoom)}
            customIcon={{
              content: <AggregationMarker label={item.label} count={item.count} />,
              align: 'center',
            }}
          />
        ))} */}

        {/* 업체 마커 */}
        {overlay.map((item) => (
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
      </NaverMap>
    </>
  );
}
