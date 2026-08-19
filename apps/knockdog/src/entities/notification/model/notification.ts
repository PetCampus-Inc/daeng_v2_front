/**
 * 알림함 API DTO
 * `GET /api/v0/notifications`
 */

interface NotificationSchoolDto {
  id?: number | string | null;
  name?: string | null;
  thumbnailUrl?: string | null;
}

interface NotificationPetDto {
  id?: number | string | null;
  name?: string | null;
}

type NotificationDateTime = string | number[];

interface NotificationDto {
  id?: number | string | null;
  type?: string | null;
  title?: string | null;
  body?: string | null;
  payload?: Record<string, unknown> | null;
  school?: NotificationSchoolDto | null;
  pet?: NotificationPetDto | null;
  readAt?: NotificationDateTime | null;
  createdAt?: NotificationDateTime | null;
}

interface NotificationInboxDto {
  notifications?: NotificationDto[] | null;
  nextCursor?: string | null;
  hasNext?: boolean | null;
  hasUnread?: boolean | null;
}

interface NotificationSchool {
  id: string;
  name: string;
  thumbnailUrl: string;
}

interface NotificationPet {
  id: string;
  name: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  payload: Record<string, unknown>;
  school: NotificationSchool | null;
  pet: NotificationPet | null;
  readAt: string | null;
  createdAt: string;
  isRead: boolean;
}

interface NotificationListPage {
  notifications: Notification[];
  nextCursor: string | null;
  hasNext: boolean;
  hasUnread: boolean;
}

function toId(value: unknown): string | null {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'string' && value.trim()) return value.trim();
  return null;
}

function toText(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/** Jackson LocalDateTime `[y,m,d,h,min,s,nano]` 는 KST wall time */
function parseApiDateTime(value: NotificationDateTime | null | undefined): Date | null {
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

function toIsoString(value: NotificationDateTime | null | undefined): string | null {
  const date = parseApiDateTime(value);
  return date ? date.toISOString() : null;
}

function toAbsoluteImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (/^(https?:|blob:|data:)/i.test(url)) return url;
  const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? '';
  return `${base}${url}`;
}

function toNotificationSchool(dto: NotificationSchoolDto | null | undefined): NotificationSchool | null {
  const id = toId(dto?.id);
  const name = toText(dto?.name);
  if (!id && !name) return null;

  return {
    id: id ?? '',
    name,
    thumbnailUrl: toAbsoluteImageUrl(dto?.thumbnailUrl),
  };
}

function toNotificationPet(dto: NotificationPetDto | null | undefined): NotificationPet | null {
  const id = toId(dto?.id);
  const name = toText(dto?.name);
  if (!id && !name) return null;

  return {
    id: id ?? '',
    name,
  };
}

function toNotification(dto: NotificationDto): Notification | null {
  const id = toId(dto.id);
  if (!id) return null;

  const createdAt = toIsoString(dto.createdAt) ?? '';
  const readAt = toIsoString(dto.readAt);

  return {
    id,
    type: toText(dto.type),
    title: toText(dto.title),
    body: toText(dto.body),
    payload: dto.payload && typeof dto.payload === 'object' && !Array.isArray(dto.payload) ? dto.payload : {},
    school: toNotificationSchool(dto.school),
    pet: toNotificationPet(dto.pet),
    readAt,
    createdAt,
    isRead: Boolean(readAt),
  };
}

function toNotificationListPage(dto: NotificationInboxDto | null | undefined): NotificationListPage {
  const notifications = (dto?.notifications ?? [])
    .map(toNotification)
    .filter((notification): notification is Notification => notification != null);

  const hasNext = Boolean(dto?.hasNext);
  const nextCursor = hasNext && typeof dto?.nextCursor === 'string' && dto.nextCursor ? dto.nextCursor : null;

  return {
    notifications,
    nextCursor,
    hasNext,
    hasUnread: Boolean(dto?.hasUnread),
  };
}

export { toNotificationListPage };
export type {
  Notification,
  NotificationDto,
  NotificationInboxDto,
  NotificationListPage,
  NotificationPet,
  NotificationSchool,
};
