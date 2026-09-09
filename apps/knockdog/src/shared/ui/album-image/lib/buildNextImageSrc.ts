/**
 * next/image 옵티마이저 URL.
 * 그리드/상세 뷰포트 표시용 — 원본 S3 JPEG를 브라우저에 직접 받지 않게 한다.
 * 저장/업로드 원본 URL에는 쓰지 않음.
 */
function buildNextImageSrc(src: string, width: number, quality = 75) {
  if (!src || !/^(https?:)/i.test(src)) return src;

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

export { buildNextImageSrc, getAlbumDetailDisplayWidth };
