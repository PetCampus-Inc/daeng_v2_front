/**
 * next.config.js `images.remotePatterns` 와 동기화.
 */
const NEXT_IMAGE_REMOTE_PATTERNS = [
  { protocol: 'https:', hostname: 'images.unsplash.com' },
  { protocol: 'https:', hostname: 'kindergarten-image-bucket.s3.ap-northeast-2.amazonaws.com' },
  { protocol: 'http:', hostname: 'blogpfthumb.phinf.naver.net' },
] as const;

/** S3 pre-signed — `/_next/image`가 재fetch하면 서명 깨져 upstream invalid(404) */
function isAwsPresignedUrl(src: string) {
  return /[?&]X-Amz-(Algorithm|Signature|Credential)=/i.test(src);
}

/** next/image(또는 buildNextImageSrc)로 넘길 수 있는 http(s) URL인지 */
function canOptimizeWithNextImage(src: string) {
  if (!src || !/^(https?:)/i.test(src)) return false;
  // pre-signed는 옵티마이저 금지 — plain <img>로 직접 로드
  if (isAwsPresignedUrl(src)) return false;

  try {
    const { protocol, hostname } = new URL(src);
    return NEXT_IMAGE_REMOTE_PATTERNS.some(
      (pattern) => pattern.protocol === protocol && pattern.hostname === hostname
    );
  } catch {
    return false;
  }
}

/**
 * next/image 옵티마이저 URL.
 * 그리드/상세 뷰포트 표시용 — 원본 S3 JPEG를 브라우저에 직접 받지 않게 한다.
 * 저장/업로드 원본 URL에는 쓰지 않음.
 */
function buildNextImageSrc(src: string, width: number, quality = 75) {
  if (!canOptimizeWithNextImage(src)) return src;

  const widths = [256, 384, 640, 750, 828, 1080, 1200, 1920];
  const target = widths.find((value) => value >= width) ?? widths[widths.length - 1]!;

  const params = new URLSearchParams({
    url: src,
    w: String(target),
    q: String(quality),
  });

  return `/_next/image?${params.toString()}`;
}

/** 앨범 상세 슬라이드 — 뷰포트×DPR 기준 (최대 1920) */
function getAlbumDetailDisplayWidth() {
  if (typeof window === 'undefined') return 1080;
  const dpr = Math.min(window.devicePixelRatio || 2, 3);
  return Math.min(1920, Math.ceil(window.innerWidth * dpr));
}

export { buildNextImageSrc, canOptimizeWithNextImage, getAlbumDetailDisplayWidth };
