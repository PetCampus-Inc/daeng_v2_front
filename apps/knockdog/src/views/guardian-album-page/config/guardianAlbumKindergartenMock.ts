import type { GuardianLinkedKindergarten } from '@views/guardian-kindergarten-page/model/guardianKindergartenConnection';

interface GuardianAlbumKindergartenOption extends GuardianLinkedKindergarten {
  /** null이면 현재 재원 중 */
  attendedUntil: string | null;
}

/**
 * 앨범 헤더 유치원 선택 바텀시트 mock.
 * 2개 이상일 때만 헤더 chevron 노출.
 */
const MOCK_ALBUM_KINDERGARTENS: GuardianAlbumKindergartenOption[] = [
  {
    id: 'album-kg-momo',
    name: '모모네 유치원',
    address: '서울특별시',
    imageUrl: '서울특별시/도봉구/1201415581/thumbnail_optimized.webp',
    attendedUntil: null,
  },
  {
    id: 'album-kg-nuri',
    name: '누리 애견 유치원',
    address: '서울특별시',
    imageUrl: '서울특별시/도봉구/1201415581/thumbnail_optimized.webp',
    attendedUntil: '2025-11-28',
  },
  {
    id: 'album-kg-pulsup',
    name: '풀숲 강아지 유치원',
    address: '서울특별시',
    imageUrl: '서울특별시/도봉구/1201415581/thumbnail_optimized.webp',
    attendedUntil: '2025-06-30',
  },
];

export type { GuardianAlbumKindergartenOption };
export { MOCK_ALBUM_KINDERGARTENS };
