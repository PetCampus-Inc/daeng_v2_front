import type { OwnerInviteDto, OwnerMembersDto, OwnerPendingMembersDto } from '../model/ownerMember';

import { api, type ApiResponse } from '@shared/api';

type OwnerMembersFilter = 'ALL' | 'EXPIRING' | 'EXPIRED';

interface GetOwnerMembersParams {
  /** 이름·견종 검색어. 비어 있으면 보내지 않는다 */
  keyword?: string;
  /** 만료 상태 필터. 기본 `ALL` */
  filter?: OwnerMembersFilter;
}

/** `GET` - 원장 구성원 목록 조회 */
function getOwnerMembers({ keyword, filter }: GetOwnerMembersParams = {}) {
  const searchParams: Record<string, string> = {};
  if (keyword) searchParams.keyword = keyword;
  if (filter && filter !== 'ALL') searchParams.filter = filter;

  return api.get('owner/members', { searchParams }).json<ApiResponse<OwnerMembersDto>>();
}

type OwnerPendingSort = 'LATEST' | 'NAME' | 'OLDEST';

interface GetOwnerPendingMembersParams {
  /** 검색어. 비어 있으면 보내지 않는다 */
  keyword?: string;
  /** 신청 목록 정렬 기준. 기본 `LATEST` */
  sort?: OwnerPendingSort;
}

/** `GET` - 원장 구성원 승인 대기 목록 조회 */
function getOwnerPendingMembers({ sort = 'LATEST', keyword }: GetOwnerPendingMembersParams = {}) {
  const searchParams: Record<string, string> = { sort };
  if (keyword) searchParams.keyword = keyword;

  return api.get('owner/members/pending', { searchParams }).json<ApiResponse<OwnerPendingMembersDto>>();
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

/** `POST` - 보호자 초대 링크 조회 */
function postOwnerInvite() {
  return api.post('owner/invites').json<ApiResponse<OwnerInviteDto>>();
}

export type { GetOwnerMembersParams, GetOwnerPendingMembersParams, OwnerMembersFilter, OwnerPendingSort };
export {
  getOwnerMembers,
  getOwnerPendingMembers,
  postApproveOwnerMember,
  postDisconnectOwnerMember,
  postOwnerInvite,
  postRejectOwnerMember,
};
