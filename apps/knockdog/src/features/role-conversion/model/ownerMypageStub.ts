import type { OwnerKindergarten } from './ownerKindergarten';

/**
 * OWNER_VERIFIED_STUB === true 일 때만 사용.
 * 원장 인증 API 연동 전 마이페이지 UI 퍼블리싱 확인용 임시 데이터.
 *
 * @todo BE 원장 인증 상태 API 반영 후 제거
 */
const OWNER_MYPAGE_KINDERGARTEN_STUB = Object.freeze<OwnerKindergarten>({
  source: 'manual',
  name: '모모네 유치원',
  address: '서울 강남구 논현로 123길 37',
  ownerName: '김지연',
});

export { OWNER_MYPAGE_KINDERGARTEN_STUB };
