import type { BoundsSnapshot } from './searchMachine';
import type { Bounds } from '@shared/types';

function isLatLngBounds(bounds?: naver.maps.Bounds | null): bounds is naver.maps.LatLngBounds {
  return !!bounds && bounds instanceof naver.maps.LatLngBounds;
}

export function toBoundsSnapshot(bounds?: naver.maps.Bounds | null): BoundsSnapshot | null {
  if (!isLatLngBounds(bounds)) return null;

  const sw = bounds.getSW();
  const ne = bounds.getNE();

  return {
    swLat: sw.y,
    swLng: sw.x,
    neLat: ne.y,
    neLng: ne.x,
  };
}

export function boundsSnapshotToBounds(snapshot: BoundsSnapshot | null): Bounds | null {
  if (!snapshot) return null;

  return {
    sw: { lat: snapshot.swLat, lng: snapshot.swLng },
    ne: { lat: snapshot.neLat, lng: snapshot.neLng },
  };
}
