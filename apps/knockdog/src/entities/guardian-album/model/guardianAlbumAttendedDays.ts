/**
 * 보호자 앨범 등원일 API DTO
 * `GET /api/v0/albums/{schoolId}/attended-days`
 */

import {
  toGuardianAlbumFavoritesPage,
  type GuardianAlbumFavoritesDto,
  type GuardianAlbumFavoritesPage,
} from './guardianAlbumFavorites';

type GuardianAlbumAttendedDaysDto = GuardianAlbumFavoritesDto;
type GuardianAlbumAttendedDaysPage = GuardianAlbumFavoritesPage;

const toGuardianAlbumAttendedDaysPage = toGuardianAlbumFavoritesPage;

export { toGuardianAlbumAttendedDaysPage };
export type { GuardianAlbumAttendedDaysDto, GuardianAlbumAttendedDaysPage };
