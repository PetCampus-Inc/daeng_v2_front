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
 * - SELECTED: `placeId` → kindergarten/basic·main (운영·배너).
 *   요금은 place pricing, 단 원장이 PUT price로 저장한 적 있으면 school profile 우선.
 * - MANUAL: `GET owner/school/profile` (운영·요금).
 * - 자동 채우기: SELECTED 항상 / MANUAL은 schoolProfileId 있으면 (운영 정보 저장 1회+)
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

  const placeBasicQuery = useQuery({
    ...createKindergartenBasicQueryOptions(resolvedPlaceId ?? ''),
    enabled: isSelected && Boolean(resolvedPlaceId),
  });

  const placeBasic = placeBasicQuery.data;
  const coord = placeBasic?.coord;

  const mainQuery = useQuery({
    ...kindergartenQueries.main({
      id: resolvedPlaceId ?? '',
      lng: coord?.lng ?? 0,
      lat: coord?.lat ?? 0,
    }),
    enabled: isSelected && Boolean(resolvedPlaceId) && coord != null,
  });

  const main = mainQuery.data;
  const profileBannerKeys = [...(profile?.profileImages ?? [])]
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .map((image) => image.s3Key)
    .filter(Boolean);
  const bannerKeys = isSelected ? (main?.banner ?? []) : profileBannerKeys;
  const bannerKey = bannerKeys[0];
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? '';
  const bannerUrl = bannerKey ? `${imageBaseUrl}${encodeURI(bannerKey)}` : null;
  const profileImageUrl = profile ? resolveThumbnailUrl(profile) : null;
  const imageUrl = isSelected ? (bannerUrl ?? profileImageUrl) : profileImageUrl;

  const profileBasic = profile ? mapOwnerSchoolProfileToBasic(profile) : undefined;
  const profilePricing = profile ? mapOwnerSchoolProfilePricing(profile) : undefined;

  /** 원장이 PUT /owner/school/price 로 저장한 요금 */
  const hasOwnerSavedPricing =
    (profilePricing?.productType.length ?? 0) > 0 ||
    (profilePricing?.priceImages.length ?? 0) > 0;

  const basic = isSelected && placeBasic ? placeBasic : profileBasic;
  // SELECTED: 저장 전에는 place(탭에서 kindergartenId), 저장 후엔 profile
  const pricing = !isSelected || hasOwnerSavedPricing ? profilePricing : undefined;

  const name = (
    (isSelected ? main?.title : null) ??
    profile?.name ??
    kindergarten?.name ??
    ''
  ).trim();

  /** 수정 폼 프리필용 (상세주소 분리) */
  const streetAddress = (
    (isSelected ? placeBasic?.roadAddress : null) ??
    profile?.address ??
    kindergarten?.address ??
    ''
  ).trim();

  /** 탭/카드 표시용 */
  const address = (
    (isSelected ? streetAddress : null) ??
    (profile ? buildFullAddress(profile.address, profile.addressDetail) : null) ??
    streetAddress
  ).trim();

  const addressDetail = (profile?.addressDetail ?? '').trim();

  const placePhoneNumber = ((isSelected ? main?.phoneNumber : null) ?? '').trim();
  const schoolPhoneNumber = (profile?.phoneNumber ?? '').trim();

  /**
   * 탭/카드 「전화번호」: 저장한 유치원 전화 우선.
   * 없으면 SELECTED는 place, MANUAL은 school(빈값 가능).
   */
  const phoneNumber = schoolPhoneNumber || placePhoneNumber;

  /** 자동 채우기용: SELECTED는 place, MANUAL/저장본은 school */
  const autofillPhoneNumber = isSelected
    ? placePhoneNumber || schoolPhoneNumber
    : schoolPhoneNumber;

  /** SELECTED: placeId 없으면 즉시, 있으면 basic(+main) 조회 완료 후 */
  const isSelectedPrefillReady =
    isSelected &&
    (!resolvedPlaceId ||
      (placeBasicQuery.isFetched && (coord == null || mainQuery.isFetched)));

  /** MANUAL: 운영 정보 저장 1회 이상(= schoolProfileId) */
  const hasSavedSchoolProfile = profile?.schoolProfileId != null;

  /** SELECTED 항상, MANUAL은 저장 이후 — 자동 채우기 동일 UX */
  const canUseAutofill = isSelected || hasSavedSchoolProfile;

  const isAutofillPrefillReady = isSelected
    ? isSelectedPrefillReady
    : hasSavedSchoolProfile;

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
    streetAddress,
    addressDetail,
    phoneNumber,
    autofillPhoneNumber,
    bannerKeys,
    ownerName: owner?.name ?? '',
    ownerPhoneNumber: owner?.phoneNumber ?? '',
    profile,
    basic,
    pricing,
    hasOwnerSavedPricing,
    canUseAutofill,
    isAutofillPrefillReady,
    isSelectedPrefillReady,
    isProfileLoading: isOwner && isLoading,
    isProfileError: isOwner && isError,
  };
}

export { useOwnerKindergarten };
