import { useEffect, useState } from 'react';

/** 페이지 진입/조회 로딩 — 250~300ms 미만 깜빡임 방지 */
const LOADING_SPINNER_DELAY_MS = 275;

function useDelayedLoading(isLoading: boolean, delayMs = LOADING_SPINNER_DELAY_MS) {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowLoading(false);
      return;
    }

    const timer = window.setTimeout(() => setShowLoading(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [isLoading, delayMs]);

  return showLoading;
}

export { useDelayedLoading, LOADING_SPINNER_DELAY_MS };
