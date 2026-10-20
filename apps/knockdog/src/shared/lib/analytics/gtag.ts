import { isAnalyticsCollectionBlocked } from './excludedUserIds';

export const GA_MEASUREMENT_ID = 'G-SYYR0V8GLB';

/** 결합 태그의 원래 목적지. 관리자에서 지울 수 없어서 브라우저 전송만 끈다. */
export const GA_LEGACY_MEASUREMENT_ID = 'G-3XK1LPFE9J';

function setGaCollectionEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return;
  (window as unknown as Record<string, boolean>)[`ga-disable-${GA_MEASUREMENT_ID}`] = !enabled;
}

let pendingUserId: string | null | undefined;
let userIdFlushAttempts = 0;
let userIdFlushTimer: number | undefined;

function setGaUserId(userId: string | null) {
  pendingUserId = userId;
  userIdFlushAttempts = 0;
  flushGaUserId();
}

function flushGaUserId() {
  if (pendingUserId === undefined || typeof window === 'undefined') return;
  if (typeof window.gtag !== 'function') {
    if (userIdFlushTimer !== undefined || userIdFlushAttempts >= 20) return;
    userIdFlushAttempts += 1;
    userIdFlushTimer = window.setTimeout(() => {
      userIdFlushTimer = undefined;
      flushGaUserId();
    }, 500);
    return;
  }

  if (userIdFlushTimer !== undefined) {
    window.clearTimeout(userIdFlushTimer);
    userIdFlushTimer = undefined;
  }
  userIdFlushAttempts = 0;
  window.gtag('set', { user_id: pendingUserId });
}

type GTagEvent = {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  [key: string]: string | number | boolean | undefined;
};

type GTagParamValue = string | number | boolean;

declare global {
  interface Window {
    gtag: (command: string, ...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export const pageview = (url: string, title?: string, params?: Record<string, GTagParamValue | undefined>) => {
  if (isAnalyticsCollectionBlocked()) return;
  flushGaUserId();
  if (typeof window.gtag === 'undefined') return;
  window.gtag('event', 'page_view', {
    page_path: url,
    page_location: typeof window !== 'undefined' ? window.location.href : undefined,
    ...(title ? { page_title: title } : {}),
    ...params,
  });
};

export { setGaCollectionEnabled, setGaUserId };

export const event = ({ action, category, label, value, ...rest }: GTagEvent) => {
  if (isAnalyticsCollectionBlocked()) return;
  flushGaUserId();
  if (typeof window.gtag === 'undefined') return;
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
    ...rest,
  });
};
