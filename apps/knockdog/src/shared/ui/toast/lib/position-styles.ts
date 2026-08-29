import type { ToastPosition } from '@knockdog/bridge-core';

/**
 * Toast position 프리셋
 * 앱의 레이아웃에 맞는 위치 매핑
 */
export const POSITION_STYLES: Record<ToastPosition, string> = {
  top: 'top-4 left-1/2 -translate-x-1/2',
  // 바텀탭 위 16px (네이티브 웹뷰에서는 --bottom-bar-height가 0이라 자연히 16px만 적용됨)
  bottom: 'bottom-[calc(var(--bottom-bar-height,0px)+16px)] left-1/2 -translate-x-1/2',
  'bottom-above-nav': 'bottom-[68px] left-1/2 -translate-x-1/2', // 하단 네비게이션 높이
} as const;

export function getPositionClassName(position: ToastPosition): string {
  return POSITION_STYLES[position];
}
