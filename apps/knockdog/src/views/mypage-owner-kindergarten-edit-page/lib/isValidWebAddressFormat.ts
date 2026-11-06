/**
 * 클릭 가능한 일반 웹 주소 형식 검사.
 * - 빈 값 허용 (선택 필드)
 * - `http://` / `https://` 선택 입력
 * - 유효한 호스트(도메인) 필수
 * - 실제 접속·도메인 일치 여부는 확인하지 않음
 */
function isValidWebAddressFormat(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return true;

  // 다른 스킴(ftp, javascript 등) 거부. http(s)만 허용하거나 스킴 생략
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) && !/^https?:\/\//i.test(trimmed)) {
    return false;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;

    const host = url.hostname;
    if (!host) return false;

    // 호스트: 라벨.라벨…TLD (예: www.knockdog.com). IP·localhost는 일반 웹 주소로 미허용
    return /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(host);
  } catch {
    return false;
  }
}

export { isValidWebAddressFormat };
