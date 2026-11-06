import { Marker } from '@knockdog/react-naver-map';
import { ACTIVE_Z_INDEX_OFFSET } from '../config/map';
import { useEffect, useRef } from 'react';

export function MapMarker({
  selected,
  offset = ACTIVE_Z_INDEX_OFFSET,
  ...props
}: React.ComponentProps<typeof Marker> & { selected?: boolean; offset?: number }) {
  const markerRef = useRef<naver.maps.Marker | null>(null);
  /**
   * appliedOffsetRef는 현재 마커 인스턴스에 적용된 오프셋 값을 추적합니다.
   * Naver Map Marker의 setZIndex는 절대값을 설정하므로,
   * 리렌더링 시 중복 가산/감산을 방지하고 정확한 차이만큼만 반영하기 위해 필요합니다.
   */
  const appliedOffsetRef = useRef(0);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    const targetOffset = selected ? offset : 0;
    const diff = targetOffset - appliedOffsetRef.current;

    if (diff !== 0) {
      marker.setZIndex(marker.getZIndex() + diff);
      appliedOffsetRef.current = targetOffset;
    }
  }, [selected, offset]);

  return <Marker ref={markerRef} {...props} />;
}
