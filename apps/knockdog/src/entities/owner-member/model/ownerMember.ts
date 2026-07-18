interface OwnerMember {
  id: string;
  dogName: string;
  guardianName: string;
  profileImageUrl: string | null;
  recentAttendanceDate?: string | null;
}

interface OwnerMemberDto {
  memberId: string;
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
  totalMemberCount: number;
}

function toOwnerMember(member: OwnerMemberDto): OwnerMember {
  return {
    id: member.memberId,
    dogName: member.dogName,
    guardianName: member.guardianName,
    profileImageUrl: member.profileImageUrl,
    recentAttendanceDate: member.recentAttendanceDate,
  };
}

function toOwnerMembersResponse(response: OwnerMembersDto): OwnerMembersResponse {
  return {
    members: response.members.map(toOwnerMember),
    totalMemberCount: response.totalMemberCount,
  };
}

export { toOwnerMember, toOwnerMembersResponse };
export type { OwnerMember, OwnerMemberDto, OwnerMembersResponse, OwnerMembersDto };
