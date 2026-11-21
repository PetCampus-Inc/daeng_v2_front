import type { ToastPosition } from '@knockdog/bridge-core';

/** 하단 CTA 버튼 윗면까지의 거리를 담는 CSS 변수. 아래 bottom 클래스의 변수 이름과 같아야 한다. */
export const TOAST_BOTTOM_OFFSET_VAR = '--toast-bottom-offset';

/** 토스트 아래 간격을 담는 CSS 변수. 아래 bottom 클래스의 변수 이름과 같아야 한다. */
export const TOAST_BOTTOM_GAP_VAR = '--toast-bottom-gap';

/** 하단 CTA 버튼 위 간격(px) — 디자인 스펙 */
export const TOAST_GAP_ABOVE_CTA = 16;

/** 하단 탭바 위 간격(px) — 디자인 스펙 */
export const TOAST_GAP_ABOVE_BOTTOM_NAV = 16;

/** 하단에 CTA도 탭바도 없을 때 Safe Area 위 간격(px) — 디자인 스펙 */
export const TOAST_GAP_ABOVE_SAFE_AREA = 20;

/** 화면 아래 Safe Area 높이를 나타내는 CSS 값 (앱이 주는 변수 또는 브라우저 env 중 큰 값) */
export const TOAST_SAFE_AREA_BOTTOM = 'max(var(--safe-area-inset-bottom, 0px), env(safe-area-inset-bottom, 0px))';

/**
 * Toast position 프리셋
 * 앱의 레이아웃에 맞는 위치 매핑
 */
export const POSITION_STYLES: Record<ToastPosition, string> = {
  top: 'top-4 left-1/2 w-full max-w-120 webview:max-w-full -translate-x-1/2',
  // 하단 CTA가 있으면 CTA 버튼 윗면 위 16px, 없고 탭바가 있으면 탭바 윗면 위 16px, 둘 다 없으면 Safe Area 위 20px
  // (기준 거리는 --toast-bottom-offset, 간격은 --toast-bottom-gap이 정한다. 둘 다 없으면 바텀바 높이 + 16px)
  // max-w-120: 웹 데스크톱에서 앱 셸과 동일 폭으로 제한 (100vw 기준이면 브라우저 전체로 늘어남)
  bottom:
    'bottom-[calc(var(--toast-bottom-offset,var(--bottom-bar-height,0px))+var(--toast-bottom-gap,16px))] left-1/2 w-full max-w-120 webview:max-w-full -translate-x-1/2',
  'bottom-above-nav': 'bottom-[68px] left-1/2 w-full max-w-120 webview:max-w-full -translate-x-1/2',
} as const;

export function getPositionClassName(position: ToastPosition): string {
  return POSITION_STYLES[position];
}
