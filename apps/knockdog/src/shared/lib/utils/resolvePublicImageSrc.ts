function resolvePublicImageSrc(imageUrl: string | null | undefined) {
  if (!imageUrl) return '';
  if (/^(https?:|blob:|data:)/i.test(imageUrl)) return imageUrl;
  const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? '';
  // 한글/공백 S3 키 — encodeURI는 `/` 유지, 세그먼트만 퍼센트 인코딩
  return `${base}${encodeURI(imageUrl)}`;
}

export { resolvePublicImageSrc };
