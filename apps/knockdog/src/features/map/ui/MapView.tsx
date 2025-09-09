import { Map, Marker } from '@knockdog/react-naver-map';
import { PlaceMarker } from './PlaceMarker';
import { CurrentLocationMarker } from './CurrentLocationMarker';
import { AggregationMarker } from './AggregationMarker';
import { useGeolocationQuery } from '@shared/lib';

interface OverlayInfo {
  id: string;
  coord: { lat: number; lng: number };
  title: string;
  dist: number;
}

interface AggregationInfo {
  code: string;
  count: number;
  label: string;
  coord: { lat: number; lng: number };
  nextZoom: number;
}

interface MapViewProps {
  ref: React.RefObject<naver.maps.Map | null>;
  overlays?: OverlayInfo[];
  aggregations?: AggregationInfo[];
  onMarkerClick?: (id: string, coord: { lat: number; lng: number }) => void;
  onAggregationClick?: (code: string, coord: { lat: number; lng: number }, nextZoom: number) => void;
  selectedMarkerId?: string | null;
  center: { lat: number; lng: number };
  zoom?: number;
  current?: { lat: number; lng: number };
  onLoad?: (map: naver.maps.Map) => void;
  onDragStart?: (pointerEvent: naver.maps.PointerEvent) => void;
  onDragEnd?: (pointerEvent: naver.maps.PointerEvent) => void;
  onZoomStart?: () => void;
  onZoomChanged?: (zoom: number) => void;
  onZoomEnd?: () => void;
}

export function MapView(props: MapViewProps) {
  const {
    ref,
    center,
    overlays = [],
    aggregations = [],
    onMarkerClick,
    onAggregationClick,
    selectedMarkerId,
    zoom,
    current: currentFromProps,
  } = props;

  const { data: currentFromGeolocation } = useGeolocationQuery();

  // props로 받은 current가 있으면 우선 사용, 없으면 geolocation에서 가져온 값 사용
  const current = currentFromProps || currentFromGeolocation;

  return (
    <>
      <Map
        ref={ref}
        center={center}
        zoom={zoom}
        isPanto
        baseTileOpacity={0.88}
        onLoad={props.onLoad}
        onZoomChanged={props.onZoomChanged}
        onDragStart={props.onDragStart}
        onDragEnd={props.onDragEnd}
        onZoomStart={props.onZoomStart}
        onZoomEnd={props.onZoomEnd}
        className='relative h-full w-full'
        minZoom={7}
        maxZoom={19}
      >
        {/* 현재 위치 마커 */}
        {current && (
          <Marker
            position={current}
            customIcon={{
              content: <CurrentLocationMarker />,
              align: 'center',
            }}
          />
        )}

        {/* 지도 집계 마커 */}
        {aggregations.map((aggregation) => {
          return (
            <Marker
              key={aggregation.code}
              position={aggregation.coord}
              onClick={() => onAggregationClick?.(aggregation.code, aggregation.coord, aggregation.nextZoom)}
              customIcon={{
                content: <AggregationMarker label={aggregation.label} count={aggregation.count} />,
                align: 'center',
              }}
            />
          );
        })}

        {/* TODO: 클러스터링 로직 추가 */}
        {overlays.map((overlay) => {
          const isSelected = selectedMarkerId === overlay.id;
          return (
            <Marker
              key={overlay.id}
              position={overlay.coord}
              zIndex={isSelected ? 10 : undefined}
              onClick={() => onMarkerClick?.(overlay.id, overlay.coord)}
              customIcon={{
                content: <PlaceMarker title={overlay.title} distance={overlay.dist.toFixed(2)} selected={isSelected} />,
                offsetY: 12,
              }}
            />
          );
        })}
      </Map>
    </>
  );
}
