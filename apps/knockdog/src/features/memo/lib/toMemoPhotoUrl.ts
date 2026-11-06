export function toMemoPhotoUrl(key: string) {
  return `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ''}${key}`;
}
