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
    /** 연결 해제 — 2개월 전 말일 = 앨범 max (예: 8월 기준 6월) */
    attendedUntil: (() => {
      const now = new Date();
      const end = new Date(now.getFullYear(), now.getMonth() - 1, 0);
      return `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
    })(),
  },
  {
    id: 'album-kg-pulsup',
    name: '풀숲 강아지 유치원',
    address: '서울특별시',
    imageUrl: '서울특별시/도봉구/1201415581/thumbnail_optimized.webp',
    /** 연결 해제 — 연결 시작월 중순 */
    attendedUntil: (() => {
      const now = new Date();
      const end = new Date(now.getFullYear(), now.getMonth() - 3, 15);
      return `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
    })(),
  },
];

export type { GuardianAlbumKindergartenOption };
export { MOCK_ALBUM_KINDERGARTENS };
