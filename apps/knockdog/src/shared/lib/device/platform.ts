type Platform = 'ios' | 'android' | 'unknown';

/**
 * 현재 기기의 플랫폼을 감지합니다.
 */
function detectPlatform(): Platform {
  if (typeof window === 'undefined') return 'unknown';
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  if (/android/.test(userAgent)) return 'android';
  return 'unknown';
}

const isIOS = () => detectPlatform() === 'ios';
const isAndroid = () => detectPlatform() === 'android';

export { detectPlatform, isIOS, isAndroid };
export type { Platform };
