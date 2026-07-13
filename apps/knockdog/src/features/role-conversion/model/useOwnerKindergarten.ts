'use client';

import { useOwnerRole } from './useOwnerRole';

/**
 * 원장 마이페이지 유치원 정보. BE owner-role 응답 기반.
 *
 * @todo 배너 이미지 연동.
 */
function useOwnerKindergarten() {
  const { kindergarten, owner, kindergartenId } = useOwnerRole();

  return {
    ownerKindergarten: kindergarten,
    source: kindergarten?.source ?? null,
    imageUrl: null,
    usesDefaultImage: true,
    // 원장이 소속 유치원을 가지면(수동/검색 무관) 상세 정보 페이지 진입 허용
    canOpenKindergartenDetail: !!kindergarten,
    // basic API(`kindergarten/basic/{id}`) 조회 키는 schoolId가 아니라 place id
    kindergartenId: kindergartenId != null ? String(kindergartenId) : undefined,
    name: kindergarten?.name ?? '',
    address: kindergarten?.address ?? '',
    ownerName: owner?.name ?? '',
    ownerPhoneNumber: owner?.phoneNumber ?? '',
  };
}

export { useOwnerKindergarten };
