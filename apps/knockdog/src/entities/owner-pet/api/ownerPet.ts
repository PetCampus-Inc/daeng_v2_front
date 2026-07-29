import type { OwnerPetDto } from '../model/ownerPet';

import { api, type ApiResponse } from '@shared/api';

/** `GET` - 원생 프로필 조회 (헤더 + 강아지 정보 탭) */
function getOwnerPet(petId: string) {
  return api.get(`owner/pets/${petId}`).json<ApiResponse<OwnerPetDto>>();
}

export { getOwnerPet };
