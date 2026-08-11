import type { GuardianAlbumPhoto } from '@views/guardian-album-page/config/guardianAlbumTodayMock';

/**
 * 미리보기 배열을 totalCount까지 확장 (상세 슬라이드 mock용).
 * 기존 사진을 순환 복제하되 id는 고유하게 유지.
 * 퍼블리싱 mock 성능을 위해 상한 적용.
 * index 2 = 로드 실패 mock (상세 오류 UI 확인용).
 */
const DETAIL_PHOTO_CAP = 24;
const MOCK_LOAD_ERROR_INDEX = 2;

function expandGuardianAlbumPhotos(
  photos: GuardianAlbumPhoto[],
  totalCount: number
): GuardianAlbumPhoto[] {
  if (photos.length === 0) return photos;
  const targetCount = Math.min(Math.max(totalCount, photos.length), DETAIL_PHOTO_CAP);

  const expanded: GuardianAlbumPhoto[] = photos.slice(0, targetCount);
  for (let index = photos.length; index < targetCount; index += 1) {
    const source = photos[index % photos.length];
    if (!source) break;
    expanded.push({
      ...source,
      id: `${source.id}-expand-${index + 1}`,
      isBookmarked: false,
    });
  }

  return expanded.map((photo, index) =>
    index === MOCK_LOAD_ERROR_INDEX
      ? { ...photo, hasLoadError: true, url: 'https://invalid.knockdog.local/broken.jpg' }
      : photo
  );
}

export { expandGuardianAlbumPhotos };
