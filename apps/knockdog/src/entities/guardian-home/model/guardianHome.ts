/**
 * 보호자 유치원 홈 API DTO 
 * `GET /api/v0/guardian/school/home`
 */

type GuardianHomeConnectionStatus = 'none' | 'pending' | 'approved' | 'disconnected';

type GuardianHomeDateTime = string | number[];

interface GuardianHomeSchoolDto {
  schoolId?: number | string | null;
  /** `School.kindergartenPlaceId` — 상세 `kindergarten/main/{placeId}` */
  placeId?: number | string | null;
  kindergartenPlaceId?: number | string | null;
  name?: string | null;
  address?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  thumbnailImageUrl?: string | null;
  thumbnailS3Key?: string | null;
  /** 해당 유치원 첫 등원일 — 주황점 하한 */
  firstAttendedAt?: GuardianHomeDateTime | null;
  firstAttendanceDate?: string | null;
}

interface GuardianHomeAlbumPreviewDto {
  id?: number | string | null;
  imageUrl?: string | null;
  authorId?: number | string | null;
  createdAt?: GuardianHomeDateTime | null;
  isFavorite?: boolean | null;
}

interface GuardianHomeDto {
  status?: string | null;
  school?: GuardianHomeSchoolDto | null;
  checkInAt?: GuardianHomeDateTime | null;
  checkOutAt?: GuardianHomeDateTime | null;
  todayNoteArrived?: boolean | null;
  todayAlbumPreview?: GuardianHomeAlbumPreviewDto[] | null;
  /** 해당 유치원 첫 등원일 — 캘린더 주황점 기준 */
  firstAttendedAt?: GuardianHomeDateTime | null;
  firstAttendanceDate?: string | null;
}

interface GuardianHomeAlbumPreview {
  id: string;
  imageUrl: string;
  authorId: string | null;
  createdAt: string | null;
  isFavorite: boolean;
}

interface GuardianHomeSchool {
  /** schoolId — 앨범 등 school 스코프 API */
  id: string;
  /** kindergartenPlaceId — 상세 페이지 경로 */
  placeId: string | null;
  name: string;
  address: string;
  imageUrl: string;
}

interface GuardianHome {
  status: GuardianHomeConnectionStatus;
  school: GuardianHomeSchool | null;
  checkInAt: Date | null;
  checkOutAt: Date | null;
  /** 해당 유치원 첫 등원일 (없으면 null) */
  firstAttendedAt: Date | null;
  todayNoteArrived: boolean;
  todayAlbumPreview: GuardianHomeAlbumPreview[];
}

const STATUS_BY_API: Record<string, GuardianHomeConnectionStatus> = {
  NOT_CONNECTED: 'none',
  /** 연결됨 · 오늘 등원 전 */
  BEFORE_ATTENDANCE: 'approved',
  /** 오늘 등원 중 */
  ATTENDING: 'approved',
  /** 오늘 하원 완료 */
  LEFT: 'approved',
  /** 연결 해제 */
  DISCONNECTED: 'disconnected',
  /** 유치원 연결 승인 대기 */
  PENDING: 'pending',
};

function toConnectionStatus(value: string | null | undefined): GuardianHomeConnectionStatus {
  if (!value) return 'none';
  return STATUS_BY_API[value.toUpperCase()] ?? 'none';
}

function toAbsoluteImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (/^(https?:|blob:|data:)/i.test(url)) return url;
  const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? '';
  return `${base}${encodeURI(url)}`;
}

function parseApiDateTime(value: GuardianHomeDateTime | null | undefined): Date | null {
  if (value == null) return null;

  if (typeof value === 'string') {
    if (value.length === 0) return null;

    // LocalDate `YYYY-MM-DD` — 캘린더 일자(KST 자정)
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-').map(Number);
      if (!year || !month || !day) return null;
      const date = new Date(Date.UTC(year, month - 1, day, -9));
      return Number.isNaN(date.getTime()) ? null : date;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (!Array.isArray(value) || value.length < 3) return null;

  const [year, month, day, hour, minute, second = 0, nano = 0] = value;
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

  // LocalDate `[y,m,d]` — 캘린더 일자만 보존 (KST 자정)
  if (value.length === 3) {
    const date = new Date(Date.UTC(year, month - 1, day, -9));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  // LocalDateTime — API 계약 타임존(KST) wall time → UTC instant
  if (
    typeof hour !== 'number' ||
    typeof minute !== 'number' ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    return null;
  }

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      hour - 9,
      minute,
      typeof second === 'number' ? second : 0,
      millisecond
    )
  );

  return Number.isNaN(date.getTime()) ? null : date;
}

function toIsoStringOrNull(value: GuardianHomeDateTime | null | undefined): string | null {
  const date = parseApiDateTime(value);
  return date ? date.toISOString() : null;
}

function toAlbumPreview(
  dto: GuardianHomeAlbumPreviewDto | null | undefined
): GuardianHomeAlbumPreview | null {
  if (!dto) return null;
  const imageUrl = toAbsoluteImageUrl(dto.imageUrl);
  if (!imageUrl) return null;
  const id = dto.id;
  if (id == null || id === '') return null;

  return {
    id: String(id),
    imageUrl,
    authorId: dto.authorId == null || dto.authorId === '' ? null : String(dto.authorId),
    createdAt: toIsoStringOrNull(dto.createdAt),
    isFavorite: Boolean(dto.isFavorite),
  };
}

function toGuardianHomeSchool(dto: GuardianHomeSchoolDto | null | undefined): GuardianHomeSchool | null {
  if (!dto) return null;
  const schoolId = dto.schoolId;
  if (schoolId == null || schoolId === '') return null;

  const placeId = dto.placeId ?? dto.kindergartenPlaceId;
  return {
    id: String(schoolId),
    placeId: placeId == null || placeId === '' ? null : String(placeId),
    name: dto.name ?? '',
    address: dto.address ?? '',
    imageUrl: toAbsoluteImageUrl(
      dto.thumbnailImageUrl ?? dto.imageUrl ?? dto.thumbnailUrl ?? dto.thumbnailS3Key
    ),
  };
}

function parseFirstAttendedAt(dto: GuardianHomeDto | null | undefined): Date | null {
  const school = dto?.school;
  const candidates: Array<GuardianHomeDateTime | string | null | undefined> = [
    dto?.firstAttendedAt,
    dto?.firstAttendanceDate,
    school?.firstAttendedAt,
    school?.firstAttendanceDate,
  ];

  for (const candidate of candidates) {
    const date = parseApiDateTime(candidate);
    if (date) return date;
  }

  return null;
}

function toGuardianHome(dto: GuardianHomeDto | null | undefined): GuardianHome {
  const status = toConnectionStatus(dto?.status);
  const school = toGuardianHomeSchool(dto?.school);
  const todayAlbumPreview = (dto?.todayAlbumPreview ?? [])
    .map(toAlbumPreview)
    .filter((item): item is GuardianHomeAlbumPreview => item != null);

  return {
    status,
    school: status === 'none' ? null : school,
    checkInAt: parseApiDateTime(dto?.checkInAt),
    checkOutAt: parseApiDateTime(dto?.checkOutAt),
    firstAttendedAt: parseFirstAttendedAt(dto),
    todayNoteArrived: Boolean(dto?.todayNoteArrived),
    todayAlbumPreview,
  };
}

export { parseApiDateTime, toGuardianHome };
export type {
  GuardianHome,
  GuardianHomeAlbumPreview,
  GuardianHomeAlbumPreviewDto,
  GuardianHomeConnectionStatus,
  GuardianHomeDateTime,
  GuardianHomeDto,
  GuardianHomeSchool,
  GuardianHomeSchoolDto,
};
