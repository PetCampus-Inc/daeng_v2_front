import type { PutOwnerSchoolProfileRequest } from '@entities/owner-school';
import { buildOwnerSchoolImagePayload } from '@entities/owner-school';
import { sortDaysOfWeek } from '@shared/constants';
import type { WebImageAsset } from '@shared/lib/media';
import type { EditFormDraft } from '@views/mypage-owner-kindergarten-edit-page/lib/editFormDraft';

/** FilterOption→ school profile BE 코드 */
const UI_CODE_TO_PROFILE: Record<string, string> = {
  SMALL_DOG_ONLY: 'SMALL_DOG',
  MEDIUM_LARGE_DOG_ONLY: 'MEDIUM_LARGE_DOG',
  BATH_SERVICE: 'BATH',
  PICK_DROP: 'PICKDROP',
  ROOFTOP: 'ROOFTOP_TERRACE',
};

function toProfileCodes(codes: string[]) {
  return codes
    .map((code) => UI_CODE_TO_PROFILE[code] ?? code)
    .filter((code) => code !== 'SPLIT_CLASS');
}

function requireTime(value: string | null, label: string) {
  const trimmed = value?.trim().slice(0, 5);
  const selectionError = new Error(`${label}을(를) 선택해 주세요`);

  if (!trimmed || !/^\d{2}:\d{2}$/.test(trimmed)) {
    throw selectionError;
  }

  const [hourText, minuteText] = trimmed.split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    throw selectionError;
  }

  return trimmed;
}

interface BuildOwnerSchoolProfilePayloadParams {
  draft: EditFormDraft;
  moveImage: (params: { key: string; path: string }) => Promise<{ data?: string | null }>;
}

/** 운영 정보 수정 draft → PUT owner/school/profile body */
async function buildOwnerSchoolProfilePayload({
  draft,
  moveImage,
}: BuildOwnerSchoolProfilePayloadParams): Promise<PutOwnerSchoolProfileRequest> {
  const profileImages = await buildOwnerSchoolImagePayload({
    assets: draft.images as WebImageAsset[],
    moveImage,
    movePath: 'owner/school/profile',
    emptyKeyErrorMessage: '업로드된 대표 이미지 키가 없어요',
    moveErrorMessage: '대표 이미지 이동에 실패했어요',
  });

  return {
    profileImages,
    name: draft.name.trim(),
    address: draft.address.trim(),
    addressDetail: draft.addressDetail.trim(),
    phoneNumber: draft.phone.trim(),
    weekdayOpenTime: requireTime(draft.weekdayStart, '평일 시작 시간'),
    weekdayCloseTime: requireTime(draft.weekdayEnd, '평일 종료 시간'),
    weekendOpenTime: requireTime(draft.weekendStart, '주말 시작 시간'),
    weekendCloseTime: requireTime(draft.weekendEnd, '주말 종료 시간'),
    closedDays: sortDaysOfWeek(draft.closedDays),
    homepageUrl: draft.homepage.trim(),
    instagramUrl: draft.instagram.trim(),
    youtubeUrl: draft.youtube.trim(),
    dogBreeds: toProfileCodes(draft.breeds),
    dogServices: toProfileCodes(draft.dogServices),
    dogSafetyFacilities: toProfileCodes(draft.safetyFacilities),
    visitorAmenities: toProfileCodes(draft.amenities),
  };
}

export { buildOwnerSchoolProfilePayload };
