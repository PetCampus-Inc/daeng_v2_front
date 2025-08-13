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
  onAggregationClick?: (nextZoom: number) => void;
  selectedMarkerId?: string | null;
  center: { lat: number; lng: number };
  zoom?: number;
  onLoad?: (map: naver.maps.Map) => void;
  onDragStart?: (pointerEvent: naver.maps.PointerEvent) => void;
  onDragEnd?: (pointerEvent: naver.maps.PointerEvent) => void;
  onPinchStart?: (pointerEvent: naver.maps.PointerEvent) => void;
  onPinchEnd?: (pointerEvent: naver.maps.PointerEvent) => void;
  onBoundsChanged?: (bounds: naver.maps.Bounds) => void;
  onCenterChanged?: (center: naver.maps.Coord) => void;
  onZoomStart?: () => void;
  onZoomChanged?: (zoom: number) => void;
  onZoomEnd?: () => void;
  onDrag?: (pointerEvent: naver.maps.PointerEvent) => void;
  onIdle?: () => void;
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
  } = props;

  const { data: current } = useGeolocationQuery();

  return (
    <>
      <Map
        ref={ref}
        center={center}
        zoom={zoom}
        baseTileOpacity={0.88}
        isPanto
        onLoad={props.onLoad}
        onBoundsChanged={props.onBoundsChanged}
        onCenterChanged={props.onCenterChanged}
        onZoomChanged={props.onZoomChanged}
        onIdle={props.onIdle}
        onDragStart={props.onDragStart}
        onDragEnd={props.onDragEnd}
        onPinchStart={props.onPinchStart}
        onPinchEnd={props.onPinchEnd}
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
              onClick={() => onAggregationClick?.(aggregation.nextZoom)}
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
