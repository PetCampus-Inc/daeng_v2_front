import { api, type ApiResponse } from '@shared/api';

interface PostDisconnectGuardianSchoolParams {
  /** 펫 ID (`dogId` 쿼리) */
  dogId: string;
}

/**
 * `POST` - 보호자 유치원 연결 해제
 * `POST /api/v0/member/dog/school?dogId=`
 */
function postDisconnectGuardianSchool({ dogId }: PostDisconnectGuardianSchoolParams) {
  return api
    .post('member/dog/school', {
      searchParams: { dogId },
    })
    .json<ApiResponse<Record<string, never>>>();
}

export { postDisconnectGuardianSchool };
export type { PostDisconnectGuardianSchoolParams };
