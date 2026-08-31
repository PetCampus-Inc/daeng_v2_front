'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { normalizePathname } from './screenNames';
import { clearScreenTitleOverride, setScreenTitleOverride } from './screenTitleOverride';

/**
 * 동적 화면명(유치원명, 초대 유치원명 등)을 현재 pathname에 연결한다.
 * AnalyticsScreenTracker가 override를 읽어 screen_view를 재발화한다.
 */
function useScreenAnalyticsTitle(title: string | null | undefined) {
  const pathname = usePathname();
  const normalizedPath = normalizePathname(pathname ?? '/');

  useEffect(() => {
    const next = title?.trim() || null;
    if (!next) return;

    setScreenTitleOverride(normalizedPath, next);
    return () => clearScreenTitleOverride(normalizedPath);
  }, [normalizedPath, title]);
}

export { useScreenAnalyticsTitle };
