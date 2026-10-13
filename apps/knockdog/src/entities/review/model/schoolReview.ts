import { resolvePublicImageSrc } from '@shared/lib';

type SchoolReviewSort = 'LATEST' | 'RATING_HIGH' | 'RATING_LOW' | 'HELPFUL';

interface SchoolReviewItemDto {
  id?: number | null;
  schoolId?: number | string | null;
  schoolName?: string | null;
  schoolAddress?: string | null;
  schoolThumbnailS3Key?: string | null;
  rating?: number | null;
  content?: string | null;
  createdAt?: string | number[] | null;
  displayedAt?: string | number[] | null;
  images?: unknown;
  version?: number | null;
  helpfulCount?: number | null;
  helpedByMe?: boolean | null;
  reportedByMe?: boolean | null;
  mine?: boolean | null;
  isCurrentlyAttending?: boolean | null;
}

interface SchoolReviewListDto {
  totalCount?: number | null;
  page?: number | null;
  hasNext?: boolean | null;
  items?: SchoolReviewItemDto[] | null;
}

interface SchoolReviewPhoto {
  imageId: number | null;
  url: string;
}

interface SchoolReview {
  id: string;
  rating: number;
  createdAt: string;
  content: string;
  photos: SchoolReviewPhoto[];
  version: number;
  helpfulCount: number;
  helpedByMe: boolean;
  reportedByMe: boolean;
  mine: boolean;
  isCurrentlyAttending: boolean;
}

interface SchoolReviewPage {
  totalCount: number;
  page: number;
  hasNext: boolean;
  items: SchoolReview[];
}

const SCHOOL_REVIEW_PAGE_SIZE = 10;

function parseSchoolId(value: string | number | null | undefined) {
  if (typeof value === 'number' && Number.isSafeInteger(value) && value > 0) return value;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

function toCount(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : 0;
}

/** ISO 문자열 또는 Jackson LocalDateTime 배열(KST wall time) */
function toDateTime(value: string | number[] | null | undefined) {
  if (typeof value === 'string' && value.length > 0) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toISOString();
  }

  if (!Array.isArray(value) || value.length < 3) return '';

  const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = value;
  if (typeof year !== 'number' || typeof month !== 'number' || typeof day !== 'number') return '';

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

  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function toImageId(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function toReviewPhoto(record: Record<string, unknown>): SchoolReviewPhoto | null {
  const imageId = toImageId(record.imageId);
  const rawKey = [record.s3Key, record.key, record.imageKey, record.tempKey].find(
    (item): item is string => typeof item === 'string' && item.length > 0
  );
  const rawUrl = [record.url, record.imageUrl].find(
    (item): item is string => typeof item === 'string' && item.length > 0
  );
  const url =
    rawUrl && /^(https?:|blob:|data:)/i.test(rawUrl) ? rawUrl : resolvePublicImageSrc(rawKey || rawUrl);

  if (!url && imageId == null) return null;
  return { imageId, url: url || '' };
}

function toReviewPhotos(value: unknown): SchoolReviewPhoto[] {
  if (typeof value === 'string') {
    const photo = toReviewPhoto({ key: value.trim() });
    return photo ? [photo] : [];
  }

  if (Array.isArray(value)) return value.flatMap((item) => toReviewPhotos(item));
  if (!value || typeof value !== 'object') return [];
  const photo = toReviewPhoto(value as Record<string, unknown>);
  return photo ? [photo] : [];
}

function toSchoolReview(dto: SchoolReviewItemDto): SchoolReview | null {
  if (typeof dto.id !== 'number' || !Number.isFinite(dto.id)) return null;

  const displayedAt = toDateTime(dto.displayedAt);
  const createdAt = toDateTime(dto.createdAt);

  return {
    id: String(dto.id),
    rating: toCount(dto.rating),
    createdAt: displayedAt || createdAt,
    content: dto.content ?? '',
    photos: toReviewPhotos(dto.images),
    version: toCount(dto.version),
    helpfulCount: toCount(dto.helpfulCount),
    helpedByMe: dto.helpedByMe === true,
    reportedByMe: dto.reportedByMe === true,
    mine: dto.mine === true,
    isCurrentlyAttending: dto.isCurrentlyAttending === true,
  };
}

interface MySchoolReview extends SchoolReview {
  schoolId: number | null;
  schoolName: string;
  schoolAddress: string;
  schoolThumbnailUrl: string;
}

interface MySchoolReviewPage {
  totalCount: number;
  page: number;
  hasNext: boolean;
  items: MySchoolReview[];
}

function toMySchoolReview(dto: SchoolReviewItemDto): MySchoolReview | null {
  const review = toSchoolReview(dto);
  if (!review) return null;

  return {
    ...review,
    schoolId: parseSchoolId(dto.schoolId),
    schoolName: dto.schoolName?.trim() || '',
    schoolAddress: dto.schoolAddress?.trim() || '',
    schoolThumbnailUrl: resolvePublicImageSrc(dto.schoolThumbnailS3Key),
  };
}

function toMySchoolReviewPage(dto: SchoolReviewListDto | null | undefined, page: number): MySchoolReviewPage {
  const items = (dto?.items ?? []).flatMap((item) => {
    const review = toMySchoolReview(item);
    return review ? [review] : [];
  });

  return {
    totalCount: toCount(dto?.totalCount),
    page: typeof dto?.page === 'number' && Number.isFinite(dto.page) ? dto.page : page,
    hasNext: dto?.hasNext === true,
    items,
  };
}

function toSchoolReviewPage(dto: SchoolReviewListDto | null | undefined, page: number): SchoolReviewPage {
  const items = (dto?.items ?? []).flatMap((item) => {
    const review = toSchoolReview(item);
    return review ? [review] : [];
  });

  return {
    totalCount: toCount(dto?.totalCount),
    page: typeof dto?.page === 'number' && Number.isFinite(dto.page) ? dto.page : page,
    hasNext: dto?.hasNext === true,
    items,
  };
}

export { parseSchoolId, SCHOOL_REVIEW_PAGE_SIZE, toMySchoolReviewPage, toSchoolReview, toSchoolReviewPage };
export type {
  MySchoolReview,
  MySchoolReviewPage,
  SchoolReview,
  SchoolReviewItemDto,
  SchoolReviewListDto,
  SchoolReviewPage,
  SchoolReviewPhoto,
  SchoolReviewSort,
};
