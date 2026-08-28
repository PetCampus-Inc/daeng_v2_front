function normalizeImageStorageKey(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';

  try {
    if (trimmed.includes('://')) {
      const url = new URL(trimmed);
      return decodeURIComponent(url.pathname.replace(/^\//, ''));
    }
  } catch {
    // path-only key
  }

  return decodeURIComponent(trimmed.replace(/^\//, ''));
}

/** thumbnail/original 등 파생 파일명을 같은 사진으로 취급 */
function canonicalBannerKey(value: string): string {
  const normalized = normalizeImageStorageKey(value);
  if (!normalized) return '';

  return normalized
    .replace(/\/thumbnail_optimized\//gi, '/')
    .replace(/_optimized(?=\.[^./]+$)/gi, '')
    .replace(/_thumbnail(?=\.[^./]+$)/gi, '')
    .toLowerCase();
}

function dedupeBannerKeys(banners: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const banner of banners) {
    if (!banner?.trim()) continue;

    const compareKey = canonicalBannerKey(banner);
    if (!compareKey || seen.has(compareKey)) continue;

    seen.add(compareKey);
    result.push(banner);
  }

  return result;
}

export { canonicalBannerKey, dedupeBannerKeys, normalizeImageStorageKey };
