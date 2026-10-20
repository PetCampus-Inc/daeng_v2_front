'use client';

import { useEffect } from 'react';

import { isNativeWebView } from '@shared/lib/device';

import { GA_MEASUREMENT_ID } from './gtag';

/**
 * 브라우저에서만 gtag.js를 붙인다.
 * 스크립트 주소의 id만으로 태그가 켜지므로, WebView에서는 스크립트 자체를 넣지 않는다.
 * config는 스크립트보다 먼저 큐에 넣어 자동 page_view를 끈다.
 */
function GoogleAnalytics() {
  useEffect(() => {
    if (isNativeWebView()) return;
    if (document.querySelector(`script[data-ga-id="${GA_MEASUREMENT_ID}"]`)) return;

    window.gtag?.('js', new Date());
    window.gtag?.('config', GA_MEASUREMENT_ID, { send_page_view: false });

    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.async = true;
    script.dataset.gaId = GA_MEASUREMENT_ID;
    document.head.appendChild(script);
  }, []);

  return null;
}

export { GoogleAnalytics };
