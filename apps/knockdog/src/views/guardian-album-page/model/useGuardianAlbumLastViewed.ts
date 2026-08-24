'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  readLastViewedAt,
  writeLastViewedAt,
} from '@views/guardian-album-page/lib/guardianAlbumLastViewed';

/**
 * 앨범 리스트 체류 중 NEW 판정 기준(진입 시점 lastViewedAt)을 고정한다.
 * 상세 확인 후 리스트로 돌아오거나, 페이지 이탈/숨김 시 현재 시각을 저장해
 * 복귀 때 NEW가 숨겨지게 한다.
 */
function useGuardianAlbumLastViewed() {
  const [lastViewedAt, setLastViewedAt] = useState(() => readLastViewedAt());

  const persistViewedAt = useCallback(() => {
    writeLastViewedAt(Date.now());
  }, []);

  const markAsViewed = useCallback(() => {
    const now = Date.now();
    writeLastViewedAt(now);
    setLastViewedAt(now);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') persistViewedAt();
    };

    window.addEventListener('pagehide', persistViewedAt);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', persistViewedAt);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [persistViewedAt]);

  return { lastViewedAt, markAsViewed };
}

export { useGuardianAlbumLastViewed };
