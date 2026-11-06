'use client';

import { useEffect, useState } from 'react';

/**
 * SSR/CSR hydration-safe clock.
 * - 서버/첫 클라 페인트: null (상대시간 금지)
 * - mount 이후: Date.now() 스냅샷
 */
function useClientNow(resetKey?: number | string) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, [resetKey]);

  return now;
}

export { useClientNow };
