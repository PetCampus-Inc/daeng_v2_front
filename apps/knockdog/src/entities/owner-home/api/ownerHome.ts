import type { OwnerHomeDto } from '../model/ownerHome';

import { api, type ApiResponse } from '@shared/api';

/** `GET` - 원장 홈 조회 */
function getOwnerHome() {
  return api.get('owner/home').json<ApiResponse<OwnerHomeDto>>();
}

export { getOwnerHome };
