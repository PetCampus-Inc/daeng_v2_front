import type { ToastPosition } from '../model/types';

/**
 * Toast position 프리셋
 * 앱의 레이아웃에 맞는 위치 매핑
 */
export const POSITION_STYLES: Record<ToastPosition, string> = {
  top: 'top-4 left-1/2 -translate-x-1/2',
  bottom: 'bottom-4 left-1/2 -translate-x-1/2',
  'bottom-above-nav': 'bottom-[68px] left-1/2 -translate-x-1/2', // 하단 네비게이션 높이
} as const;

export function getPositionClassName(position: ToastPosition): string {
  return POSITION_STYLES[position];
}
