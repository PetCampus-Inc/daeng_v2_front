import { createParser, parseAsInteger, useQueryState } from 'nuqs';

const CENTER_PARSER = createParser<{ lat: number; lng: number }>({
  parse: (value: string) => {
    if (!value) return null;
    const [lngRaw, latRaw] = value.split(',');
    const lat = Number.parseFloat(latRaw ?? '');
    const lng = Number.parseFloat(lngRaw ?? '');
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  },
  serialize: (value) => `${value.lng},${value.lat}`,
  eq: (a, b) => a.lat === b.lat && a.lng === b.lng,
});

export function useMapState() {
  const [center, setCenter] = useQueryState('center', CENTER_PARSER);
  const [zoomLevel, setZoomLevel] = useQueryState('zoom', parseAsInteger);

  /**
   * 이전 검색에 사용된 행정구역 단위 스케일
   * 1: 광역시/도, 2: 시/군/구, 3: 읍/면/동
   *
   * 현재 지도 줌레벨과 비교하여 행정구역 단위가 변경되었을 때만
   * 새로운 검색 요청을 실행하기 위한 기준값
   */
  const [searchedLevel, setSearchedLevel] = useQueryState('searchedLevel', parseAsInteger);

  return {
    center,
    zoomLevel,
    searchedLevel,
    setCenter,
    setZoomLevel,
    setSearchedLevel,
  };
}
