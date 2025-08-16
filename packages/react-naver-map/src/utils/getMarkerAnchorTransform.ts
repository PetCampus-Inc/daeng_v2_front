export type MarkerAnchor =
  | 'center'
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'left-center'
  | 'left-top'
  | 'left-bottom'
  | 'right-top'
  | 'right-center'
  | 'right-bottom'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export function getTranslatePercentByPosition(pos: MarkerAnchor | undefined): { xPercent: number; yPercent: number } {
  const p: MarkerAnchor = pos ?? 'bottom-center';
  switch (p) {
    case 'center':
      return { xPercent: -50, yPercent: -50 };
    case 'top-left':
      return { xPercent: 0, yPercent: 0 };
    case 'top-center':
      return { xPercent: -50, yPercent: 0 };
    case 'top-right':
      return { xPercent: -100, yPercent: 0 };
    case 'left-center':
      return { xPercent: 0, yPercent: -50 };
    case 'left-top':
      return { xPercent: 0, yPercent: 0 };
    case 'left-bottom':
      return { xPercent: 0, yPercent: -100 };
    case 'right-top':
      return { xPercent: -100, yPercent: 0 };
    case 'right-center':
      return { xPercent: -100, yPercent: -50 };
    case 'right-bottom':
      return { xPercent: -100, yPercent: -100 };
    case 'bottom-left':
      return { xPercent: 0, yPercent: -100 };
    case 'bottom-center':
      return { xPercent: -50, yPercent: -100 };
    case 'bottom-right':
      return { xPercent: -100, yPercent: -100 };
    default:
      return { xPercent: -50, yPercent: -100 };
  }
}

export function getMarkerAnchorTransform(align: MarkerAnchor | undefined, offsetX: number, offsetY: number): string {
  const { xPercent, yPercent } = getTranslatePercentByPosition(align);
  const x = `calc(${xPercent}% + ${offsetX}px)`;
  const y = `calc(${yPercent}% + ${offsetY}px)`;
  return `translate3d(${x}, ${y}, 0)`;
}
