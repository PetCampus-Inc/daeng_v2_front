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

type OwnerPendingMembersDto =
  | OwnerMembersDto
  | OwnerMemberDto[]
  | {
      pendingMembers?: OwnerMemberDto[];
      totalPendingMemberCount?: number;
      pendingCount?: number;
      requests?: OwnerMemberDto[];
    };

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
  if (Array.isArray(response)) {
    return {
      members: response.map(toOwnerMember),
      totalMemberCount: response.length,
    };
  }

  if ('pendingMembers' in response) {
    const pendingMembers = response.pendingMembers ?? [];

    return {
      members: pendingMembers.map(toOwnerMember),
      totalMemberCount: response.totalPendingMemberCount ?? pendingMembers.length,
    };
  }

  if ('requests' in response) {
    const requests = response.requests ?? [];

    return {
      members: requests.map(toOwnerMember),
      totalMemberCount: response.pendingCount ?? requests.length,
    };
  }

  if ('members' in response) {
    return toOwnerMembersResponse(response);
  }

  return {
    members: [],
    totalMemberCount: 0,
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
