import { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Map as NaverMap, Marker } from '@knockdog/react-naver-map';
import { isAggregationZoom, isPointZoom, isClusteringZoom } from '../lib/markers';
import { getMapCenter, getMapZoom } from '../lib/map';
import { useAggregationQuery } from '../model/useSearchQuery';
import { useFilteredSearchList } from '../model/useFilteredSearchList';
import { BBoxDebug } from './BBoxDebug';
import { useSearchMachine } from '../model/useSearchMachine';
import { toBoundsSnapshot } from '../lib/bounds';
import type { KindergartenListItemWithMeta } from '@entities/kindergarten';
import { useBasePoint } from '@entities/user';
import { isEqualBounds, isEqualCoord, useGeolocationQuery } from '@shared/lib';
import { CurrentLocationMarker } from '@shared/ui/map';
import type { Coord } from '@shared/types';
import { useMarkerState } from '@shared/store';
import { AggregationMarker } from './AggregationMarker';
import { PlaceBubbleMarker } from './PlaceBubbleMarker';
import { DotMarker } from './DotMarker';
import { BaseBubbleMarker } from './BaseBubbleMarker';
import { ClusterBubbleMarker } from './ClusterBubbleMarker';
import { CalloutOverlay } from './CalloutOverlay';
import { useMapClustering, type MapPoint, type MapCluster } from '../model/useMapClustering';
import type { BoundsSnapshot } from '../lib/searchMachine';
import { CALLOUT_Z_INDEX_OFFSET } from '../config/map';
import { MapMarker } from './MapMarker';

interface MapViewProps {
  ref?: React.Ref<naver.maps.Map | null>;
  onOpenCard?: (item: KindergartenListItemWithMeta) => void;
}

export function MapView(props: MapViewProps) {
  const { ref, onOpenCard } = props;

  const map = useRef<naver.maps.Map | null>(null);
  const lastGeoBoundsRef = useRef<{ swLat: number; swLng: number; neLat: number; neLng: number } | null>(null);
  const lastFittedKeyRef = useRef<string | null>(null);
  const autoFitRef = useRef(false);
  const aggNavigateRef = useRef(false);
  const exactHandledRef = useRef<string | null>(null);
  useImperativeHandle(ref, () => map.current!);

  const { coord: basePoint } = useBasePoint();
  const { data: currentLocation } = useGeolocationQuery();
  const { activeMarkerId } = useMarkerState();
  const { liveState: mapState, committedState, dispatch } = useSearchMachine();
  const { isFilterActive, searchList: overlay, exact } = useFilteredSearchList();

  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const mapCenter = getMapCenter({ center: mapState.center, basePoint });
  const mapZoom = getMapZoom(mapState.zoom);

  // 검색 lock이 걸린 상태(scope=bounds, searchLock=1)에서는 줌과 무관하게 업체 마커만 표시한다.
  // 필터(북마크/메모)가 활성화된 상태에서도 줌과 무관하게 업체 마커를 표시한다.
  const showAggregationMarkers = !isFilterActive && committedState.searchLock !== 1 && isAggregationZoom(mapState.zoom);
  const showBusinessMarkers = isFilterActive || committedState.searchLock === 1 || isPointZoom(mapState.zoom);

  const { clusters, supercluster } = useMapClustering({
    markers: overlay,
    zoom: mapState.zoom,
    bounds: mapState.viewportBounds,
    disableClustering: !isClusteringZoom(mapState.zoom),
  });

  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(null);

  /**
   * 현재 선택된 클러스터의 상세 데이터 추출
   * @description clusters.map 루프와 분리하여 별도 레이어로 렌더링
   */
  const selectedClusterData = useMemo(() => {
    if (selectedClusterId === null) return null;
    const cluster = clusters.find(
      (f) => f.properties.cluster && (f as MapCluster).properties.cluster_id === selectedClusterId
    ) as MapCluster | undefined;

    if (!cluster) return null;

    const [lng, lat] = cluster.geometry.coordinates as [number, number];
    const leaves = supercluster.getLeaves(selectedClusterId, Infinity);

    return {
      id: selectedClusterId,
      coord: { lat, lng },
      items: leaves.map((leaf) => leaf.properties.marker),
      pointCount: cluster.properties.point_count,
    };
  }, [selectedClusterId, clusters, supercluster]);

  const { aggregation, geoBounds, dataUpdatedAt } = useAggregationQuery();

  /**
   * GLOBAL 스코프에서 query/filters 변동 후 agg 응답 bounds로 1회 fitBounds.
   * 동일 SearchSnapshot(스코프/레벨/쿼리/필터)에서는 중복 실행을 막는다.
   * nearby/bounds 스코프에서는 서버 bounds로 자동 이동하지 않는다.
   * fitBounds 이후 최초 idle 이벤트에서 map 상태를 확정한다.
   */
  useEffect(() => {
    if (!isMapLoaded || !map.current) return;
    if (committedState.scope !== 'global') return;
    if (!geoBounds) return;

    // 이전과 동일한 bounds면 fitBounds X
    if (isEqualBounds(lastGeoBoundsRef.current, geoBounds)) return;

    // 동일 검색 조건이어도 refetch 시 fitBounds를 다시 수행한다.
    const fitKey = `global:${committedState.query}:${committedState.filters.join(',')}:${dataUpdatedAt}`;
    if (lastFittedKeyRef.current === fitKey) return;

    const bounds = new naver.maps.LatLngBounds(
      new naver.maps.LatLng(geoBounds.swLat, geoBounds.swLng),
      new naver.maps.LatLng(geoBounds.neLat, geoBounds.neLng)
    );
    autoFitRef.current = true;
    map.current.fitBounds(bounds);
    lastFittedKeyRef.current = fitKey;
    lastGeoBoundsRef.current = geoBounds;
  }, [
    dataUpdatedAt,
    dispatch,
    geoBounds,
    isMapLoaded,
    committedState.filters,
    committedState.query,
    committedState.scope,
  ]);

  const liveSnapshotRef = useRef({
    center: mapState.center,
    zoom: mapState.zoom,
    viewportBounds: mapState.viewportBounds,
  });
  useEffect(() => {
    liveSnapshotRef.current = {
      center: mapState.center,
      zoom: mapState.zoom,
      viewportBounds: mapState.viewportBounds,
    };
  }, [mapState.center, mapState.viewportBounds, mapState.zoom]);

  const mapLiveRef = useRef<{ center: Coord | null; zoom: number; viewportBounds: BoundsSnapshot | null }>({
    center: null,
    zoom: mapZoom,
    viewportBounds: null,
  });

  const handleBoundsChanged = (bounds: naver.maps.Bounds) => {
    mapLiveRef.current.viewportBounds = toBoundsSnapshot(bounds);
  };

  const handleCenterChanged = (center: naver.maps.Coord) => {
    mapLiveRef.current.center = { lat: center.y, lng: center.x };
  };

  const handleZoomChanged = (zoom: number) => {
    mapLiveRef.current.zoom = zoom;
  };

  /**
   * 선언적 이벤트 핸들러 기반 viewportBounds 동기화:
   * - bounds/center/zoom 변경은 ref에만 저장(고빈도 이벤트 비용 최소화)
   * - 커밋(dispatch)은 idle에서만 수행(드래그/줌/프로그램 이동 모두 커버)
   */
  const handleIdle = () => {
    if (!isMapLoaded || !map.current) return;
    if (aggNavigateRef.current) return;

    const viewportBounds = mapLiveRef.current.viewportBounds ?? toBoundsSnapshot(map.current.getBounds());
    if (!viewportBounds) return;

    const centerCoord =
      mapLiveRef.current.center ??
      (() => {
        const coord = map.current!.getCenter();
        return { lat: coord.y, lng: coord.x };
      })();
    const zoom = mapLiveRef.current.zoom ?? map.current.getZoom();

    const prev = liveSnapshotRef.current;
    const hasDiff =
      zoom !== prev.zoom ||
      !isEqualCoord(centerCoord, prev.center) ||
      !isEqualBounds(viewportBounds, prev.viewportBounds);

    if (!hasDiff) return;

    if (process.env.NODE_ENV === 'development') {
      console.warn('[MapView][debug] sync viewportBounds (idle)', { center: centerCoord, zoom, viewportBounds });
    }

    const source = autoFitRef.current ? 'auto-fit' : 'user';

    // - 일반 idle 동기화: viewportBounds만 맞추는 용도이므로 URL은 건드리지 않는다.
    // - auto-fit(fitBounds) 결과: 기존 동작과 동일하게 URL(center/zoom)도 갱신되도록 skipUrlSync를 끈다.
    dispatch(
      {
        type: 'MAP_INTERACTION_END',
        payload: {
          center: centerCoord,
          zoom,
          viewportBounds,
          source,
        },
      },
      { skipUrlSync: source !== 'auto-fit' }
    );

    // fitBounds(autoFit) 후에는 idle에서 1회만 해제
    if (autoFitRef.current) autoFitRef.current = false;
  };

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
   * 사용자 지도 인터랙션(드래그/줌) 종료 시 liveState를 업데이트한다.
   * 검색 레벨 변화로 인한 자동 쿼리를 트리거한다.
   */
  const handleMapInteractionEnd = () => {
    if (autoFitRef.current) return;
    if (aggNavigateRef.current) return;
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
        source: 'user',
      },
    });
  };

  /**
   * 집계 마커 클릭 핸들러
   * @description 집계 마커 클릭 후 지도 이동/줌 반영 후 idle에서 bounds를 다시 읽어 커밋한다.
   */
  /**
   * 집계 마커 클릭 핸들러
   * @description 집계 마커 클릭 후 지도 이동/줌 반영 후 idle에서 bounds를 다시 읽어 커밋한다.
   * 이벤트 리스너 등록 순서와 플래그 관리가 중요하다.
   */
  const handleAggregationClick = (_: string, coord: Coord, nextZoom: number) => {
    if (!map.current) return;

    // handleIdle의 간섭을 막기 위해 플래그 설정
    aggNavigateRef.current = true;

    // 동작 수행 *전*에 리스너를 등록해야 놓치지 않음
    naver.maps.Event.once(map.current, 'idle', () => {
      if (!map.current) return;
      const settledCenter = map.current.getCenter();
      const settledZoom = map.current.getZoom();
      const settledBounds = toBoundsSnapshot(map.current.getBounds());

      // 처리 완료 후 플래그 해제
      aggNavigateRef.current = false;

      if (!settledBounds) return;

      dispatch({
        type: 'AGG_MARKER_CLICK',
        payload: {
          bounds: settledBounds,
          center: { lat: settledCenter.y, lng: settledCenter.x },
          zoom: settledZoom,
        },
      });
    });

    const nextLatLng = new naver.maps.LatLng(coord.lat, coord.lng);
    // morph를 사용하여 이동+줌을 원자적으로 처리 (단일 idle 이벤트 보장)
    map.current.morph(nextLatLng, nextZoom);
  };

  /**
   * 마커 클릭 핸들러
   * @description 마커 클릭 시 지도 중심 이동, 상세 정보 표시 및 마커 활성화 처리
   */
  const handleMarkerClick = (item: KindergartenListItemWithMeta) => {
    setSelectedClusterId(null);
    dispatch({ type: 'CENTER_CHANGED', center: item.coord });
    onOpenCard?.(item);
  };

  /**
   * 클러스터 클릭 핸들러
   * @description 클릭된 클러스터의 상세 목록 오버레이 표시
   */
  const handleClusterClick = (item: { id: number; coord: Coord }) => {
    const isOpening = selectedClusterId !== item.id;
    setSelectedClusterId((prev) => (prev === item.id ? null : item.id));

    if (isOpening && map.current) {
      // 콜아웃 오버레이를 중앙에 배치하기 위해 지도 중심을 아래로 이동
      const projection = map.current.getProjection();
      const point = projection.fromCoordToOffset(new naver.maps.LatLng(item.coord.lat, item.coord.lng));
      const offsetPoint = new naver.maps.Point(point.x, point.y - 80);
      const offsetCoord = projection.fromOffsetToCoord(offsetPoint);

      dispatch({
        type: 'CENTER_CHANGED',
        center: { lat: offsetCoord.y, lng: offsetCoord.x },
      });
    } else {
      dispatch({ type: 'CENTER_CHANGED', center: item.coord });
    }
  };

  return (
    <>
      <NaverMap
        gl
        ref={map}
        center={mapCenter}
        zoom={mapZoom}
        isPanto
        minZoom={7}
        maxZoom={19}
        baseTileOpacity={0.88}
        className='relative z-0 h-full w-full'
        onLoad={handleMapLoad}
        onBoundsChanged={handleBoundsChanged}
        onCenterChanged={handleCenterChanged}
        onZoomChanged={handleZoomChanged}
        onInit={handleIdle}
        onIdle={handleIdle}
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

        {/* 지도 집계 마커 (줌레벨 0~12) */}
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

        {/* 개별/클러스터 마커 (줌레벨 13~) */}
        {showBusinessMarkers &&
          clusters.map((feature) => {
            const [lng, lat] = feature.geometry.coordinates as [number, number];

            // 클러스터링 마커
            if (feature.properties.cluster) {
              const cluster = feature as MapCluster;
              const { cluster_id, point_count } = cluster.properties;

              const leaves = supercluster.getLeaves(cluster_id, Infinity);
              const firstLeaf = leaves[0];
              if (!firstLeaf?.properties?.marker) return null;

              // 현재 활성화된 마커가 해당 클러스터에 포함되어 있다면 그 마커를 대표로 표시
              const activeLeaf = leaves.find((leaf) => leaf.properties.marker.id === activeMarkerId);
              const representative = activeLeaf ? activeLeaf.properties.marker : firstLeaf.properties.marker;

              return (
                <MapMarker
                  key={`cluster-${cluster_id}`}
                  position={{ lat, lng }}
                  onClick={() => handleClusterClick({ id: cluster_id, coord: { lat, lng } })}
                  selected={representative.id === activeMarkerId}
                  customIcon={{
                    content: (
                      <div className='relative flex flex-col items-center'>
                        <ClusterBubbleMarker
                          title={representative.title}
                          distance={representative.dist}
                          isBookmarked={representative.isBookmarked}
                          hasMemo={!!representative.memo}
                          totalCount={point_count}
                          selected={representative.id === activeMarkerId}
                        />
                      </div>
                    ),
                  }}
                />
              );
            }

            // 개별 마커(Point)
            const point = feature as MapPoint;
            const { marker, markerId } = point.properties;

            const isSelected = markerId === activeMarkerId;

            return (
              <MapMarker
                key={markerId}
                position={marker.coord}
                onClick={() => handleMarkerClick(marker)}
                selected={isSelected}
                customIcon={{
                  content: !isClusteringZoom(mapState.zoom) ? (
                    // Low/Medium Zoom (< 15): 일반 마커 노출
                    isSelected ? (
                      <PlaceBubbleMarker
                        title={marker.title}
                        distance={marker.dist}
                        selected={true}
                        isBookmarked={marker.isBookmarked}
                        hasMemo={!!marker.memo}
                      />
                    ) : marker.isBookmarked || !!marker.memo ? (
                      <BaseBubbleMarker isBookmarked={marker.isBookmarked} hasMemo={!!marker.memo} />
                    ) : (
                      <DotMarker />
                    )
                  ) : (
                    // High Zoom (>= 15): 상세 마커(PlaceBubble) 노출
                    <PlaceBubbleMarker
                      title={marker.title}
                      distance={marker.dist}
                      selected={isSelected}
                      isBookmarked={marker.isBookmarked}
                      hasMemo={!!marker.memo}
                    />
                  ),
                }}
              />
            );
          })}

        {/* 선택된 클러스터의 콜아웃 오버레이 */}
        {selectedClusterData && (
          <MapMarker
            position={selectedClusterData.coord}
            clickable={false}
            selected={true}
            offset={CALLOUT_Z_INDEX_OFFSET}
            customIcon={{
              content: (
                <div className='relative flex flex-col items-center'>
                  <div className='absolute bottom-full'>
                    <CalloutOverlay
                      items={selectedClusterData.items}
                      totalCount={selectedClusterData.pointCount}
                      onItemClick={(item) => {
                        setSelectedClusterId(null);
                        dispatch({ type: 'CENTER_CHANGED', center: selectedClusterData.coord });
                        onOpenCard?.(item);
                      }}
                    />
                  </div>
                  {/* 클러스터 마커의 높이 */}
                  <div className='w-x10 h-[62px]' />
                </div>
              ),
              align: 'bottom-center',
            }}
          />
        )}

        {/* 정확한 업체가 있을 때 */}
        {showBusinessMarkers && exact && (
          <MapMarker
            key={exact.id}
            position={exact.coord}
            onClick={() => handleMarkerClick(exact)}
            selected={exact.id === activeMarkerId}
            customIcon={{
              content: !isClusteringZoom(mapState.zoom) ? (
                // Low/Medium Zoom (< 15): 일반 마커 노출
                exact.id === activeMarkerId ? (
                  <PlaceBubbleMarker
                    title={exact.title}
                    distance={exact.dist}
                    selected={true}
                    isBookmarked={exact.isBookmarked}
                    hasMemo={!!exact.memo}
                  />
                ) : exact.isBookmarked || !!exact.memo ? (
                  <BaseBubbleMarker isBookmarked={exact.isBookmarked} hasMemo={!!exact.memo} />
                ) : (
                  <DotMarker />
                )
              ) : (
                // High Zoom (>= 15): 상세 마커(PlaceBubble) 노출
                <PlaceBubbleMarker
                  title={exact.title}
                  distance={exact.dist}
                  selected={exact.id === activeMarkerId}
                  isBookmarked={exact.isBookmarked}
                  hasMemo={!!exact.memo}
                />
              ),
            }}
          />
        )}

        {/* 개발용 BBox 디버깅 - 개발 환경에서만 표시 */}
        {process.env.NODE_ENV === 'development' && (
          <BBoxDebug serverBounds={geoBounds} viewportBounds={mapState.viewportBounds} map={map.current} />
        )}
      </NaverMap>
    </>
  );
}
