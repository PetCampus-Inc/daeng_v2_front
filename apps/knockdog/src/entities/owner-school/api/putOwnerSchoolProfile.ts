import { api, type ApiResponse } from '@shared/api';

interface OwnerSchoolProfileImagePayload {
  s3Key: string;
  displayOrder: number;
}

interface PutOwnerSchoolProfileRequest {
  profileImages: OwnerSchoolProfileImagePayload[];
  name: string;
  address: string;
  addressDetail: string;
  phoneNumber: string;
  weekdayOpenTime: string;
  weekdayCloseTime: string;
  weekendOpenTime: string;
  weekendCloseTime: string;
  closedDays: string[];
  homepageUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  dogBreeds: string[];
  dogServices: string[];
  dogSafetyFacilities: string[];
  visitorAmenities: string[];
}

/** `PUT` - 원장 유치원 공개 프로필(운영 정보) 저장 */
async function putOwnerSchoolProfile(request: PutOwnerSchoolProfileRequest) {
  return await api
    .put('owner/school/profile', { json: request })
    .json<ApiResponse<null>>();
}

export {
  putOwnerSchoolProfile,
  type OwnerSchoolProfileImagePayload,
  type PutOwnerSchoolProfileRequest,
};
