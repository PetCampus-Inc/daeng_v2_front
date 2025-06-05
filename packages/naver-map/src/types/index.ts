export type OverlayOffset = { x?: number; y?: number };

export type OverlayDirection = 'top' | 'bottom' | 'left' | 'right' | 'center';

export interface OverlayOptions {
  /** 오버레이 컨텐츠 */
  content: React.ReactNode;
  /** 오버레이 좌표 */
  position: naver.maps.Coord | naver.maps.CoordLiteral;
  /** 오버레이 레이어 순서 */
  zIndex?: number;
}
