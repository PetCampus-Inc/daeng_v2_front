import type { OwnerHomeDto } from '../model/ownerHome';
import { ownerHomeResponseSchema } from '../model/ownerHomeSchema';

import { api, type ApiResponse } from '@shared/api';

/** `GET` - 원장 홈 조회 */
const getOwnerHome = async () => {
  const response = await api.get('owner/home').json<ApiResponse<OwnerHomeDto>>();
  return { ...response, data: ownerHomeResponseSchema.parse(response.data) };
};

const postHomeBannerDismiss = (latestId: number) =>
  api.post('owner/home/pending-approvals/dismiss', { json: { latestId } }).json<ApiResponse<null>>();

export { getOwnerHome, postHomeBannerDismiss };
