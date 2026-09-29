import { resolvePublicImageSrc } from '@shared/lib/utils/resolvePublicImageSrc';

interface SchoolNewsImageDto {
  imageId?: number | null;
  tempKey?: string | null;
  originalFilename?: string | null;
}

interface SchoolNewsAuthorDto {
  id?: number | null;
  name?: string | null;
  profileImage?: string | null;
}

interface SchoolNewsReadSummaryDto {
  readCount?: number | null;
  totalGuardianCount?: number | null;
}

interface SchoolNewsItemDto {
  id?: number | null;
  title?: string | null;
  body?: string | null;
  notice?: boolean | null;
  createdAt?: string | number[] | null;
  modifiedAt?: string | number[] | null;
  author?: SchoolNewsAuthorDto | null;
  images?: SchoolNewsImageDto[] | null;
  readSummary?: SchoolNewsReadSummaryDto | null;
}

interface SchoolNewsListDto {
  items?: SchoolNewsItemDto[] | null;
  nextCursor?: number | null;
  hasNext?: boolean | null;
}

interface SchoolNewsItem {
  id: string;
  title: string;
  body: string;
  isAnnouncement: boolean;
  publishedAt: string;
  authorName: string;
  authorProfileImageUrl: string | null;
  imageUrls: string[];
  thumbnailUrl: string | null;
  readCount: number;
  guardianTotalCount: number;
}

interface SchoolNewsPage {
  items: SchoolNewsItem[];
  nextCursor: number | null;
  hasNext: boolean;
}

const SCHOOL_NEWS_PAGE_SIZE = 30;
const SCHOOL_NEWS_MAX_PAGES = 20;

function parseSchoolId(value: string | number | null | undefined) {
  if (typeof value === 'number' && Number.isSafeInteger(value) && value > 0) return value;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

function toCount(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function toImageUrl(value: string | null | undefined) {
  const resolved = resolvePublicImageSrc(value?.trim());
  return resolved || null;
}

/** ISO 문자열 또는 Jackson LocalDateTime 배열(KST wall time) */
function toPublishedAt(value: string | number[] | null | undefined) {
  if (typeof value === 'string' && value.length > 0) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
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

  const millisecond = typeof nano === 'number' && Number.isFinite(nano) ? Math.floor(nano / 1_000_000) : 0;
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

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function toSchoolNewsItem(dto: SchoolNewsItemDto): SchoolNewsItem | null {
  if (typeof dto.id !== 'number' || !Number.isFinite(dto.id)) return null;

  const publishedAt = toPublishedAt(dto.createdAt);
  if (!publishedAt) return null;

  const imageUrls = (dto.images ?? [])
    .map((image) => toImageUrl(image.tempKey))
    .filter((url): url is string => Boolean(url));

  return {
    id: String(dto.id),
    title: dto.title?.trim() ?? '',
    body: dto.body ?? '',
    isAnnouncement: dto.notice === true,
    publishedAt,
    authorName: dto.author?.name?.trim() ?? '',
    authorProfileImageUrl: toImageUrl(dto.author?.profileImage),
    imageUrls,
    thumbnailUrl: imageUrls[0] ?? null,
    readCount: toCount(dto.readSummary?.readCount),
    guardianTotalCount: toCount(dto.readSummary?.totalGuardianCount),
  };
}

function toSchoolNewsPage(dto: SchoolNewsListDto | null | undefined): SchoolNewsPage {
  const items = (dto?.items ?? [])
    .map((item) => toSchoolNewsItem(item))
    .filter((item): item is SchoolNewsItem => item !== null);
  const hasNext = dto?.hasNext === true;
  const nextCursor =
    hasNext && typeof dto?.nextCursor === 'number' && Number.isFinite(dto.nextCursor)
      ? dto.nextCursor
      : null;

  return { items, nextCursor, hasNext: hasNext && nextCursor !== null };
}

export { parseSchoolId, SCHOOL_NEWS_MAX_PAGES, SCHOOL_NEWS_PAGE_SIZE, toSchoolNewsPage };
export type { SchoolNewsItem, SchoolNewsListDto, SchoolNewsPage };
