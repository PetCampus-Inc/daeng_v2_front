import type { BrowserContext, Page } from '@playwright/test';

/** 앱 GA Measurement ID — `apps/knockdog/.../gtag.ts` 와 동일 */
const GA_MEASUREMENT_ID = 'G-3XK1LPFE9J';

/** GA/GTM/광고·기타 트래킹 호스트 — collect 포함 */
const ANALYTICS_HOST_SNIPPETS = [
  'google-analytics.com',
  'analytics.google.com',
  'googletagmanager.com',
  'doubleclick.net',
  'googleadservices.com',
  'googlesyndication.com',
  'google.com/ccm',
  'amplitude.com',
  'mixpanel.com',
  'sentry.io',
  'browser.sentry-cdn.com',
  'facebook.com/tr',
  'connect.facebook.net',
  'hotjar.com',
  'clarity.ms',
] as const;

function isAnalyticsRequest(url: string) {
  const lower = url.toLowerCase();
  return ANALYTICS_HOST_SNIPPETS.some((snippet) => lower.includes(snippet));
}

/**
 * E2E에서 GA 등 트래킹이 절대 나가지 않도록:
 * 1) 네트워크 abort (gtag.js / g/collect / analytics.google.com 등)
 * 2) init script — ga-disable + gtag/dataLayer noop (페이지 스크립트보다 먼저)
 */
async function installAnalyticsBlock(target: Page | BrowserContext) {
  await target.route((url) => isAnalyticsRequest(url.href), (route) => route.abort());

  await target.addInitScript(
    ({ measurementId }) => {
      // 공식 GA disable 플래그 (스크립트가 로드돼도 hit 억제)
      (window as unknown as Record<string, boolean>)[`ga-disable-${measurementId}`] = true;

      const noop = () => undefined;
      window.dataLayer = [];
      window.dataLayer.push = (..._args: unknown[]) => 0;
      window.gtag = noop as typeof window.gtag;

      // layout beforeInteractive stub이 덮어쓰기 전에 다시 막기
      Object.defineProperty(window, 'gtag', {
        configurable: true,
        get: () => noop,
        set: () => undefined,
      });
    },
    { measurementId: GA_MEASUREMENT_ID }
  );
}

/** @deprecated use installAnalyticsBlock — page/context 공통 */
async function blockThirdPartyNoise(page: Page) {
  await installAnalyticsBlock(page);
}

/**
 * API 응답 대기. hard sleep 대신 사용.
 * `pathIncludes` 예: '/api/v0/owner/' 또는 'owner/members'
 */
function waitForApiResponse(page: Page, pathIncludes: string, options?: { timeout?: number }) {
  return page.waitForResponse(
    (response) => response.url().includes(pathIncludes) && response.request().method() !== 'OPTIONS',
    { timeout: options?.timeout ?? 30_000 }
  );
}

export {
  installAnalyticsBlock,
  blockThirdPartyNoise,
  waitForApiResponse,
  isAnalyticsRequest,
  GA_MEASUREMENT_ID,
  ANALYTICS_HOST_SNIPPETS,
};
