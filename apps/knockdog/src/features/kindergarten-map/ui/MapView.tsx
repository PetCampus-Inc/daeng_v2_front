import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Map as NaverMap, Marker } from '@knockdog/react-naver-map';
import { useMapUrlState } from '../model/useMapUrlState';
import { getRegionLevel, isAggregationZoom, isBusinessZoom } from '../lib/markers';
import { DEFAULT_MAP_ZOOM_LEVEL } from '../config/map';
import { getMapCenter, getMapZoom } from '../lib/map';
import { useSearchListQuery, useAggregationQuery } from '../model/useSearchQuery';
import { BBoxDebug } from './BBoxDebug';
import { useSearchMachine } from '../model/useSearchMachine';
import { useSyncMapSnapshotWithUrl } from '../model/useSyncMapSnapshotWithUrl';
import { toBoundsSnapshot } from '../lib/bounds';
import type { KindergartenListItemWithMeta } from '@entities/kindergarten';
import { isValidCoord, useBasePoint, useGeolocationQuery } from '@shared/lib';
import { AggregationMarker, CurrentLocationMarker, PlaceMarker } from '@shared/ui/map';
import type { Coord } from '@shared/types';
import { useMarkerState } from '@shared/store';

interface MapViewProps {
  ref?: React.Ref<naver.maps.Map | null>;
  onOpenCard?: (item: KindergartenListItemWithMeta) => void;
}
export function MapView(props: MapViewProps) {
  const { ref, onOpenCard } = props;

  const map = useRef<naver.maps.Map | null>(null);
  const lastFittedKeyRef = useRef<string | null>(null);
  const exactHandledRef = useRef<string | null>(null);
  useImperativeHandle(ref, () => map.current!);

  const { center, setCenter, zoomLevel, setZoomLevel, setCenterAndZoom } = useMapUrlState();
  const { coord: basePoint } = useBasePoint();
  const { data: currentLocation } = useGeolocationQuery();
  const { activeMarkerId } = useMarkerState();
  const { snapshot, mapSnapshot, dispatch, updateMapSnapshot } = useSearchMachine();
  useSyncMapSnapshotWithUrl({ mapRef: map });

  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const mapCenter = getMapCenter({ center, basePoint });
  const mapZoom = getMapZoom(zoomLevel);

  const isBusinessZoomLevel = isBusinessZoom(zoomLevel ?? 0);
  // 검색 lock이 걸린 상태에서는 업체 마커만 표시.
  const showAggregationMarkers = snapshot.searchLock !== 1 && isAggregationZoom(zoomLevel ?? 0);
  const showBusinessMarkers = snapshot.searchLock === 1 || isBusinessZoomLevel;

  const { searchList: overlay, exact } = useSearchListQuery();

  const { aggregation, geoBounds } = useAggregationQuery();

  /**
   * 지도 초기화
   *
   * @description
   * 초기 마운트 시 mapSnapshot과 map url를 동기화합니다.
   * - URL에 center가 없으면 basePoint로 설정
   * - URL에 zoomLevel이 없으면 DEFAULT_MAP_ZOOM_LEVEL로 설정
   * - 이후에는 Map 인터랙션 → URL 업데이트 방향으로만 동작
   */
  useEffect(() => {
    if (!isMapLoaded || !map.current) return;
    // URL에 유효한 center가 있으면 그대로 사용
    if (isValidCoord(center)) {
      return;
    }

    // URL에 center가 없으면 basePoint로 초기화
    if (!isValidCoord(basePoint)) return;

    // 1. 지도 인스턴스에 중심점 설정
    map.current.setCenter(basePoint);
    // 2. 로컬 MapSnapshot 동기화
    updateMapSnapshot({
      center: getMapCenter({ center, basePoint }),
      zoom: DEFAULT_MAP_ZOOM_LEVEL,
      viewportBounds: toBoundsSnapshot(map.current.getBounds()),
    });
    // 3. URL 초기화
    setCenterAndZoom(basePoint, DEFAULT_MAP_ZOOM_LEVEL);
  }, [
    isMapLoaded,
    basePoint,
    center,
    setCenter,
    setZoomLevel,
    setCenterAndZoom,
    updateMapSnapshot,
    mapSnapshot.viewportBounds,
  ]);

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
   * exact 결과가 있을 때는 자동으로 선택 상태를 만들고 상세 시트를 연다.
   * // TODO: 시트 제어는 상위 컴포넌트로 위임해야함.
   */
  useEffect(() => {
    if (!exact) {
      exactHandledRef.current = null;
      return;
    }
    if (!onOpenCard) return;

    if (exactHandledRef.current === exact.id) return;
    onOpenCard(exact);
    exactHandledRef.current = exact.id;
  }, [exact, onOpenCard]);

  /**
   * 지도 로드 핸들러
   * @description 지도 로드 시 isMapLoaded 플래그 활성화
   */
  const handleMapLoad = (map: naver.maps.Map) => {
    setIsMapLoaded(true);
    if (isValidCoord(center)) {
      map.setCenter(center);
    }
    if (zoomLevel) {
      map.setZoom(zoomLevel);
    }
  };

  /**
   * 지도 드래그 종료 핸들러 (Map → URL 단방향)
   *
   * @description
   * 드래그 종료 시 로컬 MapSnapshot 먼저 업데이트 → URL에 반영
   * - Map 상태가 Source of Truth
   * - URL은 Map 상태의 영속성 저장소 역할
   */
  const handleDragEnd = () => {
    if (!map.current) return;
    const coord = map.current.getCenter();
    const centerCoord = { lat: coord.y, lng: coord.x };
    const zoom = map.current.getZoom();
    const bounds = map.current.getBounds();
    const viewportBounds = toBoundsSnapshot(bounds);

    // 로컬 MapSnapshot 업데이트
    updateMapSnapshot({
      center: centerCoord,
      zoom,
      viewportBounds,
    });

    // URL 업데이트 (단방향: Map → URL)
    setCenter(centerCoord);
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
        dispatch({ type: 'AGG_MARKER_CLICK', bounds: viewportBounds });
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
   * 줌 변경 완료 핸들러 (Map → URL 단방향)
   *
   * @description
   * 줌 종료 시 로컬 MapSnapshot + FSM dispatch → URL 반영
   * - center와 zoom을 배칭하여 URL 업데이트 1회만 발생
   * - 레벨 변경 시에만 center도 함께 업데이트 (최적화)
   */
  const handleZoomEnd = () => {
    if (!map.current) return;

    const coord = map.current.getCenter();
    const zoom = map.current.getZoom();
    const bounds = map.current.getBounds();
    const centerCoord = { lat: coord.y, lng: coord.x };
    const viewportBounds = toBoundsSnapshot(bounds);

    const nextRegionLevel = getRegionLevel(zoom);
    const prevRegionLevel = snapshot.searchedLevel;

    // 로컬 MapSnapshot 업데이트
    updateMapSnapshot({
      center: centerCoord,
      zoom,
      viewportBounds,
    });

    // FSM 전이 (검색 레벨 변경 감지)
    dispatch({
      type: 'ZOOM_LEVEL_CHANGED',
      from: prevRegionLevel,
      to: nextRegionLevel,
      viewportBounds,
    });

    // URL 업데이트
    setCenterAndZoom(centerCoord, zoom);
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

        {showBusinessMarkers && exact && (
          <Marker
            key={exact.id}
            position={exact.coord}
            onClick={() => handleMarkerClick(exact)}
            customIcon={{
              content: <PlaceMarker title={exact.title} distance={exact.dist} selected={exact.id === activeMarkerId} />,
              offsetY: 12,
            }}
          />
        )}

        {/* 개발용 BBox 디버깅 - 개발 환경에서만 표시 */}
        {process.env.NODE_ENV === 'development' && (
          <BBoxDebug serverBounds={geoBounds} viewportBounds={mapSnapshot.viewportBounds} map={map.current} />
        )}
      </NaverMap>
    </>
  );
}
