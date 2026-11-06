import type { GuardianSchoolConnectionsDto } from '../model/guardianSchoolConnection';

import { api, type ApiResponse } from '@shared/api';

interface GetGuardianSchoolConnectionsParams {
  petId: string;
}

/** `GET` - 보호자 유치원 연결 이력 조회 */
function getGuardianSchoolConnections({ petId }: GetGuardianSchoolConnectionsParams) {
  return api
    .get('guardian/school/connections', {
      searchParams: { petId },
    })
    .json<ApiResponse<GuardianSchoolConnectionsDto>>();
}

export { getGuardianSchoolConnections };
export type { GetGuardianSchoolConnectionsParams };
