'use client';

import { useQuery } from '@tanstack/react-query';

import { useOwnerRole } from './useOwnerRole';

import {
  createKindergartenBasicQueryOptions,
  kindergartenQueries,
} from '@entities/kindergarten';
import {
  buildFullAddress,
  mapOwnerSchoolProfilePricing,
  mapOwnerSchoolProfileToBasic,
  resolveThumbnailUrl,
  useOwnerSchoolProfileQuery,
} from '@entities/owner-school';
import { useUserStore } from '@entities/user';

/**
 * 원장 마이페이지 유치원 정보.
 *
 * - SELECTED: `placeId` → kindergarten/basic·main (운영·배너). 요금은 place pricing.
 * - MANUAL: `GET owner/school/profile` (운영·요금).
 * - placeId 우선순위: owner/role.placeId → profile.kindergartenPlaceId
 */
function useOwnerKindergarten() {
  const user = useUserStore((state) => state.user);
  const { kindergarten, owner, isOwner, placeId } = useOwnerRole();

  const source = kindergarten?.source ?? null;
  const isSelected = source === 'search';

  const { data: profile, isLoading, isError } = useOwnerSchoolProfileQuery({
    userId: user?.userId,
    enabled: isOwner,
  });

  const resolvedPlaceId =
    placeId != null
      ? String(placeId)
      : (profile?.kindergartenPlaceId?.trim() || undefined);

  const { data: placeBasic } = useQuery({
    ...createKindergartenBasicQueryOptions(resolvedPlaceId ?? ''),
    enabled: isSelected && Boolean(resolvedPlaceId),
  });

  const coord = placeBasic?.coord;

  const { data: main } = useQuery({
    ...kindergartenQueries.main({
      id: resolvedPlaceId ?? '',
      lng: coord?.lng ?? 0,
      lat: coord?.lat ?? 0,
    }),
    enabled: isSelected && Boolean(resolvedPlaceId) && coord != null,
  });

  const bannerKey = main?.banner?.[0];
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? '';
  const bannerUrl = bannerKey ? `${imageBaseUrl}${encodeURI(bannerKey)}` : null;
  const profileImageUrl = profile ? resolveThumbnailUrl(profile) : null;
  const imageUrl = isSelected ? (bannerUrl ?? profileImageUrl) : profileImageUrl;

  const profileBasic = profile ? mapOwnerSchoolProfileToBasic(profile) : undefined;
  const profilePricing = profile ? mapOwnerSchoolProfilePricing(profile) : undefined;

  const basic = isSelected && placeBasic ? placeBasic : profileBasic;
  const pricing = isSelected ? undefined : profilePricing;

  const name = (
    (isSelected ? main?.title : null) ??
    profile?.name ??
    kindergarten?.name ??
    ''
  ).trim();

  const address = (
    (isSelected ? placeBasic?.roadAddress : null) ??
    (profile ? buildFullAddress(profile.address, profile.addressDetail) : null) ??
    kindergarten?.address ??
    ''
  ).trim();

  const phoneNumber = (
    (isSelected ? main?.phoneNumber : null) ??
    profile?.phoneNumber ??
    ''
  ).trim();

  return {
    ownerKindergarten: kindergarten,
    source,
    imageUrl,
    usesDefaultImage: !imageUrl,
    canOpenKindergartenDetail: !!kindergarten,
    /** SELECTED basic/main/pricing 조회 키 (place id) */
    kindergartenId: resolvedPlaceId,
    name,
    address,
    phoneNumber,
    ownerName: owner?.name ?? '',
    ownerPhoneNumber: owner?.phoneNumber ?? '',
    profile,
    basic,
    pricing,
    isProfileLoading: isOwner && isLoading,
    isProfileError: isOwner && isError,
  };
}

export { useOwnerKindergarten };
