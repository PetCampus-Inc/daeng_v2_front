import {
  getGuardianAlbumDayPhotos,
  toGuardianAlbumPhoto,
  type GuardianAlbumPhoto,
} from '@entities/guardian-album';

const PAGE_SIZE = 30;
const MAX_PAGES = 20;

/** `GET albums/{schoolId}/photos?date=` 커서 페이지를 모아 해당 일의 전체 사진을 구성한다. */
async function fetchGuardianAlbumDayPhotos(
  schoolId: string,
  date: string
): Promise<GuardianAlbumPhoto[]> {
  const photos: GuardianAlbumPhoto[] = [];
  let cursor: number | undefined;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const response = await getGuardianAlbumDayPhotos({
      schoolId,
      date,
      size: PAGE_SIZE,
      cursor,
    });
    const data = response.data;
    const pagePhotos = (data?.photos ?? [])
      .map(toGuardianAlbumPhoto)
      .filter((photo): photo is GuardianAlbumPhoto => photo != null);
    photos.push(...pagePhotos);

    if (data?.hasNext !== true || data.nextCursor == null || data.nextCursor === cursor) {
      break;
    }

    cursor = data.nextCursor;
  }

  return photos;
}

export { fetchGuardianAlbumDayPhotos };
