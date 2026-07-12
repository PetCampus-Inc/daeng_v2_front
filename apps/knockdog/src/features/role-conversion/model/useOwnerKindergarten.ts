'use client';

import { useOwnerRole } from './useOwnerRole';

/**
 * 원장 마이페이지 유치원 정보. BE owner-role 응답 기반.
 *
 * @todo 상세페이지 이동용 kindergartenId 및
 *       canOpenKindergartenDetail / kindergartenId / 배너 이미지 연동
 */
function useOwnerKindergarten() {
  const { kindergarten, owner } = useOwnerRole();

  return {
    ownerKindergarten: kindergarten,
    imageUrl: null,
    usesDefaultImage: true,
    canOpenKindergartenDetail: false,
    kindergartenId: undefined,
    name: kindergarten?.name ?? '',
    address: kindergarten?.address ?? '',
    ownerName: owner?.name ?? '',
    ownerPhoneNumber: owner?.phoneNumber ?? '',
  };
}

export { useOwnerKindergarten };
