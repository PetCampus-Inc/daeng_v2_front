import { NaverMap, Overlay } from '@knockdog/naver-map';
import { ClusterMarker } from './ClusterMarker';
import { PlaceMarker } from './PlaceMarker';
import { useCurrentLocation } from '@shared/lib';
import { CurrentLocationMarker } from '@shared/ui/naver-map/CurrentLocationMarker';

const overlays = [
  {
    id: '12',
    position: { lat: 37.5440453, lng: 127.0722356 },
    title: '겨울나그네레스토랑',
    distance: 1.2,
  },
  {
    id: '2',
    position: { lat: 37.623465, lng: 127.153074 },
    title: '총각네횟집다산점',
    distance: 1.4,
  },
  {
    id: '3',
    position: { lat: 37.623426, lng: 127.151928 },
    title: '빅파이브',
    distance: 1,
  },
];

interface MapViewProps {
  onMarkerClick?: (id: string) => void;
  selectedMarkerId?: string | null;
}

export function MapView(props: MapViewProps) {
  const { onMarkerClick, selectedMarkerId } = props;
  const currentLocation = useCurrentLocation();

  return (
    <NaverMap center={currentLocation} className='relative h-full w-full'>
      {/* 현재 위치 마커 */}
      <CurrentLocationMarker />

      <Overlay
        id='cluster'
        position={{ lat: 37.54, lng: 127.07 }}
        content={<ClusterMarker label='광진구' count={99} />}
      />

      {/* 장소 오버레이 */}
      {overlays.map((overlay) => {
        const isSelected = selectedMarkerId === overlay.id;

        return (
          <Overlay
            key={overlay.id}
            id={overlay.id}
            position={overlay.position}
            zIndex={isSelected ? 10 : undefined}
            direction='top'
            offset={{ y: 12 }}
            content={
              <PlaceMarker
                title={overlay.title}
                distance={overlay.distance}
                selected={isSelected}
                onClick={() => onMarkerClick?.(overlay.id)}
              />
            }
          />
        );
      })}
    </NaverMap>
  );
}
