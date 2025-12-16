import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Map as NaverMap, Marker } from '@knockdog/react-naver-map';
import { isAggregationZoom, isBusinessZoom } from '../lib/markers';
import { getMapCenter, getMapZoom } from '../lib/map';
import { useSearchListQuery, useAggregationQuery } from '../model/useSearchQuery';
import { BBoxDebug } from './BBoxDebug';
import { useSearchMachine } from '../model/useSearchMachine';
import { toBoundsSnapshot } from '../lib/bounds';
import type { KindergartenListItemWithMeta } from '@entities/kindergarten';
import { useBasePoint, useGeolocationQuery } from '@shared/lib';
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

  const { coord: basePoint } = useBasePoint();
  const { data: currentLocation } = useGeolocationQuery();
  const { activeMarkerId } = useMarkerState();
  const { liveState: state, dispatch } = useSearchMachine();

  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const mapCenter = getMapCenter({ center: state.center, basePoint });
  const mapZoom = getMapZoom(state.zoom);

  // 검색 lock이 걸린 상태(scope=bounds, searchLock=1)에서는 줌과 무관하게 업체 마커만 표시한다.
  const showAggregationMarkers = state.searchLock !== 1 && isAggregationZoom(state.zoom);
  const showBusinessMarkers = state.searchLock === 1 || isBusinessZoom(state.zoom);

  const { searchList: overlay, exact } = useSearchListQuery();

  const { aggregation, geoBounds } = useAggregationQuery();

  /**
   * GLOBAL 스코프에서 query/filters 변동 후 agg 응답 bounds로 1회 fitBounds.
   * 동일 SearchSnapshot(스코프/레벨/쿼리/필터)에서는 중복 실행을 막는다.
   * nearby/bounds 스코프에서는 서버 bounds로 자동 이동하지 않는다.
   */
  useEffect(() => {
    if (!isMapLoaded || !map.current) return;
    if (state.scope !== 'global') return;
    if (!geoBounds) return;

    const fitKey = `global:${state.query}:${state.filters.join(',')}`;
    if (lastFittedKeyRef.current === fitKey) return;

    const bounds = new naver.maps.LatLngBounds(
      new naver.maps.LatLng(geoBounds.swLat, geoBounds.swLng),
      new naver.maps.LatLng(geoBounds.neLat, geoBounds.neLng)
    );
    map.current.fitBounds(bounds);
    lastFittedKeyRef.current = fitKey;
  }, [geoBounds, isMapLoaded, state.filters, state.query, state.scope]);

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
  const handleMapLoad = (_map: naver.maps.Map) => {
    setIsMapLoaded(true);
  };

  /**
   * 지도 인터랙션(드래그, 줌) 종료 핸들러
   */
  const handleMapInteractionEnd = () => {
    if (!map.current) return;
    const coord = map.current.getCenter();
    const centerCoord = { lat: coord.y, lng: coord.x };
    const zoom = map.current.getZoom();
    const bounds = map.current.getBounds();
    const viewportBounds = toBoundsSnapshot(bounds);

    dispatch({
      type: 'MAP_INTERACTION_END',
      payload: {
        center: centerCoord,
        zoom,
        viewportBounds,
      },
    });
  };

  /**
   * 집계 마커 클릭 핸들러
   * @description 집계 마커 클릭 시 FSM 이벤트를 발생시킨다.
   */
  const handleAggregationClick = (_: string, coord: Coord, nextZoom: number) => {
    if (map.current) {
      const bounds = map.current.getBounds();
      const viewportBounds = toBoundsSnapshot(bounds);
      if (viewportBounds) {
        dispatch({
          type: 'AGG_MARKER_CLICK',
          payload: {
            bounds: viewportBounds,
            center: coord,
            zoom: nextZoom,
          },
        });
      }
    }
  };

  /**
   * 마커 클릭 핸들러
   * @description 마커 클릭 시 지도 중심 이동, 상세 정보 표시 및 마커 활성화 처리
   */
  const handleMarkerClick = (item: KindergartenListItemWithMeta) => {
    dispatch({ type: 'CENTER_CHANGED', center: item.coord });
    onOpenCard?.(item);
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
        onDragEnd={handleMapInteractionEnd}
        onZoomEnd={handleMapInteractionEnd}
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

        {/* 개별 마커 (줌레벨 14~) */}
        {showBusinessMarkers &&
          overlay.map((item) => (
            <Marker
              key={item.id}
              position={item.coord}
              onClick={() => handleMarkerClick(item)}
              customIcon={{
                content: (
                  <PlaceMarker
                    title={item.title}
                    distance={item.dist}
                    selected={item.id === activeMarkerId}
                    isBookmarked={item.isBookmarked}
                    hasMemo={!!item.memo}
                  />
                ),
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
              content: (
                <PlaceMarker
                  title={exact.title}
                  distance={exact.dist}
                  selected={exact.id === activeMarkerId}
                  isBookmarked={exact.isBookmarked}
                  hasMemo={!!exact.memo}
                />
              ),
              offsetY: 12,
            }}
          />
        )}

        {/* 개발용 BBox 디버깅 - 개발 환경에서만 표시 */}
        {process.env.NODE_ENV === 'development' && (
          <BBoxDebug serverBounds={geoBounds} viewportBounds={state.viewportBounds} map={map.current} />
        )}
      </NaverMap>
    </>
  );
}
