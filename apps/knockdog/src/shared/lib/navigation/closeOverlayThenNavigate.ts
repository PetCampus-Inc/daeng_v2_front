import { isNativeWebView } from '@shared/lib/device';

/** `OverlayProvider`가 오버레이를 열 때 history state에 남기는 키 */
const OVERLAY_HISTORY_KEY = '__knockdogOverlayId';

/** `popstate`가 오지 않을 때 이동을 보장하는 시간(ms) */
const NAVIGATE_FALLBACK_MS = 300;

/**
 * 시트·모달을 닫은 뒤 화면을 이동한다.
 *
 * 웹에서는 오버레이를 닫을 때 `OverlayProvider`가 `history.back()`을 부른다.
 * 닫자마자 `push`하면 이 뒤로가기가 방금 한 이동을 덮어써서 화면이 그대로 남는다.
 * 그래서 `popstate`가 온 뒤에 이동하고, 오지 않으면 짧은 시간 뒤에 이동한다.
 *
 * @param close 오버레이를 닫는 함수
 * @param navigate 닫은 뒤 실행할 화면 이동
 */
function closeOverlayThenNavigate(close: () => void, navigate: () => void) {
  if (isNativeWebView() || !window.history.state?.[OVERLAY_HISTORY_KEY]) {
    close();
    navigate();
    return;
  }

  let didNavigate = false;
  let fallbackTimer: number | undefined;

  const navigateAfterClose = () => {
    if (didNavigate) return;
    didNavigate = true;
    window.removeEventListener('popstate', navigateAfterClose);
    window.clearTimeout(fallbackTimer);
    navigate();
  };

  window.addEventListener('popstate', navigateAfterClose);
  close();
  if (!didNavigate) fallbackTimer = window.setTimeout(navigateAfterClose, NAVIGATE_FALLBACK_MS);
}

export { closeOverlayThenNavigate };
