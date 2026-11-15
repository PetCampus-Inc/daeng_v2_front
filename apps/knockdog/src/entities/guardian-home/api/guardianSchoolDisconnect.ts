import { api, type ApiResponse } from '@shared/api';

interface DeleteGuardianSchoolConnectionParams {
  /** `GET guardian/school/connections`의 `schoolPetMembershipId` */
  schoolPetMembershipId: string;
}

/**
 * `DELETE` - 보호자 유치원 연결 해제
 * `DELETE /api/v0/guardian/school/connections/{schoolPetMembershipId}`
 *
 * 해제 가능 여부는 disconnect-eligibility 응답을 따르며, 실제 해제 시 서버가 다시 검증한다.
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
