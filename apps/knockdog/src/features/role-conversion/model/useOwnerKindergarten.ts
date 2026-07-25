'use client';

import { useQuery } from '@tanstack/react-query';

import { useOwnerRole } from './useOwnerRole';

import {
  createKindergartenBasicQueryOptions,
  kindergartenQueries,
} from '@entities/kindergarten';
import {
  mapOwnerSchoolProfilePricing,
  mapOwnerSchoolProfileToBasic,
  resolveThumbnailUrl,
  toS3Url,
  useOwnerSchoolProfileQuery,
} from '@entities/owner-school';
import { useUserStore } from '@entities/user';

/**
 * 원장 마이페이지 유치원 정보.
 *
 * - SELECTED: `placeId` → kindergarten/basic·main (운영·배너).
 *   단 원장이 운영 정보를 저장한 적 있으면 school profile 우선.
 *   요금은 place pricing, 단 원장이 PUT price로 저장한 적 있으면 school profile 우선.
 * - MANUAL: `GET owner/school/profile` (운영·요금).
 * - 수정 폼 프리필: 저장본(schoolProfileId) 있으면 profile 최신값,
 *   없으면 SELECTED place. MANUAL은 저장 1회+부터 프리필.
 * - placeId 우선순위: owner/role.placeId → profile.kindergartenPlaceId
 */
function useOwnerKindergarten() {
  const user = useUserStore((state) => state.user);
  const { kindergarten, owner, isOwner, placeId, isResolved } = useOwnerRole();

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
  const profileImageUrl = profile ? resolveThumbnailUrl(profile) : null;
  const displayBannerKeys = profileBannerKeys.length > 0 ? profileBannerKeys : bannerKeys;
  const imageUrls = displayBannerKeys
    .map((bannerKey) => toS3Url(bannerKey))
    .filter((imageUrl): imageUrl is string => Boolean(imageUrl));
  const imageUrl = imageUrls[0] ?? profileImageUrl;

  const profileBasic = profile ? mapOwnerSchoolProfileToBasic(profile) : undefined;
  const profilePricing = profile ? mapOwnerSchoolProfilePricing(profile) : undefined;

  /** MANUAL/SELECTED 공통: 운영 정보 저장 1회 이상(= schoolProfileId) */
  const hasSavedSchoolProfile = profile?.schoolProfileId != null;

  /** 원장이 PUT /owner/school/price 로 저장한 요금 */
  const hasOwnerSavedPricing =
    (profilePricing?.productType.length ?? 0) > 0 ||
    (profilePricing?.priceImages.length ?? 0) > 0;

  /** 저장본 있으면 profile(최신 lastUpdatedAt 포함), 없으면 SELECTED place */
  const basic =
    hasSavedSchoolProfile && profileBasic
      ? profileBasic
      : isSelected && placeBasic
        ? placeBasic
        : profileBasic;
  // SELECTED: 저장 전에는 place(탭에서 kindergartenId), 저장 후엔 profile
  const pricing = !isSelected || hasOwnerSavedPricing ? profilePricing : undefined;

  const name = (
    (isSelected ? main?.title : null) ??
    profile?.name ??
    kindergarten?.name ??
    ''
  ).trim();

  /** 수정 폼 프리필·표시용 기본 주소 (상세 제외) */
  const streetAddress = (
    profile?.address?.trim() ||
    (isSelected ? placeBasic?.roadAddress : null) ||
    kindergarten?.address ||
    ''
  ).trim();

  const addressDetail = (profile?.addressDetail ?? '').trim();

  /** 탭/카드 표시용 기본 주소 (상세는 별도 줄) */
  const address = streetAddress;

  const placePhoneNumber = ((isSelected ? main?.phoneNumber : null) ?? '').trim();
  const schoolPhoneNumber = (profile?.phoneNumber ?? '').trim();

  /**
   * 탭/카드 「전화번호」: 저장한 유치원 전화 우선.
   * 없으면 SELECTED는 place, MANUAL은 school(빈값 가능).
   */
  const phoneNumber = schoolPhoneNumber || placePhoneNumber;

  /**
   * 수정 폼 프리필 소스: 저장본 있으면 school profile 최신값,
   * 없으면 SELECTED place basic/main.
   */
  const autofillName = (
    hasSavedSchoolProfile
      ? profile?.name
      : ((isSelected ? main?.title : null) ?? profile?.name ?? kindergarten?.name)
  )?.trim() ?? '';

  const autofillStreetAddress = (
    hasSavedSchoolProfile
      ? profile?.address
      : ((isSelected ? placeBasic?.roadAddress : null) ??
        profile?.address ??
        kindergarten?.address)
  )?.trim() ?? '';

  const autofillAddressDetail = hasSavedSchoolProfile
    ? (profile?.addressDetail ?? '').trim()
    : '';

  const autofillPhoneNumber = hasSavedSchoolProfile
    ? schoolPhoneNumber
    : isSelected
      ? placePhoneNumber || schoolPhoneNumber
      : schoolPhoneNumber;

  const autofillBasic = hasSavedSchoolProfile
    ? profileBasic
    : isSelected
      ? placeBasic
      : profileBasic;

  /** profile 배너가 비면 place main.banner 폴백 (저장본만 보고 [] 되는 문제 방지) */
  const autofillBannerKeys =
    profileBannerKeys.length > 0
      ? profileBannerKeys
      : isSelected
        ? (main?.banner ?? [])
        : profileBannerKeys;

  const needsPlaceBannerFallback =
    isSelected && profileBannerKeys.length === 0 && Boolean(resolvedPlaceId);

  /** SELECTED: placeId 없으면 즉시, 있으면 basic(+main) 조회 완료 후 */
  const isSelectedPrefillReady =
    isSelected &&
    (!resolvedPlaceId ||
      (placeBasicQuery.isFetched && (coord == null || mainQuery.isFetched)));

  /** SELECTED 항상, MANUAL은 저장 이후 — 수정 폼 프리필 가능 여부 */
  const canUseAutofill = isSelected || hasSavedSchoolProfile;

  /** 배너 폴백이 필요하면 main 준비될 때까지 대기 */
  const isAutofillPrefillReady = hasSavedSchoolProfile
    ? profile != null && (!needsPlaceBannerFallback || isSelectedPrefillReady)
    : isSelectedPrefillReady;

  return {
    ownerKindergarten: kindergarten,
    source,
    imageUrl,
    imageUrls: imageUrls.length > 0 ? imageUrls : profileImageUrl ? [profileImageUrl] : [],
    usesDefaultImage: !imageUrl,
    canOpenKindergartenDetail: !!kindergarten,
    /** SELECTED basic/main/pricing 조회 키 (place id) */
    kindergartenId: resolvedPlaceId,
    name,
    address,
    streetAddress,
    addressDetail,
    phoneNumber,
    autofillName,
    autofillStreetAddress,
    autofillAddressDetail,
    autofillPhoneNumber,
    autofillBasic,
    autofillBannerKeys,
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
    /** owner/role 조회 완료 여부 — 수정 폼 프리필 레이스 가드용 */
    isResolved,
    isProfileLoading: isOwner && isLoading,
    isProfileError: isOwner && isError,
  };
}

export { useOwnerKindergarten };
