import { resolvePublicImageSrc } from '@shared/lib/utils/resolvePublicImageSrc';

interface SchoolNewsImageDto {
  id?: number | null;
  imageId?: number | null;
  imageUrl?: string | null;
  tempKey?: string | null;
  originalFilename?: string | null;
  displayOrder?: number | null;
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

interface SchoolNewsImage {
  imageId: number | null;
  tempKey: string | null;
  originalFilename: string;
  url: string;
}

interface SchoolNewsItem {
  id: string;
  title: string;
  body: string;
  isAnnouncement: boolean;
  publishedAt: string;
  authorName: string;
  authorProfileImageUrl: string | null;
  images: SchoolNewsImage[];
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

function toNewsImageId(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function toDisplayOrder(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
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

  const images = [...(dto.images ?? [])]
    .sort((left, right) => toDisplayOrder(left.displayOrder) - toDisplayOrder(right.displayOrder))
    .flatMap((image) => {
      const url = toImageUrl(image.imageUrl) ?? toImageUrl(image.tempKey);
      if (!url) return [];

      const imageId = toNewsImageId(image.imageId ?? image.id);

      return [
        {
          imageId,
          tempKey: image.tempKey?.trim() || null,
          originalFilename: image.originalFilename?.trim() || 'image.jpg',
          url,
        },
      ];
    });
  const imageUrls = images.map((image) => image.url);

  return {
    id: String(dto.id),
    title: dto.title?.trim() ?? '',
    body: dto.body ?? '',
    isAnnouncement: dto.notice === true,
    publishedAt,
    authorName: dto.author?.name?.trim() ?? '',
    authorProfileImageUrl: toImageUrl(dto.author?.profileImage),
    images,
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

interface SchoolNewsImageRequest {
  imageId?: number;
  tempKey?: string;
  originalFilename: string;
}

interface SchoolNewsWriteRequest {
  title: string;
  body: string;
  notice: boolean;
  sendNotification: boolean;
  images: SchoolNewsImageRequest[];
}

interface SchoolNewsUploadFileRequest {
  filename: string;
  contentType: string;
  size: number;
}

interface SchoolNewsUploadUrlItemDto {
  tempKey?: string | null;
  uploadUrl?: string | null;
}

interface SchoolNewsUploadUrlResponseDto {
  items?: SchoolNewsUploadUrlItemDto[] | null;
}

interface SchoolNewsCreatedDto {
  id?: number | null;
}

interface SchoolNewsReaderDto {
  guardianId?: number | null;
  guardianName?: string | null;
  petSummary?: string | null;
  readAt?: string | number[] | null;
}

interface SchoolNewsReadersDto {
  totalGuardianCount?: number | null;
  readCount?: number | null;
  readers?: SchoolNewsReaderDto[] | null;
}

interface SchoolNewsReader {
  guardianId: string;
  guardianName: string;
  petSummary: string;
  readAt: string | null;
}

interface SchoolNewsReaders {
  totalGuardianCount: number;
  readCount: number;
  readers: SchoolNewsReader[];
}

function toSchoolNewsReaders(dto: SchoolNewsReadersDto | null | undefined): SchoolNewsReaders {
  const readers = (dto?.readers ?? []).flatMap((reader) => {
    if (typeof reader.guardianId !== 'number' || !Number.isFinite(reader.guardianId)) return [];

    return [
      {
        guardianId: String(reader.guardianId),
        guardianName: reader.guardianName?.trim() ?? '',
        petSummary: reader.petSummary?.trim() ?? '',
        readAt: toPublishedAt(reader.readAt),
      },
    ];
  });

  return {
    totalGuardianCount: toCount(dto?.totalGuardianCount),
    readCount: toCount(dto?.readCount),
    readers,
  };
}

function toCreatedNewsId(dto: SchoolNewsCreatedDto | null | undefined) {
  if (typeof dto?.id !== 'number' || !Number.isFinite(dto.id)) return null;
  return String(dto.id);
}

interface SchoolNewsDraftImageDto {
  id?: number | null;
  imageId?: number | null;
  imageUrl?: string | null;
  tempKey?: string | null;
  originalFilename?: string | null;
}

interface SchoolNewsDraftDto {
  title?: string | null;
  body?: string | null;
  notice?: boolean | null;
  sendNotification?: boolean | null;
  modifiedAt?: string | null;
  images?: SchoolNewsDraftImageDto[] | null;
}

interface SchoolNewsDraft {
  title: string;
  body: string;
  isAnnouncement: boolean;
  notifyGuardiansOnUpload: boolean;
  modifiedAt: string | null;
  images: SchoolNewsImage[];
}

function toSchoolNewsDraft(dto: SchoolNewsDraftDto | null | undefined): SchoolNewsDraft | null {
  if (!dto) return null;

  const images = (dto.images ?? []).flatMap((image) => {
    const imageId = toNewsImageId(image.imageId ?? image.id);
    const url = toImageUrl(image.imageUrl) ?? toImageUrl(image.tempKey);
    if (!url) return [];

    return [
      {
        imageId,
        tempKey: imageId == null ? image.tempKey?.trim() || null : null,
        originalFilename: image.originalFilename?.trim() || 'image.jpg',
        url,
      },
    ];
  });

  return {
    title: dto.title ?? '',
    body: dto.body ?? '',
    isAnnouncement: dto.notice === true,
    notifyGuardiansOnUpload: dto.sendNotification === true,
    modifiedAt: typeof dto.modifiedAt === 'string' && dto.modifiedAt.length > 0 ? dto.modifiedAt : null,
    images,
  };
}

export {
  parseSchoolId,
  SCHOOL_NEWS_MAX_PAGES,
  SCHOOL_NEWS_PAGE_SIZE,
  toCreatedNewsId,
  toSchoolNewsDraft,
  toSchoolNewsItem,
  toSchoolNewsPage,
  toSchoolNewsReaders,
};
export type {
  SchoolNewsCreatedDto,
  SchoolNewsDraft,
  SchoolNewsDraftDto,
  SchoolNewsImage,
  SchoolNewsImageRequest,
  SchoolNewsItem,
  SchoolNewsItemDto,
  SchoolNewsListDto,
  SchoolNewsPage,
  SchoolNewsReader,
  SchoolNewsReaders,
  SchoolNewsReadersDto,
  SchoolNewsUploadFileRequest,
  SchoolNewsUploadUrlResponseDto,
  SchoolNewsWriteRequest,
};
