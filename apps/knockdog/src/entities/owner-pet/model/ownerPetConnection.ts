/**
 * 원생 유치원 연결 이력 API DTO
 * `GET /api/v0/owner/pets/{petId}/connections`
 */

type OwnerPetConnectionDateTime = string | number[];

interface OwnerPetConnectionDto {
  membershipId?: number | string | null;
  connectedAt?: OwnerPetConnectionDateTime | null;
  disconnectedAt?: OwnerPetConnectionDateTime | null;
  attendedDays?: number | null;
  current?: boolean | null;
}

interface OwnerPetConnectionsDto {
  connections?: OwnerPetConnectionDto[] | null;
}

interface OwnerPetConnection {
  membershipId: string;
  connectedAt: Date;
  /** 현재 연결이면 null */
  disconnectedAt: Date | null;
  attendedDays: number;
  isCurrent: boolean;
}

function parseConnectionDate(value: OwnerPetConnectionDateTime | null | undefined): Date | null {
  if (value == null) return null;

  if (typeof value === 'string') {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (!Array.isArray(value) || value.length < 3) return null;

  const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = value;
  if (
    typeof year !== 'number' ||
    typeof month !== 'number' ||
    typeof day !== 'number' ||
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    return null;
  }

  const millisecond =
    typeof nano === 'number' && Number.isFinite(nano) ? Math.floor(nano / 1_000_000) : 0;
  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      (typeof hour === 'number' ? hour : 0) - 9,
      typeof minute === 'number' ? minute : 0,
      typeof second === 'number' ? second : 0,
      millisecond
    )
  );

  return Number.isNaN(date.getTime()) ? null : date;
}

function toMembershipId(value: number | string | null | undefined): string | null {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'string' && value.trim()) return value.trim();
  return null;
}

function toOwnerPetConnection(dto: OwnerPetConnectionDto | null | undefined): OwnerPetConnection | null {
  if (!dto) return null;

  const membershipId = toMembershipId(dto.membershipId);
  const connectedAt = parseConnectionDate(dto.connectedAt);
  if (!membershipId || !connectedAt) return null;

  const disconnectedAt = parseConnectionDate(dto.disconnectedAt);
  const isCurrent = dto.current ?? disconnectedAt == null;

  return {
    membershipId,
    connectedAt,
    disconnectedAt: isCurrent ? null : disconnectedAt ?? connectedAt,
    attendedDays:
      typeof dto.attendedDays === 'number' && Number.isFinite(dto.attendedDays) ? dto.attendedDays : 0,
    isCurrent,
  };
}

function toOwnerPetConnections(dto: OwnerPetConnectionsDto | null | undefined): OwnerPetConnection[] {
  return (dto?.connections ?? [])
    .map(toOwnerPetConnection)
    .filter((item): item is OwnerPetConnection => item != null);
}

export { toOwnerPetConnections };
export type { OwnerPetConnection, OwnerPetConnectionDto, OwnerPetConnectionsDto };
