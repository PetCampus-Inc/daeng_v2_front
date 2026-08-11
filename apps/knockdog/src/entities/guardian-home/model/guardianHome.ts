/**
 * 보호자 유치원 홈 API DTO
 * `GET /api/v0/guardian/school/home`
 */

type GuardianHomeConnectionStatus = 'none' | 'pending' | 'approved' | 'disconnected';

interface GuardianHomeSchoolDto {
  schoolId?: number | string | null;
  name?: string | null;
  address?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
}

interface GuardianHomeAlbumPreviewDto {
  id?: number | string | null;
  imageUrl?: string | null;
  authorId?: number | string | null;
  createdAt?: string | null;
  isFavorite?: boolean | null;
}

interface GuardianHomeDto {
  status?: string | null;
  school?: GuardianHomeSchoolDto | null;
  checkInAt?: string | null;
  checkOutAt?: string | null;
  todayNoteArrived?: boolean | null;
  todayAlbumPreview?: GuardianHomeAlbumPreviewDto[] | null;
}

interface GuardianHomeAlbumPreview {
  id: string;
  imageUrl: string;
  authorId: string | null;
  createdAt: string | null;
  isFavorite: boolean;
}

interface GuardianHomeSchool {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
}

interface GuardianHome {
  status: GuardianHomeConnectionStatus;
  school: GuardianHomeSchool | null;
  checkInAt: Date | null;
  checkOutAt: Date | null;
  todayNoteArrived: boolean;
  todayAlbumPreview: GuardianHomeAlbumPreview[];
}

const STATUS_BY_API: Record<string, GuardianHomeConnectionStatus> = {
  NOT_CONNECTED: 'none',
  NONE: 'none',
  PENDING: 'pending',
  REQUESTED: 'pending',
  WAITING: 'pending',
  CONNECTED: 'approved',
  APPROVED: 'approved',
  ACTIVE: 'approved',
  DISCONNECTED: 'disconnected',
};

function toConnectionStatus(value: string | null | undefined): GuardianHomeConnectionStatus {
  if (!value) return 'none';
  return STATUS_BY_API[value.toUpperCase()] ?? 'none';
}

function toAbsoluteImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (/^(https?:|blob:|data:)/i.test(url)) return url;
  const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? '';
  return `${base}${url}`;
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
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
    createdAt: dto.createdAt ?? null,
    isFavorite: Boolean(dto.isFavorite),
  };
}

function toGuardianHomeSchool(dto: GuardianHomeSchoolDto | null | undefined): GuardianHomeSchool | null {
  if (!dto) return null;
  const schoolId = dto.schoolId;
  if (schoolId == null || schoolId === '') return null;

  return {
    id: String(schoolId),
    name: dto.name ?? '',
    address: dto.address ?? '',
    imageUrl: dto.imageUrl ?? dto.thumbnailUrl ?? '',
  };
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
    checkInAt: parseDate(dto?.checkInAt),
    checkOutAt: parseDate(dto?.checkOutAt),
    todayNoteArrived: Boolean(dto?.todayNoteArrived),
    todayAlbumPreview,
  };
}

export { toGuardianHome };
export type {
  GuardianHome,
  GuardianHomeAlbumPreview,
  GuardianHomeAlbumPreviewDto,
  GuardianHomeConnectionStatus,
  GuardianHomeDto,
  GuardianHomeSchool,
  GuardianHomeSchoolDto,
};
