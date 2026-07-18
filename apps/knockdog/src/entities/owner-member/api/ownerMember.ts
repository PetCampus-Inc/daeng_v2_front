import { api, type ApiResponse } from '@shared/api';

import type { OwnerMembersDto } from '../model/ownerMember';

/** `GET` - 원장 구성원 목록 조회 */
async function getOwnerMembers() {
  return await api.get('owner/members').json<ApiResponse<OwnerMembersDto>>();
}

export { getOwnerMembers };
