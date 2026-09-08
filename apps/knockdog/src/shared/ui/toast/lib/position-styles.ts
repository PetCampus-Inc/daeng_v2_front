import type { ToastPosition } from '@knockdog/bridge-core';

/**
 * Toast position 프리셋
 * 앱의 레이아웃에 맞는 위치 매핑
 */
export const POSITION_STYLES: Record<ToastPosition, string> = {
  top: 'top-4 left-1/2 w-full max-w-120 webview:max-w-full -translate-x-1/2',
  // 바텀탭 위 16px (네이티브 웹뷰에서는 --bottom-bar-height가 0이라 자연히 16px만 적용됨)
  // max-w-120: 웹 데스크톱에서 앱 셸과 동일 폭으로 제한 (100vw 기준이면 브라우저 전체로 늘어남)
  bottom:
    'bottom-[calc(var(--bottom-bar-height,0px)+16px)] left-1/2 w-full max-w-120 webview:max-w-full -translate-x-1/2',
  'bottom-above-nav': 'bottom-[68px] left-1/2 w-full max-w-120 webview:max-w-full -translate-x-1/2',
} as const;

export function getPositionClassName(position: ToastPosition): string {
  return POSITION_STYLES[position];
}
