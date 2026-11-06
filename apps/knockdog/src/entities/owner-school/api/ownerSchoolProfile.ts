import { api, type ApiResponse } from '@shared/api';

import type { OwnerSchoolProfile } from '../model/types';

/** `GET` - 원장이 관리하는 유치원 공개 프로필 편집값 조회 */
async function getOwnerSchoolProfile() {
  return await api.get('owner/school/profile').json<ApiResponse<OwnerSchoolProfile>>();
}

export { getOwnerSchoolProfile };
