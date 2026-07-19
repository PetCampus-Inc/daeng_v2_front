interface OwnerMember {
  id: string;
  dogName: string;
  guardianName: string;
  profileImageUrl: string | null;
  recentAttendanceDate?: string | null;
}

interface OwnerMemberDto {
  id?: number | string;
  memberId?: number | string;
  requestId?: number | string;
  dogName: string;
  guardianName: string;
  profileImageUrl: string | null;
  recentAttendanceDate?: string | null;
}

interface OwnerMembersResponse {
  members: OwnerMember[];
  totalMemberCount: number;
}

interface OwnerMembersDto {
  members: OwnerMemberDto[];
  totalStudentCount: number;
}

interface OwnerInviteDto {
  inviteUrl: string;
}

interface OwnerPendingMembersDto {
  pendingCount: number;
  requests: OwnerMemberDto[];
}

function toOwnerMember(member: OwnerMemberDto): OwnerMember {
  const fallbackId = `${member.dogName}-${member.guardianName}`;

  return {
    id: String(member.memberId ?? member.requestId ?? member.id ?? fallbackId),
    dogName: member.dogName,
    guardianName: member.guardianName,
    profileImageUrl: member.profileImageUrl,
    recentAttendanceDate: member.recentAttendanceDate,
  };
}

function toOwnerMembersResponse(response: OwnerMembersDto): OwnerMembersResponse {
  return {
    members: response.members.map(toOwnerMember),
    totalMemberCount: response.totalStudentCount,
  };
}

function toOwnerPendingMembersResponse(response: OwnerPendingMembersDto): OwnerMembersResponse {
  return {
    members: response.requests.map(toOwnerMember),
    totalMemberCount: response.pendingCount,
  };
}

export { toOwnerMember, toOwnerMembersResponse, toOwnerPendingMembersResponse };
export type {
  OwnerMember,
  OwnerMemberDto,
  OwnerMembersResponse,
  OwnerMembersDto,
  OwnerInviteDto,
  OwnerPendingMembersDto,
};
