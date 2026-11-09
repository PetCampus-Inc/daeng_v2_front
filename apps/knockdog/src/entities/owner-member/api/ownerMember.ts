import type { OwnerMemberDisconnectEligibilityDto } from '../model/ownerMemberDisconnect';
import type { OwnerInviteDto, OwnerMembersDto, OwnerPendingMembersDto } from '../model/ownerMember';

import { api, type ApiResponse } from '@shared/api';

/** `GET` - 원장 구성원 목록 조회 */
function getOwnerMembers() {
  return api.get('owner/members').json<ApiResponse<OwnerMembersDto>>();
}

/** `GET` - 원장 구성원 승인 대기 목록 조회 */
function getOwnerPendingMembers() {
  return api.get('owner/members/pending').json<ApiResponse<OwnerPendingMembersDto>>();
}

/** `POST` - 원장 구성원 연결 신청 승인 */
function postApproveOwnerMember(memberId: string) {
  return api.post(`owner/members/${memberId}/approve`).json<ApiResponse<Record<string, never>>>();
}

/** `POST` - 원장 구성원 연결 신청 거절 */
function postRejectOwnerMember(memberId: string) {
  return api.post(`owner/members/${memberId}/reject`).json<ApiResponse<Record<string, never>>>();
}

/** `POST` - 원장 구성원 연결 해제 */
function postDisconnectOwnerMember(memberId: string) {
  return api.post(`owner/members/${memberId}/disconnect`).json<ApiResponse<Record<string, never>>>();
}

/** `GET` - 원장 구성원 연결 해제 가능 여부 조회 (이용권·예약이 남았는지) */
function getDisconnectEligibility(memberId: string) {
  return api
    .get(`owner/members/${memberId}/disconnect-eligibility`)
    .json<ApiResponse<OwnerMemberDisconnectEligibilityDto>>();
}

/** `POST` - 보호자 초대 링크 조회 */
function postOwnerInvite() {
  return api.post('owner/invites').json<ApiResponse<OwnerInviteDto>>();
}

export {
  getDisconnectEligibility,
  getOwnerMembers,
  getOwnerPendingMembers,
  postApproveOwnerMember,
  postDisconnectOwnerMember,
  postOwnerInvite,
  postRejectOwnerMember,
};
