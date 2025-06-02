import { OverlayDirection } from '../types';

export function getOverlayPositionStyle(
  direction: OverlayDirection,
  offset?: { x?: number; y?: number }
) {
  // 기본 스타일 객체
  const style: React.CSSProperties = {
    position: 'absolute',
  };

  // 방향에 따른 기본 위치 설정
  switch (direction) {
    case 'top':
      style.left = '50%';
      style.bottom = '100%';
      style.transform = 'translateX(-50%)';
      break;
    case 'bottom':
      style.left = '50%';
      style.top = '100%';
      style.transform = 'translateX(-50%)';
      break;
    case 'left':
      style.right = '100%';
      style.top = '50%';
      style.transform = 'translateY(-50%)';
      break;
    case 'right':
      style.left = '100%';
      style.top = '50%';
      style.transform = 'translateY(-50%)';
      break;
    case 'center':
    default:
      style.left = '50%';
      style.top = '50%';
      style.transform = 'translate(-50%, -50%)';
      break;
  }

  // offset이 있으면 margin으로 추가 조정
  if (offset) {
    const { x = 0, y = 0 } = offset;

    // 방향에 따라 적절한 margin 설정
    if (direction.includes('top')) {
      style.marginBottom = `${y}px`;
    } else if (direction.includes('bottom')) {
      style.marginTop = `${y}px`;
    } else if (direction === 'center') {
      style.marginTop = `${y}px`;
    }

    if (direction.includes('left')) {
      style.marginRight = `${x}px`;
    } else if (direction.includes('right')) {
      style.marginLeft = `${x}px`;
    } else if (
      direction === 'center' ||
      direction === 'top' ||
      direction === 'bottom'
    ) {
      style.marginLeft = `${x}px`;
    }
  }

  return style;
}
