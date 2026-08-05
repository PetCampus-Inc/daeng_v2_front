interface OwnerMember {
  id: string;
  petId: string | null;
  dogName: string;
  guardianName: string;
  profileImageUrl: string | null;
  recentAttendanceDate?: string | null;
}

interface OwnerMemberDto {
  id?: number | string;
  memberId?: number | string;
  requestId?: number | string;
  petId?: number | string | null;
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
  const petId = member.petId == null ? null : String(member.petId);

  return {
    id: String(member.memberId ?? member.requestId ?? member.id ?? petId ?? fallbackId),
    petId,
    dogName: member.dogName,
    guardianName: member.guardianName,
    profileImageUrl: member.profileImageUrl,
    recentAttendanceDate: member.recentAttendanceDate,
  };
}

function findOwnerMemberByPetId(members: OwnerMember[], petId: string | undefined) {
  if (!petId) return null;

  return (
    members.find((member) =>
      member.petId != null ? member.petId === petId : member.id === petId
    ) ?? null
  );
}

function findOwnerMemberByDogName(
  members: OwnerMember[],
  dogName: string | undefined
) {
  if (!dogName) return null;

  return members.find((member) => member.dogName === dogName) ?? null;
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

export {
  findOwnerMemberByDogName,
  findOwnerMemberByPetId,
  toOwnerMember,
  toOwnerMembersResponse,
  toOwnerPendingMembersResponse,
};
export type {
  OwnerMember,
  OwnerMemberDto,
  OwnerMembersResponse,
  OwnerMembersDto,
  OwnerInviteDto,
  OwnerPendingMembersDto,
};
