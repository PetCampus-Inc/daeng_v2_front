import { useEffect, useState } from 'react';

import { LOADING_SPINNER_DELAY_MS } from './constants';

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

export { useDelayedLoading };
