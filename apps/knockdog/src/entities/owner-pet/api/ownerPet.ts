import type { OwnerPetConnectionsDto } from '../model/ownerPetConnection';
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

/** `GET` - 원생 유치원 연결 이력 (현재/과거, 등원 횟수) */
function getOwnerPetConnections(petId: string) {
  return api
    .get(`owner/pets/${petId}/connections`)
    .json<ApiResponse<OwnerPetConnectionsDto>>();
}

export { getOwnerPet, getOwnerPetConnections, getOwnerPetGuardian };
