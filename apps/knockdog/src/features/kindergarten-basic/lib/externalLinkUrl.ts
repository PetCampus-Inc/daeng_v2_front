/**
 * 외부 링크 노출/실행용 URL 검사.
 * - 빈 값 → 무효 (섹션/뱃지 미노출)
 * - http(s)만 허용 (스킴 생략 시 https 가정)
 */
function isValidExternalLinkUrl(value: string | null | undefined): boolean {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return false;

  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) && !/^https?:\/\//i.test(trimmed)) {
    return false;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;

    const host = url.hostname;
    if (!host) return false;

    return /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(host);
  } catch {
    return false;
  }
}

/** 실행용 absolute URL. 유효하지 않으면 null */
function toExternalLinkHref(value: string | null | undefined): string | null {
  if (!isValidExternalLinkUrl(value)) return null;
  const trimmed = value!.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export { isValidExternalLinkUrl, toExternalLinkHref };
