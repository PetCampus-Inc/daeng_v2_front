export interface NaverMapOptions extends naver.maps.MapOptions {
  currentCenter?: boolean;
  userLocationMarker?: boolean;
}

export type OverlayOffset = { x?: number; y?: number };

export type OverlayDirection = 'top' | 'bottom' | 'left' | 'right' | 'center';

export interface OverlayOptions {
  content: React.ReactNode;
  position: naver.maps.Coord | naver.maps.CoordLiteral;
  zIndex?: number;
}
