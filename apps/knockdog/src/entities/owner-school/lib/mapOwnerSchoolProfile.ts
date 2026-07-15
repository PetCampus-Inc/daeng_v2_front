import type { KindergartenBasic, OperationTime } from '@entities/kindergarten';
import type { ProductType } from '@entities/pricing';

import type { LocalTimeParts, OwnerSchoolProfile } from '../model/types';

/** BE school profile 코드 → 운영 탭 SERVICE_ICON_MAP / 라벨 맵 코드 */
const PROFILE_CODE_TO_UI: Record<string, string> = {
  SMALL_DOG: 'SMALL_DOG_ONLY',
  MEDIUM_LARGE_DOG: 'MEDIUM_LARGE_DOG_ONLY',
  BATH: 'BATH_SERVICE',
  PICKDROP: 'PICK_DROP',
  ROOFTOP_TERRACE: 'ROOFTOP',
};

function toS3Url(s3Key?: string | null) {
  if (!s3Key) return null;
  const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? '';
  return `${base}${encodeURI(s3Key)}`;
}

function formatLocalTime(value: LocalTimeParts | string | null | undefined): string | null {
  if (value == null) return null;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    // "09:00" | "09:00:00"
    return trimmed.slice(0, 5);
  }

  const hour = String(value.hour).padStart(2, '0');
  const minute = String(value.minute).padStart(2, '0');
  return `${hour}:${minute}`;
}

function formatLastUpdatedAt(value: string | null | undefined) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function mapProfileCodes(codes: string[] | null | undefined) {
  return (codes ?? []).map((code) => PROFILE_CODE_TO_UI[code] ?? code);
}

function buildFullAddress(address?: string | null, addressDetail?: string | null) {
  return [address, addressDetail].filter((part) => Boolean(part?.trim())).join(' ');
}

function buildOperationTimes(profile: OwnerSchoolProfile): OperationTime[] {
  const weekdayOpen = formatLocalTime(profile.weekdayOpenTime);
  const weekdayClose = formatLocalTime(profile.weekdayCloseTime);
  const weekendOpen = formatLocalTime(profile.weekendOpenTime);
  const weekendClose = formatLocalTime(profile.weekendCloseTime);

  if (!weekdayOpen || !weekdayClose) return [];

  return [
    {
      serviceTags: 'DEFAULT',
      weekday: [
        { time: weekdayOpen, breakTime: '' },
        { time: weekdayClose, breakTime: '' },
      ],
      weekend:
        weekendOpen && weekendClose
          ? [
              { time: '', breakTime: weekendOpen },
              { time: '', breakTime: weekendClose },
            ]
          : [],
      closedDays: profile.closedDays ?? [],
    },
  ];
}

function resolveThumbnailUrl(profile: OwnerSchoolProfile) {
  if (profile.thumbnailS3Key) return toS3Url(profile.thumbnailS3Key);

  const sorted = [...(profile.profileImages ?? [])].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );
  return toS3Url(sorted[0]?.s3Key);
}

function mapPriceImageKeys(profile: OwnerSchoolProfile) {
  return [...(profile.priceImages ?? [])]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((image) => image.s3Key)
    .filter(Boolean);
}

/** 운영 탭 `OperationSections` / BasicInfoCard용 KindergartenBasic 호환 뷰 */
function mapOwnerSchoolProfileToBasic(profile: OwnerSchoolProfile): KindergartenBasic {
  return {
    id: profile.kindergartenPlaceId ?? String(profile.schoolId),
    roadAddress: buildFullAddress(profile.address, profile.addressDetail),
    coord: { lat: 0, lng: 0 },
    operationTimes: buildOperationTimes(profile),
    dogBreeds: mapProfileCodes(profile.dogBreeds) as KindergartenBasic['dogBreeds'],
    dogServices: mapProfileCodes(profile.dogServices) as KindergartenBasic['dogServices'],
    dogSafetyFacilities: mapProfileCodes(
      profile.dogSafetyFacilities
    ) as KindergartenBasic['dogSafetyFacilities'],
    visitorAmenities: mapProfileCodes(
      profile.visitorAmenities
    ) as KindergartenBasic['visitorAmenities'],
    homepageUrl: profile.homepageUrl ?? '',
    instagramUrl: profile.instagramUrl ?? '',
    youtubeUrl: profile.youtubeUrl ?? '',
    lastUpdatedAt: formatLastUpdatedAt(profile.lastUpdatedAt),
  };
}

function mapOwnerSchoolProfilePricing(profile: OwnerSchoolProfile) {
  return {
    productType: (profile.pricingTypes ?? []) as ProductType[],
    priceImages: mapPriceImageKeys(profile),
    lastUpdatedAt: formatLastUpdatedAt(profile.lastUpdatedAt),
  };
}

export {
  buildFullAddress,
  formatLastUpdatedAt,
  formatLocalTime,
  mapOwnerSchoolProfilePricing,
  mapOwnerSchoolProfileToBasic,
  resolveThumbnailUrl,
  toS3Url,
};
