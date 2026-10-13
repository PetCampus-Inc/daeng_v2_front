import { resolvePublicImageSrc } from '@shared/lib';

type SchoolReviewSort = 'LATEST' | 'RATING_HIGH' | 'RATING_LOW' | 'HELPFUL';

interface SchoolReviewItemDto {
  id?: number | null;
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

interface SchoolReview {
  id: string;
  rating: number;
  createdAt: string;
  content: string;
  images: string[];
  imageKeys: string[];
  imageIds: Array<number | null>;
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

function toReviewImages(value: unknown): { imageId: number | null; key: string; url: string }[] {
  if (typeof value === 'string') {
    const key = value.trim();
    if (!key) return [];
    const url = resolvePublicImageSrc(key);
    return url ? [{ imageId: null, key, url }] : [];
  }

  if (Array.isArray(value)) return value.flatMap((item) => toReviewImages(item));

  if (!value || typeof value !== 'object') return [];

  const record = value as Record<string, unknown>;
  const imageId = toImageId(record.imageId);
  const rawKey = [record.s3Key, record.key, record.imageKey, record.tempKey].find(
    (item) => typeof item === 'string' && item.length > 0
  );
  const rawUrl = [record.url, record.imageUrl].find((item) => typeof item === 'string' && item.length > 0);
  const key = typeof rawKey === 'string' ? rawKey : '';
  const url =
    typeof rawUrl === 'string' && /^(https?:|blob:|data:)/i.test(rawUrl)
      ? rawUrl
      : resolvePublicImageSrc(key || (typeof rawUrl === 'string' ? rawUrl : ''));

  if (!url && imageId == null) return [];
  return [{ imageId, key, url: url || '' }];
}

function toSchoolReview(dto: SchoolReviewItemDto): SchoolReview | null {
  if (typeof dto.id !== 'number' || !Number.isFinite(dto.id)) return null;

  const displayedAt = toDateTime(dto.displayedAt);
  const createdAt = toDateTime(dto.createdAt);

  const images = toReviewImages(dto.images);

  return {
    id: String(dto.id),
    rating: toCount(dto.rating),
    createdAt: displayedAt || createdAt,
    content: dto.content ?? '',
    images: images.map((image) => image.url),
    imageKeys: images.map((image) => image.key),
    imageIds: images.map((image) => image.imageId),
    version: toCount(dto.version),
    helpfulCount: toCount(dto.helpfulCount),
    helpedByMe: dto.helpedByMe === true,
    reportedByMe: dto.reportedByMe === true,
    mine: dto.mine === true,
    isCurrentlyAttending: dto.isCurrentlyAttending === true,
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

export { parseSchoolId, SCHOOL_REVIEW_PAGE_SIZE, toSchoolReviewPage };
export type { SchoolReview, SchoolReviewListDto, SchoolReviewPage, SchoolReviewSort };
