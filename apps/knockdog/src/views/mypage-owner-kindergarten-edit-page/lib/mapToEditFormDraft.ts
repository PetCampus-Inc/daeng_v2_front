import {
  FILTER_OPTIONS,
  type FilterOption,
  type KindergartenBasic,
} from '@entities/kindergarten';
import type { WebImageAsset } from '@shared/lib/media';
import {
  emptyEditFormDraft,
  type EditFormDraft,
} from '@views/mypage-owner-kindergarten-edit-page/lib/editFormDraft';

/** place/basic 배지 코드 → 편집 칩(FilterOption) 코드 */
const BASIC_CODE_TO_FILTER: Record<string, FilterOption> = {
  ROOFTOP: 'ROOFTOP_TERRACE',
  YARD: 'TRAINING_GROUND_YARD',
  PICK_DROP: 'PICKDROP',
  SMALL_DOG: 'SMALL_DOG_ONLY',
  MEDIUM_LARGE_DOG: 'MEDIUM_LARGE_DOG_ONLY',
  BATH: 'BATH_SERVICE',
  PICKDROP: 'PICKDROP',
  ROOFTOP_TERRACE: 'ROOFTOP_TERRACE',
};

function isFilterOption(value: string): value is FilterOption {
  return value in FILTER_OPTIONS;
}

function toFilterOptions(codes: string[] | undefined): FilterOption[] {
  const selected: FilterOption[] = [];

  for (const code of codes ?? []) {
    const mapped = BASIC_CODE_TO_FILTER[code] ?? code;
    if (!isFilterOption(mapped)) continue;
    if (selected.includes(mapped)) continue;
    selected.push(mapped);
  }

  return selected;
}

function normalizeTime(value?: string | null): string | null {
  if (!value?.trim()) return null;
  return value.trim().slice(0, 5);
}

function extractOperationHours(basic?: KindergartenBasic) {
  const operation = basic?.operationTimes?.[0];
  if (!operation) {
    return {
      weekdayStart: null as string | null,
      weekdayEnd: null as string | null,
      weekendStart: null as string | null,
      weekendEnd: null as string | null,
      closedDays: [] as string[],
    };
  }

  return {
    weekdayStart: normalizeTime(operation.weekday?.[0]?.time),
    weekdayEnd: normalizeTime(operation.weekday?.[1]?.time),
    weekendStart: normalizeTime(operation.weekend?.[0]?.breakTime),
    weekendEnd: normalizeTime(operation.weekend?.[1]?.breakTime),
    closedDays: (operation.closedDays ?? []).filter((day) => day !== 'WEEKEND'),
  };
}

function toImageAssets(bannerKeys: string[]): WebImageAsset[] {
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? '';

  return bannerKeys
    .filter((key) => Boolean(key?.trim()))
    .slice(0, 5)
    .map((key) => {
      const uri = `${imageBaseUrl}${encodeURI(key)}`;
      return {
        key,
        uri,
        preSignedUrl: uri,
        type: 'image' as const,
      };
    });
}

interface MapToEditFormDraftParams {
  name: string;
  address: string;
  addressDetail?: string;
  phone: string;
  basic?: KindergartenBasic;
  bannerKeys?: string[];
  lastUpdatedDate?: string | null;
}

/** SELECTED 유치원 basic/main 데이터를 운영 정보 수정 폼 draft로 변환 */
function mapToEditFormDraft({
  name,
  address,
  addressDetail = '',
  phone,
  basic,
  bannerKeys = [],
  lastUpdatedDate = null,
}: MapToEditFormDraftParams): EditFormDraft {
  const hours = extractOperationHours(basic);

  return {
    ...emptyEditFormDraft,
    images: toImageAssets(bannerKeys),
    name: name.trim(),
    address: address.trim(),
    addressDetail: addressDetail.trim(),
    phone: phone.trim(),
    weekdayStart: hours.weekdayStart,
    weekdayEnd: hours.weekdayEnd,
    weekendStart: hours.weekendStart,
    weekendEnd: hours.weekendEnd,
    closedDays: hours.closedDays,
    homepage: basic?.homepageUrl?.trim() ?? '',
    instagram: basic?.instagramUrl?.trim() ?? '',
    youtube: basic?.youtubeUrl?.trim() ?? '',
    breeds: toFilterOptions(basic?.dogBreeds),
    dogServices: toFilterOptions(basic?.dogServices),
    safetyFacilities: toFilterOptions(basic?.dogSafetyFacilities),
    amenities: toFilterOptions(basic?.visitorAmenities),
    lastUpdatedDate: lastUpdatedDate ?? (basic?.lastUpdatedAt?.trim() || null),
    isDirty: false,
  };
}

export { mapToEditFormDraft };
