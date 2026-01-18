import { useMemo } from 'react';
import Supercluster from 'supercluster';
import type { KindergartenListItem } from '@entities/kindergarten';

/**
 * 개별 마커(Point)의 속성 인터페이스
 */
export interface MapPointProperties {
  cluster: false;
  markerId: string;
  marker: KindergartenListItem;
}

/**
 * 클러스터의 속성 인터페이스
 */
export interface MapClusterProperties {
  cluster: true;
  cluster_id: number;
  point_count: number;
  point_count_abbreviated: string | number;
}

/**
 * Supercluster에서 사용하는 Feature 타입 정의
 */
export type MapPoint = Supercluster.PointFeature<MapPointProperties>;
export type MapCluster = Supercluster.ClusterFeature<MapClusterProperties>;
export type MapClusterOrPoint = MapPoint | MapCluster;

export interface UseMapClusteringProps {
  markers: KindergartenListItem[];
  zoom: number;
  bounds?: { swLat: number; swLng: number; neLat: number; neLng: number } | null;
  /** 클러스터링 비활성화 여부 */
  disableClustering?: boolean;
  /** supercluster 옵션 */
  options?: Supercluster.Options<MapPointProperties, MapClusterProperties>;
}

/**
 * Supercluster를 사용하여 마커 클러스터링 데이터를 제공하는 훅
 */
export function useMapClustering({ markers, zoom, bounds, disableClustering = false, options }: UseMapClusteringProps) {
  const supercluster = useMemo(() => {
    const sc = new Supercluster<MapPointProperties, MapClusterProperties>({
      radius: 80,
      maxZoom: 19,
      extent: 256, // 네이버 지도 타일 크기
      ...options,
    });

    const points: MapPoint[] = markers
      .filter((marker) => marker.coord && typeof marker.coord.lat === 'number' && typeof marker.coord.lng === 'number')
      .map((marker) => ({
        type: 'Feature',
        properties: {
          cluster: false,
          markerId: marker.id,
          marker,
        },
        geometry: {
          type: 'Point',
          coordinates: [marker.coord.lng, marker.coord.lat],
        },
      }));

    sc.load(points);
    return sc;
  }, [markers, options]);

  const clusters = useMemo(() => {
    if (!bounds) return [];

    const bbox: [number, number, number, number] = [bounds.swLng, bounds.swLat, bounds.neLng, bounds.neLat];

    // 클러스터링 비활성화 상태에서는 현재 영역에 포함된 모든 개별 마커를 PointFeature 형태로 반환
    if (disableClustering) {
      return markers
        .filter((m) => {
          return (
            m.coord &&
            typeof m.coord.lat === 'number' &&
            typeof m.coord.lng === 'number' &&
            m.coord.lat >= bounds.swLat &&
            m.coord.lat <= bounds.neLat &&
            m.coord.lng >= bounds.swLng &&
            m.coord.lng <= bounds.neLng
          );
        })
        .map(
          (m): MapPoint => ({
            type: 'Feature',
            id: m.id,
            properties: {
              cluster: false,
              markerId: m.id,
              marker: m,
            },
            geometry: {
              type: 'Point',
              coordinates: [m.coord.lng, m.coord.lat],
            },
          })
        );
    }

    // supercluster를 통해 클러스터 및 개별 마커(Point)를 계산하여 반환
    const results = supercluster.getClusters(bbox, Math.round(zoom));
    return results;
  }, [supercluster, zoom, bounds, disableClustering, markers]);

  return {
    supercluster,
    clusters,
  };
}
