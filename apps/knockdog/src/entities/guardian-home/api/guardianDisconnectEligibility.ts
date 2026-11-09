import {
  disconnectEligibilityDtoSchema,
  type GuardianDisconnectEligibilityDto,
} from '../model/guardianDisconnectEligibility';import { api, type ApiResponse } from '@shared/api';

interface GetGuardianDisconnectEligibilityParams {
  schoolPetMembershipId: string;
}

/**
 * `GET` - 보호자 유치원 연결 해제 가능 여부 조회
 * `GET /api/v0/guardian/school/connections/{schoolPetMembershipId}/disconnect-eligibility`
 */
const getDisconnectEligibility = async ({
  schoolPetMembershipId,
}: GetGuardianDisconnectEligibilityParams): Promise<GuardianDisconnectEligibilityDto> => {
  const response = await api
    .get(`guardian/school/connections/${schoolPetMembershipId}/disconnect-eligibility`)
    .json<ApiResponse<unknown>>();

  return disconnectEligibilityDtoSchema.parse(response.data);
};

export { getDisconnectEligibility };
export type { GetGuardianDisconnectEligibilityParams };
