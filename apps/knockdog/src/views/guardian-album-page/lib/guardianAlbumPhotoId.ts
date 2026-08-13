/** 상세 슬라이드용 확장(placeholder) 사진 id */
function isGuardianAlbumExpandPhotoId(photoId: string) {
  return photoId.includes('-expand-');
}

export { isGuardianAlbumExpandPhotoId };
