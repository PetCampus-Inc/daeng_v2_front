import { api, type ApiResponse } from '@shared/api';

/** BE `OwnerRoleRevokeReason` */
type OwnerRoleRevokeReason = 'CLOSED' | 'STOP_USING_SERVICE' | 'ETC';

interface RevokeOwnerRoleRequest {
  reason: OwnerRoleRevokeReason;
  reasonDetail?: string | null;
}

/** `POST` - 원장 권한 해지 */
async function postRevokeOwnerRole(request: RevokeOwnerRoleRequest) {
  return await api
    .post('owner/role/revoke', { json: request })
    .json<ApiResponse<null>>();
}

export {
  postRevokeOwnerRole,
  type OwnerRoleRevokeReason,
  type RevokeOwnerRoleRequest,
};
