'use client';

import { useQuery } from '@tanstack/react-query';

import { useOwnerRole } from './useOwnerRole';

import {
  createKindergartenBasicQueryOptions,
  kindergartenQueries,
} from '@entities/kindergarten';

/**
 * 원장 마이페이지 유치원 정보. BE owner-role 응답 기반.
 *
 * MANUAL(수동) 유치원은 조회 대상이 없어 기본 이미지를 사용한다.
 */
function useOwnerKindergarten() {
  const { kindergarten, owner, placeId } = useOwnerRole();

  const source = kindergarten?.source ?? null;
  const isSelected = source === 'search';
  // basic/main 조회 키는 place id (BE 내부 PK인 kindergartenId 아님)
  const idStr = placeId != null ? String(placeId) : undefined;

  // main API(배너)는 좌표가 필요 → basic에서 coord 확보
  const { data: basic } = useQuery({
    ...createKindergartenBasicQueryOptions(idStr ?? ''),
    enabled: isSelected && !!idStr,
  });

  const coord = basic?.coord;

  const { data: main } = useQuery({
    ...kindergartenQueries.main({
      id: idStr ?? '',
      lng: coord?.lng ?? 0,
      lat: coord?.lat ?? 0,
    }),
    enabled: isSelected && !!idStr && coord != null,
  });

  const bannerKey = main?.banner?.[0];
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? '';
  const bannerUrl = bannerKey ? `${imageBaseUrl}${encodeURI(bannerKey)}` : null;

  return {
    ownerKindergarten: kindergarten,
    source,
    imageUrl: bannerUrl,
    usesDefaultImage: !bannerUrl,
    // 원장이 소속 유치원을 가지면(수동/검색 무관) 상세 정보 페이지 진입 허용
    canOpenKindergartenDetail: !!kindergarten,
    // basic/main API 조회 키 (place id)
    kindergartenId: idStr,
    name: kindergarten?.name ?? '',
    address: kindergarten?.address ?? '',
    ownerName: owner?.name ?? '',
    ownerPhoneNumber: owner?.phoneNumber ?? '',
  };
}

export { useOwnerKindergarten };
