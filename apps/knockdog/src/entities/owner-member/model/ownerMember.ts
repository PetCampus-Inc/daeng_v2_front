import {
  toOwnerMemberStatusBadge,
  type OwnerMemberExpiringReason,
  type OwnerMemberTicketState,
} from './ownerMemberStatusBadge';
import { toOwnerMemberGuardianLine } from './ownerMemberGuardianLine';
import { toOwnerMemberTicketSummary } from './ownerMemberTicketSummary';

type OwnerMemberGender = 'male' | 'female';

interface OwnerMember {
  id: string;
  petId: string | null;
  dogName: string;
  guardianName: string;
  profileImageUrl: string | null;
  lastAttendanceAt: number | null;
  gender: OwnerMemberGender | null;
  /** 보호자 한 줄 문구. 예: `김지원 보호자 · 010-0000-0000` */
  guardianLine: string;
  /** 상태 배지 문구. 배지가 없으면 null */
  statusBadge: string | null;
  /** 이용권 정보 문구. 보여줄 이용권이 없으면 null */
  ticketSummary: string | null;
}

interface OwnerMemberTicketDto {
  ticketId: number;
  name: string;
  status: 'SCHEDULED' | 'IN_USE' | 'HOLDING' | 'EXPIRED';
  remainingCount: number;
  chargeCount: number;
  expiresOn: string | null;
  daysLeft: number | null;
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
  gender?: 'MALE' | 'FEMALE' | null;
  breed?: string | null;
  guardianPhoneNumber?: string | null;
  ticketState?: OwnerMemberTicketState;
  expiringReason?: OwnerMemberExpiringReason | null;
  ticket?: OwnerMemberTicketDto | null;
}

interface OwnerMemberCounts {
  all: number;
  expiring: number;
  expired: number;
}

interface OwnerMembersResponse {
  members: OwnerMember[];
  totalMemberCount: number;
  /** 검색어·칩과 무관한 유치원 전체 기준 원생 수 */
  counts: OwnerMemberCounts;
  /** 승인 대기 중인 신청 수 */
  pendingCount: number;
}

interface OwnerMembersDto {
  members: OwnerMemberDto[];
  totalStudentCount: number;
  counts?: OwnerMemberCounts;
  pendingCount?: number;
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

    const timestamp = new Date(
      year,
      month - 1,
      day,
      hour,
      minute,
      second,
      Math.floor(nanosecond / 1_000_000)
    ).getTime();
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
    gender: member.gender === 'MALE' ? 'male' : member.gender === 'FEMALE' ? 'female' : null,
    guardianLine: toOwnerMemberGuardianLine(guardianName, member.guardianPhoneNumber ?? null),
    statusBadge: toOwnerMemberStatusBadge({
      ticketState: member.ticketState ?? 'NONE',
      expiringReason: member.expiringReason ?? null,
      daysLeft: member.ticket?.daysLeft ?? null,
    }),
    ticketSummary: toOwnerMemberTicketSummary(member.ticket ?? null),
  };
}

function findOwnerMemberByPetId(members: OwnerMember[], petId: string | undefined) {
  if (!petId) return null;

  return members.find((member) => (member.petId != null ? member.petId === petId : member.id === petId)) ?? null;
}

function findOwnerMemberByDogName(members: OwnerMember[], dogName: string | undefined) {
  if (!dogName) return null;

  return members.find((member) => member.dogName === dogName) ?? null;
}

function toOwnerMembersResponse(response: OwnerMembersDto): OwnerMembersResponse {
  return {
    members: response.members.map(toOwnerMember),
    totalMemberCount: response.totalStudentCount,
    counts: response.counts ?? {
      all: response.totalStudentCount,
      expiring: 0,
      expired: 0,
    },
    pendingCount: response.pendingCount ?? 0,
  };
}

function toOwnerPendingMembersResponse(response: OwnerPendingMembersDto): OwnerMembersResponse {
  return {
    members: response.requests.map(toOwnerMember),
    totalMemberCount: response.pendingCount,
    counts: { all: response.pendingCount, expiring: 0, expired: 0 },
    pendingCount: response.pendingCount,
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
  OwnerMemberCounts,
  OwnerMemberGender,
  OwnerMemberDto,
  OwnerMembersResponse,
  OwnerMembersDto,
  OwnerInviteDto,
  OwnerPendingMembersDto,
};
