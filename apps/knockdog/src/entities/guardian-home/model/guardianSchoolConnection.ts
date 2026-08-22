/**
 * 보호자 유치원 연결 이력 API DTO
 * `GET /api/v0/guardian/school/connections`
 */

import { parseApiDateTime, type GuardianHomeDateTime } from './guardianHome';

type GuardianSchoolConnectionStatus = 'pending' | 'approved' | 'disconnected' | 'none';

interface GuardianSchoolConnectionDto {
  schoolPetMembershipId?: number | string | null;
  schoolId?: number | string | null;
  /** `School.kindergartenPlaceId` — 상세 `kindergarten/main/{placeId}` */
  placeId?: number | string | null;
  name?: string | null;
  address?: string | null;
  thumbnailImageUrl?: string | null;
  status?: string | null;
  connectedAt?: GuardianHomeDateTime | null;
  disconnectedAt?: GuardianHomeDateTime | null;
  attendedDays?: number | null;
}

interface GuardianSchoolConnectionsDto {
  connections?: GuardianSchoolConnectionDto[] | null;
}

interface GuardianSchoolConnection {
  id: string;
  schoolId: string;
  /** kindergartenPlaceId — 상세 페이지 경로 */
  placeId: string | null;
  name: string;
  address: string;
  imageUrl: string;
  status: GuardianSchoolConnectionStatus;
  connectedAt: Date | null;
  disconnectedAt: Date | null;
  attendedDays: number;
}

const STATUS_BY_API: Record<string, GuardianSchoolConnectionStatus> = {
  PENDING: 'pending',
  DISCONNECTED: 'disconnected',
  APPROVED: 'approved',
  CONNECTED: 'approved',
  BEFORE_ATTENDANCE: 'approved',
  ATTENDING: 'approved',
  LEFT: 'approved',
};

function toConnectionStatus(value: string | null | undefined): GuardianSchoolConnectionStatus {
  if (!value) return 'none';
  return STATUS_BY_API[value.toUpperCase()] ?? 'none';
}

function toAbsoluteImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (/^(https?:|blob:|data:)/i.test(url)) return url;
  const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? '';
  return `${base}${url}`;
}

function toGuardianSchoolConnection(
  dto: GuardianSchoolConnectionDto | null | undefined
): GuardianSchoolConnection | null {
  if (!dto) return null;

  const membershipId = dto.schoolPetMembershipId;
  const schoolId = dto.schoolId;
  if (membershipId == null || membershipId === '' || schoolId == null || schoolId === '') return null;

  const placeId = dto.placeId;
  return {
    id: String(membershipId),
    schoolId: String(schoolId),
    placeId: placeId == null || placeId === '' ? null : String(placeId),
    name: dto.name ?? '',
    address: dto.address ?? '',
    imageUrl: toAbsoluteImageUrl(dto.thumbnailImageUrl),
    status: toConnectionStatus(dto.status),
    connectedAt: parseApiDateTime(dto.connectedAt),
    disconnectedAt: parseApiDateTime(dto.disconnectedAt),
    attendedDays: Number.isFinite(dto.attendedDays) ? Number(dto.attendedDays) : 0,
  };
}

function toGuardianSchoolConnections(dto: GuardianSchoolConnectionsDto | null | undefined): GuardianSchoolConnection[] {
  return (dto?.connections ?? [])
    .map(toGuardianSchoolConnection)
    .filter((item): item is GuardianSchoolConnection => item != null);
}

export { toGuardianSchoolConnections };
export type {
  GuardianSchoolConnection,
  GuardianSchoolConnectionDto,
  GuardianSchoolConnectionStatus,
  GuardianSchoolConnectionsDto,
};
