import { isNativeWebView } from '@shared/lib/device';

interface WaitForNavParamsOptions {
  /** 네이티브에서 params 주입을 기다리는 최대 시간 */
  timeoutMs?: number;
  intervalMs?: number;
}

/**
 * 네이티브 WebView는 Android에서 history.state(_params) 주입이
 * content load 이후에 올 수 있어, 첫 렌더의 getParams()가 null일 수 있다.
 * 웹/이미 준비된 네이티브는 즉시 콜백한다.
 */
function waitForNavParams<T>(
  read: () => T | null,
  onResolve: (value: T | null) => void,
  options: WaitForNavParamsOptions = {}
): () => void {
  const { timeoutMs = 2000, intervalMs = 50 } = options;

  if (typeof window === 'undefined') {
    onResolve(null);
    return () => {};
  }

  const immediate = read();

  if (immediate || !isNativeWebView()) {
    onResolve(immediate);
    return () => {};
  }

  const startedAt = Date.now();
  const timerId = window.setInterval(() => {
    const next = read();

    if (next || Date.now() - startedAt >= timeoutMs) {
      window.clearInterval(timerId);
      onResolve(next);
    }
  }, intervalMs);

  return () => {
    window.clearInterval(timerId);
  };
}

export { waitForNavParams };
