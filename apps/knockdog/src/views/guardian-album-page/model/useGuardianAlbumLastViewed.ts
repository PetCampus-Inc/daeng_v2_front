'use client';

import { useEffect, useState } from 'react';

import {
  readLastViewedAt,
  writeLastViewedAt,
} from '@views/guardian-album-page/lib/guardianAlbumLastViewed';

/**
 * 앨범 페이지 체류 중 NEW 판정 기준(진입 시점 lastViewedAt)을 고정하고,
 * 이탈/숨김 시 현재 시각을 저장해 복귀 때 NEW가 숨겨지게 함.
 */
function useGuardianAlbumLastViewed() {
  const [lastViewedAt] = useState(() => readLastViewedAt());

  useEffect(() => {
    const persistViewedAt = () => {
      writeLastViewedAt(Date.now());
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') persistViewedAt();
    };

    window.addEventListener('pagehide', persistViewedAt);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', persistViewedAt);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return { lastViewedAt };
}

export { useGuardianAlbumLastViewed };
