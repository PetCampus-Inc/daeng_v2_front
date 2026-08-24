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

/** 유치원 홈 등 — 앨범 확인 시각을 탭 복귀 때 다시 읽는다 */
function useLiveAlbumLastViewedAt() {
  const [lastViewedAt, setLastViewedAt] = useState(0);

  useEffect(() => {
    const sync = () => setLastViewedAt(readLastViewedAt());
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') sync();
    };

    sync();
    window.addEventListener('focus', sync);
    window.addEventListener('pageshow', sync);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('knockdog:native-tab-focus', sync);

    return () => {
      window.removeEventListener('focus', sync);
      window.removeEventListener('pageshow', sync);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('knockdog:native-tab-focus', sync);
    };
  }, []);

  return lastViewedAt;
}

export { useGuardianAlbumLastViewed, useLiveAlbumLastViewedAt };
