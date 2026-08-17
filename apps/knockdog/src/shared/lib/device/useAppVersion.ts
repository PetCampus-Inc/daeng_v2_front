'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useBridge, useOpenExternalLink } from '@shared/lib/bridge';
import { BridgeException } from '@knockdog/bridge-core';
import { isNativeWebView } from './isNativeWebView';

type GetAppVersionResult = {
  version: string;
};

// 현재 웹앱 버전 (app.config.ts의 version과 동기화 필요)
const CURRENT_WEB_VERSION = 'v1.0.000';

// 플레이스토어/앱스토어 URL
const STORE_URLS = {
  android: 'https://play.google.com/store/apps/details?id=net.knockdog.petcampus.v2',
  ios: 'https://apps.apple.com/kr/app/knockdog/id6754978978',
};

/**
 * 버전 문자열을 정규화 (v1.0.000 -> 1.0.0)
 */
function normalizeVersion(version: string): string {
  return version.replace(/^v/i, '').replace(/\.0+$/, '');
}

/**
 * 버전 비교 (currentVersion이 latestVersion보다 낮으면 true)
 */
function isVersionOutdated(currentVersion: string, latestVersion: string): boolean {
  const current = normalizeVersion(currentVersion).split('.').map(Number);
  const latest = normalizeVersion(latestVersion).split('.').map(Number);

  for (let i = 0; i < Math.max(current.length, latest.length); i++) {
    const currentPart = current[i] || 0;
    const latestPart = latest[i] || 0;

    if (currentPart < latestPart) return true;
    if (currentPart > latestPart) return false;
  }

  return false;
}

/**
 * 플랫폼 감지 (iOS/Android)
 */
function detectPlatform(): 'ios' | 'android' | 'unknown' {
  if (typeof window === 'undefined') return 'unknown';
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  if (/android/.test(userAgent)) return 'android';
  return 'unknown';
}

interface UseAppVersionResult {
  displayVersion: string;
  hasUpdate: boolean;
  openStore: () => void;
}

/**
 * 앱 버전 확인 및 업데이트 체크 훅
 */
function useAppVersion(): UseAppVersionResult {
  const bridge = useBridge();
  const openExternalLink = useOpenExternalLink();
  const isNative = useMemo(() => isNativeWebView(), []);

  const [displayVersion, setDisplayVersion] = useState(CURRENT_WEB_VERSION);
  const [hasUpdate, setHasUpdate] = useState(false);

  // 네이티브 앱 버전 가져오기
  useEffect(() => {
    if (!isNative) {
      setDisplayVersion(CURRENT_WEB_VERSION);
      return;
    }

    async function fetchNativeVersion() {
      try {
        const result = await bridge.request<GetAppVersionResult>('system.getAppVersion' as any, {});
        if (result?.version) {
          setDisplayVersion(`v${result.version}`);

          // 버전 비교
          const isOutdated = isVersionOutdated(result.version, CURRENT_WEB_VERSION.replace(/^v/i, ''));
          setHasUpdate(isOutdated);
        }
      } catch (error) {
        console.error('[useAppVersion] Failed to get native version:', error);
        if (error instanceof BridgeException) {
          console.error('[useAppVersion] Bridge error:', error.code, error.message);
        }
        // 에러 발생 시 웹 버전 표시
        setDisplayVersion(CURRENT_WEB_VERSION);
      }
    }

    fetchNativeVersion();
  }, [isNative, bridge]);

  const openStore = useCallback(() => {
    const platform = detectPlatform();
    const storeUrl = platform === 'ios' ? STORE_URLS.ios : STORE_URLS.android;
    openExternalLink(storeUrl);
  }, [openExternalLink]);

  return {
    displayVersion,
    hasUpdate,
    openStore,
  };
}

export { useAppVersion };
