import { api, type ApiResponse } from '@shared/api';

interface DeleteGuardianSchoolConnectionParams {
  /** `GET guardian/school/connections`의 `schoolPetMembershipId` */
  schoolPetMembershipId: string;
}

/**
 * `DELETE` - 보호자 유치원 연결 해제
 * `DELETE /api/v0/guardian/school/connections/{schoolPetMembershipId}`
 *
 * 당일 등원 기록이 있으면 서버가 거절한다.
 */
function deleteGuardianSchoolConnection({
  schoolPetMembershipId,
}: DeleteGuardianSchoolConnectionParams) {
  return api
    .delete(`guardian/school/connections/${schoolPetMembershipId}`)
    .json<ApiResponse<Record<string, never>>>();
}

export { deleteGuardianSchoolConnection };
export type { DeleteGuardianSchoolConnectionParams };
