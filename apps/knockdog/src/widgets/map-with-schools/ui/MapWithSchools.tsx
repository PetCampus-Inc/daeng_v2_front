'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Float, Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import { useMapState } from '../model/useMapState';
import { isSameCoord, isValidBounds, isValidCoord } from '../utils/is';
import { getRegionLevel } from '../utils/zoom-level';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM_LEVEL } from '../config/map';
import { overlay } from 'overlay-kit';
import { CurrentLocationDisplayFAB, CurrentLocationFAB, ListFAB, MapView, RefreshFAB } from '@features/map';
import { dogSchoolListOptions, DogSchoolCardSheet, DogSchoolListSheet } from '@features/dog-school';
import { useBasePoint, useBottomSheetSnapIndex } from '@shared/lib';
import { useMarkerState } from '@shared/store';

export function MapWithSchools() {
  const map = useRef<naver.maps.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const { coord: basePoint } = useBasePoint();

  /** 지도 상태(라이브, URL 연동) */
  const { center, zoomLevel, searchedLevel, setCenter, setZoomLevel, setSearchedLevel } = useMapState();

  /**
   * 지도 상태 스냅샷
   * - 쿼리 요청 시 사용될 커밋된 지도 상태
   */
  const [mapSnapshot, setMapSnapshot] = useState<{
    center: { lat?: number; lng?: number } | null;
    bounds: naver.maps.LatLngBounds | null;
    zoomLevel: number;
  }>({
    center: null,
    bounds: null,
    zoomLevel: 0,
  });

  const searchParams = useSearchParams();
  const { activeMarkerId, setActiveMarker } = useMarkerState();
  const { isFullExtended, setSnapIndex } = useBottomSheetSnapIndex();

  /**
   * 검색 쿼리
   * - 커밋된 스냅샷이 완성되고, 지도 로드가 끝난 경우에만 실행
   */
  const { data } = useInfiniteQuery({
    ...dogSchoolListOptions.searchList({
      refPoint: basePoint!,
      bounds: mapSnapshot.bounds!,
      zoomLevel: mapSnapshot.zoomLevel,
    }),
    enabled:
      isMapLoaded && isValidCoord(basePoint) && isValidBounds(mapSnapshot.bounds) && Boolean(mapSnapshot.zoomLevel),
  });

  const mapCenter = isValidCoord(center) ? center : isValidCoord(basePoint) ? basePoint : DEFAULT_MAP_CENTER;

  const allSchools = data?.pages?.flatMap((page) => page.schoolResult.list) || [];

  const aggregations = data?.pages?.flatMap(
    (page) => page.aggregations.sidoAggregations ?? page.aggregations.sigunAggregations ?? []
  );

  /** 지도 초기 설정 (mapState 초기화) */
  useEffect(() => {
    if (!isMapLoaded || isValidCoord(center) || !isValidCoord(basePoint)) return;

    map.current?.setCenter(basePoint);
    setCenter(basePoint);
    setZoomLevel(DEFAULT_MAP_ZOOM_LEVEL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapLoaded, center, basePoint]);

  /** 커밋된 상태 초기화 */
  useEffect(() => {
    if (!isMapLoaded || mapSnapshot.center !== null) return;

    const initialCenter = center ? { lat: center.lat, lng: center.lng } : isValidCoord(basePoint) ? basePoint : null;
    const initialZoom = zoomLevel || DEFAULT_MAP_ZOOM_LEVEL;
    const initialBounds = map.current?.getBounds() as naver.maps.LatLngBounds;

    if (!initialCenter) return;
    setMapSnapshot({
      center: initialCenter,
      bounds: initialBounds,
      zoomLevel: initialZoom,
    });

    const initialLevel = getRegionLevel(initialZoom);
    setSearchedLevel(initialLevel);
  }, [isMapLoaded, center, basePoint, zoomLevel, mapSnapshot.center, setSearchedLevel]);

  /**
   * 지도 로드 핸들러
   * - 지도의 center, zoom 업데이트
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
   * 새로고침 핸들러
   * - 현재 mapState를 스냅샷으로 저장
   */
  const handleRefresh = () => {
    if (!isValidCoord(basePoint) || !zoomLevel) return;

    setMapSnapshot({
      center: { lat: center?.lat, lng: center?.lng },
      bounds: map.current?.getBounds() as naver.maps.LatLngBounds,
      zoomLevel,
    });
  };

  /**
   * 집계 마커 클릭 핸들러
   * - 집계 마커 클릭 시 center, zoom 변경
   */
  const handleAggregationClick = (code: string, coord: { lat: number; lng: number }, nextZoom: number) => {
    map.current?.setCenter(coord);
    map.current?.setZoom(nextZoom, true);
  };

  /**
   * 마커 클릭 핸들러
   * - 마커 클릭 시 지도 중심 이동 및 상세 정보 표시
   */
  const handleMarkerClick = (id: string, coord: { lat: number; lng: number }) => {
    map.current?.panTo(coord);
    setActiveMarker(id);
    openDogSchoolCardSheet(id);
  };

  /**
   * 줌 변경 완료 핸들러
   * - 줌 변경 완료 시 local state(center) 업데이트
   * - 검색 레벨 비교 후 스냅샷 저장
   */
  const handleZoomEnd = () => {
    if (!map.current) return;

    const coord = map.current.getCenter();
    const bounds = map.current.getBounds() as naver.maps.LatLngBounds;
    const zoom = map.current.getZoom();
    setCenter({ lat: coord.y, lng: coord.x });

    const currentLevel = getRegionLevel(zoom);

    if (searchedLevel !== null && currentLevel !== searchedLevel && isValidCoord(basePoint)) {
      setMapSnapshot({
        center: { lat: coord.y, lng: coord.x },
        bounds,
        zoomLevel: zoom,
      });
      setSearchedLevel(currentLevel);
    }
  };

  const openDogSchoolCardSheet = (id: string) => {
    overlay.open(({ isOpen, close }) => {
      const selectedSchool = allSchools.find((school) => school.id === id);

      if (!selectedSchool) return null;

      return (
        <DogSchoolCardSheet
          isOpen={isOpen}
          close={() => {
            setActiveMarker(null);
            close();
          }}
          {...selectedSchool}
          images={selectedSchool.images || []}
        />
      );
    });
  };

  const shouldShowRefresh = useMemo(() => {
    return !(isSameCoord(center, mapSnapshot.center) && zoomLevel === mapSnapshot.zoomLevel);
  }, [center, zoomLevel, mapSnapshot.center, mapSnapshot.zoomLevel]);

  return (
    <>
      <MapView
        ref={map}
        overlays={allSchools.map((school) => ({
          id: school.id,
          coord: { lat: school.coord.lat, lng: school.coord.lng },
          title: school.title,
          dist: school.dist,
        }))}
        aggregations={aggregations}
        onMarkerClick={handleMarkerClick}
        onAggregationClick={handleAggregationClick}
        selectedMarkerId={activeMarkerId}
        center={mapCenter}
        zoom={zoomLevel ?? DEFAULT_MAP_ZOOM_LEVEL}
        onLoad={handleMapLoad}
        onDragEnd={() => {
          if (!map.current) return;
          const coord = map.current.getCenter();
          setCenter({ lat: coord.y, lng: coord.x });
        }}
        onZoomChanged={(zoom) => {
          setZoomLevel(zoom);
        }}
        onZoomEnd={handleZoomEnd}
      />

      <div
        className={cn(
          'px-x4 pb-x2 absolute top-0 z-50 w-full pt-[calc(env(safe-area-inset-top)+16px)] transition-colors ease-out',
          isFullExtended && 'bg-fill-secondary-0'
        )}
      >
        <Link href={`/search${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}>
          <div className='radius-r2 border-line-600 bg-fill-secondary-0 px-x4 flex h-[48px] items-center border'>
            <Icon icon='Search' className='size-x5 text-fill-secondary-700 mr-x2' />
            <div role='button' aria-label='검색창 열기' className='text-text-tertiary body1-regular flex-1'>
              업체 또는 주소를 검색하세요
            </div>
          </div>
        </Link>
      </div>

      <DogSchoolListSheet
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
      />
    </>
  );
}
