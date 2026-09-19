import { api, type ApiResponse } from '@shared/api';

interface PostDisconnectGuardianSchoolParams {
  /** 펫 ID (`dogId` 쿼리) */
  dogId: string;
}

/**
 * `POST` - 보호자 유치원 연결 해제
 * `POST /api/v0/member/dog/school?dogId=` (`disconnectSchool`)
 *
 * TODO: 서버 구현/배포 확인 후 UI 플로우에 연동.
 * 현재 런타임에서는 404 — 연결 이력 화면은 UI-only로 처리 중.
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
