type LegalDocumentType = 'TERMS_OF_SERVICE' | 'PRIVACY_POLICY' | 'LOCATION_SERVICE_TERMS';
type LegalDocumentDisplayStatus = 'CURRENT' | 'UPCOMING' | 'PAST';
type PlatformDateTime = string | number[] | null;

const PLATFORM_DATE_FORMATTER = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

interface PlatformNoticeItemDto {
  id?: number | null;
  title?: string | null;
  publishedAt?: PlatformDateTime;
}

interface PlatformNoticePageDto {
  items?: PlatformNoticeItemDto[] | null;
  nextCursor?: string | null;
  hasNext?: boolean | null;
}

interface PlatformNoticeDetailDto {
  id?: number | null;
  title?: string | null;
  body?: unknown;
  publishedAt?: PlatformDateTime;
}

type PlatformNoticeDetail = PlatformNoticeDetailDto | null;

interface LegalDocumentVersionItemDto {
  id?: number | null;
  announcedAt?: PlatformDateTime;
  effectiveAt?: PlatformDateTime;
  displayStatus?: LegalDocumentDisplayStatus | null;
}

interface LegalDocumentVersionListDto {
  items?: LegalDocumentVersionItemDto[] | null;
}

interface LegalDocumentDetailDto {
  id?: number | null;
  type?: LegalDocumentType | null;
  title?: string | null;
  body?: unknown;
  announcedAt?: PlatformDateTime;
  effectiveAt?: PlatformDateTime;
}

interface PlatformNoticeItem {
  id: string;
  title: string;
  publishedAt: string;
}

interface PlatformNoticePage {
  items: PlatformNoticeItem[];
  nextCursor: string | null;
  hasNext: boolean;
}

interface LegalDocumentVersionItem {
  id: number;
  announcedAt: string | null;
  effectiveAt: string | null;
  displayStatus: LegalDocumentDisplayStatus | null;
}

function toPlatformDateTime(value: PlatformDateTime | undefined): string | null {
  if (typeof value === 'string' && value.trim()) {
    const date = new Date(/(?:Z|[+-]\d{2}:?\d{2})$/i.test(value) ? value : `${value}+09:00`);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  if (!Array.isArray(value) || value.length < 3) return null;

  const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = value;
  if (
    typeof year !== 'number' ||
    typeof month !== 'number' ||
    typeof day !== 'number' ||
    ![year, month, day, hour, minute, second, nano].every((part) => typeof part === 'number' && Number.isFinite(part))
  ) {
    return null;
  }

  const date = new Date(
    Date.UTC(year, month - 1, day, hour - 9, minute, second, Math.floor(nano / 1_000_000))
  );
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function formatPlatformDate(value: PlatformDateTime | undefined): string {
  const dateValue = toPlatformDateTime(value);
  return dateValue ? PLATFORM_DATE_FORMATTER.format(new Date(dateValue)) : '';
}

function toPlatformNoticePage(dto: PlatformNoticePageDto | null | undefined): PlatformNoticePage {
  const items = (dto?.items ?? []).flatMap((item) => {
    if (typeof item.id !== 'number' || !Number.isSafeInteger(item.id)) return [];
    return [{ id: String(item.id), title: item.title?.trim() ?? '', publishedAt: toPlatformDateTime(item.publishedAt) ?? '' }];
  });
  const hasNext = dto?.hasNext === true && Boolean(dto.nextCursor);

  return { items, nextCursor: hasNext ? dto?.nextCursor ?? null : null, hasNext };
}

function toLegalDocumentVersions(dto: LegalDocumentVersionListDto | null | undefined) {
  return (dto?.items ?? []).flatMap((item) => {
    if (typeof item.id !== 'number' || !Number.isSafeInteger(item.id)) return [];
    return [{
      id: item.id,
      announcedAt: toPlatformDateTime(item.announcedAt),
      effectiveAt: toPlatformDateTime(item.effectiveAt),
      displayStatus: item.displayStatus ?? null,
    }];
  });
}

export type {
  LegalDocumentDetailDto,
  LegalDocumentDisplayStatus,
  LegalDocumentType,
  PlatformDateTime,
  LegalDocumentVersionItem,
  LegalDocumentVersionListDto,
  PlatformNoticeDetailDto,
  PlatformNoticeDetail,
  PlatformNoticeItem,
  PlatformNoticePage,
  PlatformNoticePageDto,
};
export { formatPlatformDate, toLegalDocumentVersions, toPlatformDateTime, toPlatformNoticePage };
