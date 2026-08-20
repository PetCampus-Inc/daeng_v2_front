function resolvePublicImageSrc(imageUrl: string | null | undefined) {
  if (!imageUrl) return '';
  if (/^(https?:|blob:|data:)/i.test(imageUrl)) return imageUrl;
  return `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? ''}${imageUrl}`;
}

export { resolvePublicImageSrc };
