// 하단 버튼(16 + 56 + 32) 위 16px. 웹뷰 목록은 버튼 아래에 안전 영역이 더 있다.
const RESERVATION_ACTION_TOAST_VIEWPORT =
  'bottom-[calc(120px+var(--safe-area-inset-bottom,0px))] left-1/2 w-full max-w-120 webview:max-w-full -translate-x-1/2';

// 예약 확인 하단 버튼은 위아래 16px(16 + 56 + 16)이다.
const RESERVATION_CONFIRM_TOAST_VIEWPORT =
  'bottom-[104px] left-1/2 w-full max-w-120 webview:max-w-full -translate-x-1/2';

export { RESERVATION_ACTION_TOAST_VIEWPORT, RESERVATION_CONFIRM_TOAST_VIEWPORT };
