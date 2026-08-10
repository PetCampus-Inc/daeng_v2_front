interface GuardianAlbumPhoto {
  id: string;
  url: string;
  /** ISO datetime — lastViewedAt 이후면 NEW */
  uploadedAt: string;
  isBookmarked: boolean;
}

interface GuardianAlbumPhotoMockSeed {
  id: string;
  uploadedAt: string;
  isBookmarked: boolean;
}

interface GuardianAlbumTodayMock {
  /** false면 앨범 이력 없음 → 기존 empty 페이지 */
  hasAlbumHistory: boolean;
  /** 오늘 등원 여부. false면 미리보기 숨김 */
  isAttendedToday: boolean;
  /** 오늘 전체 사진 수 (N장 버튼) */
  todayPhotoCount: number;
  /** 최신순 미리보기 seed (최대 10장). url은 선택견 profileImage로 채움 */
  todayPhotoSeeds: GuardianAlbumPhotoMockSeed[];
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * 첫 등원 이후·오늘 사진 있는 상태 mock.
 * isAttendedToday를 false로 바꾸면 미등원 UI 확인 가능.
 */
const MOCK_GUARDIAN_ALBUM_TODAY: GuardianAlbumTodayMock = {
  hasAlbumHistory: true,
  isAttendedToday: true,
  todayPhotoCount: 65,
  todayPhotoSeeds: [
    { id: 'photo-1', uploadedAt: hoursAgo(1), isBookmarked: false },
    { id: 'photo-2', uploadedAt: hoursAgo(2), isBookmarked: true },
    { id: 'photo-3', uploadedAt: hoursAgo(3), isBookmarked: false },
    { id: 'photo-4', uploadedAt: hoursAgo(5), isBookmarked: false },
    { id: 'photo-5', uploadedAt: daysAgo(1), isBookmarked: false },
    { id: 'photo-6', uploadedAt: daysAgo(1), isBookmarked: true },
    { id: 'photo-7', uploadedAt: daysAgo(2), isBookmarked: false },
    { id: 'photo-8', uploadedAt: daysAgo(2), isBookmarked: false },
    { id: 'photo-9', uploadedAt: daysAgo(3), isBookmarked: false },
    { id: 'photo-10', uploadedAt: daysAgo(3), isBookmarked: false },
  ],
};

function createGuardianAlbumTodayPhotos(
  seeds: GuardianAlbumPhotoMockSeed[],
  profileImage?: string | null
): GuardianAlbumPhoto[] {
  if (!profileImage) return [];

  return seeds.map((seed) => ({
    ...seed,
    url: profileImage,
  }));
}

export type { GuardianAlbumPhoto, GuardianAlbumPhotoMockSeed, GuardianAlbumTodayMock };
export { MOCK_GUARDIAN_ALBUM_TODAY, createGuardianAlbumTodayPhotos };
