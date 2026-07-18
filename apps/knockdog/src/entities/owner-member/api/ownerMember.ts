import type { OwnerMembersDto, OwnerPendingMembersDto } from '../model/ownerMember';

import { api, type ApiResponse } from '@shared/api';

/** `GET` - 원장 구성원 목록 조회 */
async function getOwnerMembers() {
  return await api.get('owner/members').json<ApiResponse<OwnerMembersDto>>();
}

/** `GET` - 원장 구성원 승인 대기 목록 조회 */
async function getOwnerPendingMembers() {
  return await api.get('owner/members/pending').json<ApiResponse<OwnerPendingMembersDto>>();
}

/** `POST` - 원장 구성원 연결 신청 승인 */
async function postApproveOwnerMember(memberId: string) {
  return await api.post(`owner/members/${memberId}/approve`).json<ApiResponse<Record<string, never>>>();
}

/** `POST` - 원장 구성원 연결 신청 거절 */
async function postRejectOwnerMember(memberId: string) {
  return await api.post(`owner/members/${memberId}/reject`).json<ApiResponse<Record<string, never>>>();
}

/** `POST` - 원장 구성원 연결 해제 */
async function postDisconnectOwnerMember(memberId: string) {
  return await api.post(`owner/members/${memberId}/disconnect`).json<ApiResponse<Record<string, never>>>();
}

export {
  getOwnerMembers,
  getOwnerPendingMembers,
  postApproveOwnerMember,
  postDisconnectOwnerMember,
  postRejectOwnerMember,
};
