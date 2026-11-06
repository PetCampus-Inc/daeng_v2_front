const GUARDIAN_ALBUM_LAST_VIEWED_STORAGE_KEY = 'guardian-album-last-viewed-at';

function readLastViewedAt(): number {
  if (typeof window === 'undefined') return 0;
  // localStorage: 탭/Stack WebView가 서로 다른 sessionStorage를 씀
  const raw = window.localStorage.getItem(GUARDIAN_ALBUM_LAST_VIEWED_STORAGE_KEY);
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) ? parsed : 0;
}

function writeLastViewedAt(timestamp = Date.now()) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(GUARDIAN_ALBUM_LAST_VIEWED_STORAGE_KEY, String(timestamp));
}

export { GUARDIAN_ALBUM_LAST_VIEWED_STORAGE_KEY, readLastViewedAt, writeLastViewedAt };
