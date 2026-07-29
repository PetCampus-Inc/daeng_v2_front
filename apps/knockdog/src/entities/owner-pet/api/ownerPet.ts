import type { OwnerPetDto, OwnerPetGuardianDto } from '../model/ownerPet';

import { api, type ApiResponse } from '@shared/api';

/** `GET` - 원생 프로필 조회 (헤더 + 강아지 정보 탭) */
function getOwnerPet(petId: string) {
  return api.get(`owner/pets/${petId}`).json<ApiResponse<OwnerPetDto>>();
}

/** `GET` - 보호자 정보 조회 */
function getOwnerPetGuardian(petId: string) {
  return api
    .get(`owner/pets/${petId}/guardian`)
    .json<ApiResponse<OwnerPetGuardianDto>>();
}

export { getOwnerPet, getOwnerPetGuardian };
