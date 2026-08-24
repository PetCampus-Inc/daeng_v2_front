interface OwnerMember {
  id: string;
  petId: string | null;
  dogName: string;
  guardianName: string;
  profileImageUrl: string | null;
  lastAttendanceAt: number | null;
}

type OwnerMemberDateTime = string | number[];

interface OwnerMemberDto {
  id?: number | string;
  memberId?: number | string;
  requestId?: number | string;
  petId?: number | string | null;
  dogName: string;
  guardianName: string | null;
  profileImageUrl: string | null;
  lastAttendanceAt?: OwnerMemberDateTime | null;
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

function toAttendanceTimestamp(value: OwnerMemberDateTime | null | undefined): number | null {
  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0, second = 0, nanosecond = 0] = value;
    if (
      year === undefined ||
      month === undefined ||
      day === undefined ||
      ![year, month, day, hour, minute, second, nanosecond].every(Number.isFinite)
    ) {
      return null;
    }

    const timestamp = new Date(year, month - 1, day, hour, minute, second, Math.floor(nanosecond / 1_000_000)).getTime();
    return Number.isNaN(timestamp) ? null : timestamp;
  }

  if (typeof value === 'string') {
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? null : timestamp;
  }

  return null;
}

function toOwnerMember(member: OwnerMemberDto): OwnerMember {
  const guardianName = member.guardianName ?? '';
  const fallbackId = `${member.dogName}-${guardianName}`;
  const petId = member.petId == null ? null : String(member.petId);

  return {
    id: String(member.memberId ?? member.requestId ?? member.id ?? petId ?? fallbackId),
    petId,
    dogName: member.dogName,
    guardianName,
    profileImageUrl: member.profileImageUrl,
    lastAttendanceAt: toAttendanceTimestamp(member.lastAttendanceAt),
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
