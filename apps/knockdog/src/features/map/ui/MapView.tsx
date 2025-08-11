import { Map, Marker } from '@knockdog/react-naver-map';

// import { ClusterMarker } from './ClusterMarker';
import { PlaceMarker } from './PlaceMarker';
import { CurrentLocationMarker } from './CurrentLocationMarker';
import { useGeolocationQuery } from '@shared/lib';

interface OverlayInfo {
  id: string;
  coord: { lat: number; lng: number };
  title: string;
  dist: number;
}
interface MapViewProps {
  ref: React.RefObject<naver.maps.Map | null>;
  overlays?: OverlayInfo[];
  onMarkerClick?: (id: string, coord: { lat: number; lng: number }) => void;
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
  const { ref, center, overlays = [], onMarkerClick, selectedMarkerId, zoom } = props;

  const { data: current } = useGeolocationQuery();

  return (
    <>
      <Map
        ref={ref}
        center={center}
        zoom={zoom}
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

        {/* <Overlay position={{ lat: 37.54, lng: 127.07 }}>
          <ClusterMarker label='광진구' count={overlays.length} />
        </Overlay> */}

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
