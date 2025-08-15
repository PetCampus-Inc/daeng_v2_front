'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Float, Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import { useMapState } from '../model/useMapState';
import { isSameBounds, isSameCoord, isValidBounds, isValidCoord } from '../model/is';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM_LEVEL } from '../config';
import { CurrentLocationDisplayFAB, CurrentLocationFAB, ListFAB, MapView, RefreshFAB } from '@features/map';
import { dogSchoolListOptions } from '@features/dog-school/api/dogschool-list-query';
import { DogSchoolCardSheet, DogSchoolListSheet } from '@features/dog-school';
import { useBasePoint, useBottomSheetSnapIndex } from '@shared/lib';
import { useMarkerState } from '@shared/store';

export function MapWithSchools() {
  const map = useRef<naver.maps.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const { coord: basePoint } = useBasePoint();

  /** 지도 상태(라이브, URL 연동) */
  const { center, bounds, zoomLevel, setCenter, setBounds, setZoomLevel } = useMapState();

  /**
   * 지도 상태 스냅샷
   * - 쿼리 요청 시 사용될 커밋된 지도 상태
   * - Refresh 시점의 center/bounds/zoomLevel을 저장
   */
  const [mapSnapshot, setMapSnapshot] = useState<{
    refPoint: { lat: number; lng: number } | null;
    bounds: naver.maps.LatLngBounds | null;
    zoomLevel: number;
  }>({
    refPoint: null,
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
      refPoint: mapSnapshot.refPoint!,
      bounds: mapSnapshot.bounds!,
      zoomLevel: mapSnapshot.zoomLevel,
    }),
    enabled:
      isMapLoaded &&
      isValidCoord(mapSnapshot.refPoint) &&
      isValidBounds(mapSnapshot.bounds) &&
      Boolean(mapSnapshot.zoomLevel),
  });

  const mapCenter = isValidCoord(center) ? center : isValidCoord(basePoint) ? basePoint : DEFAULT_MAP_CENTER;

  const allSchools = data?.pages?.flatMap((page) => page.schoolResult.list) || [];

  const selectedSchool = allSchools.find((school) => school.id === activeMarkerId);

  const handleRefresh = () => {
    if (!isValidCoord(center) || !isValidBounds(bounds)) return;

    // 현재 화면 상태를 커밋된 상태로 업데이트
    setMapSnapshot({
      refPoint: { lat: center?.lat, lng: center?.lng },
      bounds,
      zoomLevel,
    });
  };

  /**
   * 초기 동기화
   * - URL center가 없고 basePoint가 준비되면 center로 설정
   * - 지도 초기화 직후 "실제 중심"으로 맞추기 위함
   */
  useEffect(() => {
    if (!isMapLoaded || isValidCoord(center) || !isValidCoord(basePoint)) return;
    setCenter(basePoint);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapLoaded, center, basePoint]);

  /** 커밋된 상태 초기화 */
  useEffect(() => {
    if (!isMapLoaded || mapSnapshot.refPoint !== null) return;

    const queryCenter = center ?? basePoint;
    if (isValidCoord(queryCenter) && isValidBounds(bounds)) {
      setMapSnapshot({
        refPoint: queryCenter,
        bounds,
        zoomLevel: zoomLevel || DEFAULT_MAP_ZOOM_LEVEL,
      });
    }
  }, [isMapLoaded, center, basePoint, bounds, zoomLevel, mapSnapshot.refPoint]);

  const handleMarkerClick = (id: string, coord: { lat: number; lng: number }) => {
    map.current?.panTo(coord);
    setActiveMarker(id);
  };

  const handleBottomSheetClose = (isOpen: boolean) => {
    if (!isOpen) {
      setActiveMarker(null);
    }
  };

  const shouldShowRefresh = useMemo(() => {
    return !(
      isSameCoord(center, mapSnapshot.refPoint) &&
      isSameBounds(bounds, mapSnapshot.bounds) &&
      zoomLevel === mapSnapshot.zoomLevel
    );
  }, [center, bounds, zoomLevel, mapSnapshot.refPoint, mapSnapshot.bounds, mapSnapshot.zoomLevel]);

  return (
    <>
      {/* 지도 배경 오버레이 */}
      <div className='bg-primitive-neutral-50/12 z-2 pointer-events-none absolute top-0 h-full w-full touch-none' />
      {/* 지도 */}
      <MapView
        ref={map}
        overlays={allSchools.map((school) => ({
          id: school.id,
          coord: { lat: school.coord.lat, lng: school.coord.lng },
          title: school.title,
          dist: school.dist,
        }))}
        onMarkerClick={handleMarkerClick}
        selectedMarkerId={activeMarkerId}
        center={mapCenter}
        zoom={zoomLevel}
        onLoad={(map) => {
          setIsMapLoaded(true);
          setBounds(map.getBounds() as naver.maps.LatLngBounds);
          setZoomLevel(map.getZoom() as number);
        }}
        onDragEnd={() => {
          if (!map.current) return;
          const coord = map.current.getCenter();
          setCenter({ lat: coord.y, lng: coord.x });
          setBounds(map.current.getBounds() as naver.maps.LatLngBounds);
        }}
        onZoomChanged={(zoom) => {
          setZoomLevel(zoom);
        }}
        onZoomEnd={() => {
          if (!map.current) return;
          const coord = map.current.getCenter();
          setCenter({ lat: coord.y, lng: coord.x });
          setBounds(map.current.getBounds() as naver.maps.LatLngBounds);
        }}
        onPinchEnd={() => {
          if (!map.current) return;
          const coord = map.current.getCenter();
          setCenter({ lat: coord.y, lng: coord.x });
          setBounds(map.current.getBounds() as naver.maps.LatLngBounds);
        }}
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
      {selectedSchool && (
        <DogSchoolCardSheet isOpen={!!activeMarkerId} onChangeOpen={handleBottomSheetClose} {...selectedSchool} />
      )}
    </>
  );
}
