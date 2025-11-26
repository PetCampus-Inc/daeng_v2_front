import { createParser, parseAsInteger, useQueryState } from 'nuqs';
import { DEFAULT_SEARCH_MODE, SEARCH_MODES } from '../config/map';

const CENTER_PARSER = createParser<{ lat: number; lng: number }>({
  parse: (value: string) => {
    if (!value) return null;
    const [latRaw, lngRaw] = value.split(',');
    const lat = Number.parseFloat(latRaw ?? '');
    const lng = Number.parseFloat(lngRaw ?? '');
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  },
  serialize: (value) => `${value.lat},${value.lng}`,
  eq: (a, b) => a.lat === b.lat && a.lng === b.lng,
});

export type SearchMode = 'nearby' | 'boundary';

const SEARCH_MODE_PARSER = createParser<SearchMode>({
  parse: (value: string) => {
    if (value === SEARCH_MODES.NEARBY || value === SEARCH_MODES.BOUNDARY) {
      return value;
    }
    return DEFAULT_SEARCH_MODE;
  },
  serialize: (value) => value,
});

/**
 * Kindergarten Map URL 상태를 관리하는 훅
 *
 * @description
 * - center: 지도 중심 좌표
 * - zoomLevel: 지도 줌레벨
 * - searchedLevel: 이전 검색에 사용된 행정구역 스케일
 * - searchMode: 검색 모드 (nearby: 내주변 검색, boundary: 바운더리 검색)
 */
export function useMapUrlState() {
  const [center, setCenter] = useQueryState('center', CENTER_PARSER);
  const [zoomLevel, setZoomLevel] = useQueryState('zoom', parseAsInteger);

  /**
   * 이전 검색에 사용된 행정구역 스케일
   * 1: 광역시/도, 2: 시/군/구, 3: 읍/면/동
   *
   * 현재 지도 줌레벨과 비교하여 행정구역 단위가 변경되었을 때만
   * 새로운 검색 요청을 실행하기 위한 기준값
   */
  const [searchedLevel, setSearchedLevel] = useQueryState('searchedLevel', parseAsInteger);

  /**
   * 검색 모드
   * - nearby: 내주변 검색 (distance 기반, 반경 검색)
   * - boundary: 바운더리 검색 (bounds 기반, 지도 영역 검색)
   */
  const [searchMode, setSearchMode] = useQueryState('searchMode', SEARCH_MODE_PARSER.withDefault(DEFAULT_SEARCH_MODE));

  return {
    center,
    zoomLevel,
    searchedLevel,
    searchMode,
    setCenter,
    setZoomLevel,
    setSearchedLevel,
    setSearchMode,
  };
}
