/**
 * 보호자 앨범 즐겨찾기 API DTO
 * `GET /api/v0/albums/{schoolId}/favorites`
 */

import {
  toDateKey,
  toGuardianAlbumDay,
  type GuardianAlbumDay,
  type GuardianAlbumDayDto,
  type GuardianAlbumLocalDate,
} from './guardianAlbumDay';

interface GuardianAlbumFavoritesDto {
  days?: GuardianAlbumDayDto[] | null;
  nextCursor?: GuardianAlbumLocalDate | null;
  hasNext?: boolean | null;
}

interface GuardianAlbumFavoritesPage {
  days: GuardianAlbumDay[];
  nextCursor: string | null;
  hasNext: boolean;
}

function toGuardianAlbumFavoritesPage(
  dto: GuardianAlbumFavoritesDto | null | undefined
): GuardianAlbumFavoritesPage {
  const days = (dto?.days ?? [])
    .map(toGuardianAlbumDay)
    .filter((day): day is GuardianAlbumDay => day != null);

  const hasNext = Boolean(dto?.hasNext);
  const nextCursor = hasNext ? toDateKey(dto?.nextCursor) : null;

  return {
    days,
    nextCursor,
    hasNext,
  };
}

export { toGuardianAlbumFavoritesPage };
export type { GuardianAlbumFavoritesDto, GuardianAlbumFavoritesPage };
