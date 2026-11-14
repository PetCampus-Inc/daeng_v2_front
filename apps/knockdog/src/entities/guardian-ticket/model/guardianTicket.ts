import { z } from 'zod';

const TICKET_STATUS = {
  IN_USE: 'active',
  SCHEDULED: 'scheduled',
  HOLDING: 'onHold',
  EXPIRED: 'expired',
} as const;

const CONNECTION = {
  NONE: 'none',
  PENDING: 'pending',
  CONNECTED: 'connected',
} as const;

type GuardianTicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];
type GuardianTicketConnection = (typeof CONNECTION)[keyof typeof CONNECTION];

interface GuardianTicketHold {
  startsOn: string;
  endsOn: string;
}

const EXPIRED_REASON = {
  EXHAUSTED: 'exhausted',
  PERIOD_ENDED: 'periodEnded',
} as const;

type GuardianTicketEndReason = (typeof EXPIRED_REASON)[keyof typeof EXPIRED_REASON];

interface GuardianTicket {
  id: string;
  name: string;
  status: GuardianTicketStatus;
  remainingCount: number;
  totalCount: number;
  startsOn: string;
  endsOn: string | null;
  daysLeft: number | null;
  showDDay: boolean;
  reservable: boolean;
  hold: GuardianTicketHold | null;
  expiredOn: string | null;
  endReason: GuardianTicketEndReason | null;
}

interface GuardianTicketSchool {
  id: string;
  name: string;
  address: string;
  imageUrl?: string;
}

interface GuardianTicketCard {
  connection: GuardianTicketConnection;
  manageCount: number;
  school: GuardianTicketSchool | null;
  tickets: GuardianTicket[];
}

interface GuardianTicketManage {
  available: GuardianTicket[];
  inactive: GuardianTicket[];
  expired: GuardianTicket[];
}

const HISTORY_KIND = {
  CHARGE: 'charge',
  USE: 'use',
  USE_CANCEL: 'cancel',
  HOLD: 'hold',
  HOLD_RELEASE: 'release',
  EXTEND: 'extend',
} as const;

type GuardianTicketHistoryKind = (typeof HISTORY_KIND)[keyof typeof HISTORY_KIND];

interface GuardianTicketHistory {
  id: string;
  occurredAt: string;
  kind: GuardianTicketHistoryKind;
  count: number | null;
  remainingCount: number;
  detailOn: string | null;
  isVoided: boolean;
}

interface GuardianTicketDetail {
  ticket: GuardianTicket;
  history: GuardianTicketHistory[];
}

const idSchema = z.union([z.number().int(), z.string()]);

const toDateKey = (value: string | number[] | null | undefined, ctx: z.RefinementCtx) => {
  if (value == null) return null;

  if (typeof value === 'string') {
    const datePart = value.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return datePart;
  }

  if (Array.isArray(value) && value.length >= 3) {
    const [year, month, day] = value;
    if (typeof year === 'number' && typeof month === 'number' && typeof day === 'number') {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  ctx.addIssue({ code: 'custom', message: '날짜 형식이 올바르지 않아요' });
  return z.NEVER;
};

const requiredDateSchema = z.union([z.string(), z.array(z.number())]).transform((value, ctx) => {
  const date = toDateKey(value, ctx);
  if (!date) {
    ctx.addIssue({ code: 'custom', message: '날짜 형식이 올바르지 않아요' });
    return z.NEVER;
  }
  return date;
});

const nullableDateSchema = z
  .union([z.string(), z.array(z.number()), z.null()])
  .nullish()
  .transform((value, ctx) => toDateKey(value, ctx));

const ticketDtoSchema = z.object({
  ticketId: idSchema,
  schoolId: idSchema,
  schoolName: z.string(),
  name: z.string(),
  status: z.enum(['SCHEDULED', 'IN_USE', 'HOLDING', 'EXPIRED']),
  remainingCount: z.number().int(),
  chargeCount: z.number().int(),
  startDate: requiredDateSchema,
  expiresOn: nullableDateSchema,
  daysLeft: z.number().int().nullish(),
  showDDay: z.boolean(),
  hold: z
    .object({
      startDate: requiredDateSchema,
      endDate: requiredDateSchema,
      daysAfterHold: z.number().int().nullable(),
    })
    .nullable(),
  expiredReason: z.enum(['EXHAUSTED', 'PERIOD_ENDED']).nullish(),
  expiredOn: nullableDateSchema,
  reservable: z.boolean(),
});

const schoolDtoSchema = z
  .object({
    schoolId: idSchema,
    name: z.string(),
    address: z.string(),
    thumbnailImageUrl: z.string().nullish(),
  })
  .nullable();

const ticketCardResponseSchema = z.object({
  data: z.object({
    connection: z.enum(['NONE', 'PENDING', 'CONNECTED']),
    school: schoolDtoSchema,
    manageCount: z.number().int(),
    tickets: z.array(ticketDtoSchema),
  }),
});

const ticketManageResponseSchema = z.object({
  data: z.object({
    available: z.array(ticketDtoSchema),
    inactive: z.array(ticketDtoSchema),
    expired: z.array(ticketDtoSchema),
  }),
});

const toDateTimeKey = (value: string | number[], ctx: z.RefinementCtx) => {
  if (typeof value === 'string') {
    const matched = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(?::(\d{2}))?/.exec(value);
    if (matched) return `${matched[1]}T${matched[2]}:${matched[3] ?? '00'}`;
  }

  if (Array.isArray(value) && value.length >= 3) {
    const year = value[0];
    const month = value[1];
    const day = value[2];
    const hour = value[3] ?? 0;
    const minute = value[4] ?? 0;
    const second = value[5] ?? 0;
    if (
      typeof year === 'number' &&
      typeof month === 'number' &&
      typeof day === 'number' &&
      typeof hour === 'number' &&
      typeof minute === 'number' &&
      typeof second === 'number'
    ) {
      const pad = (part: number) => String(part).padStart(2, '0');
      return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}`;
    }
  }

  ctx.addIssue({ code: 'custom', message: '날짜 형식이 올바르지 않아요' });
  return z.NEVER;
};

const dateTimeSchema = z.union([z.string(), z.array(z.number())]).transform(toDateTimeKey);

const historyItemSchema = z.object({
  type: z.enum(['CHARGE', 'USE', 'USE_CANCEL', 'HOLD', 'HOLD_RELEASE', 'EXTEND']),
  occurredAt: dateTimeSchema,
  countDelta: z.number().int().nullable(),
  remainingAfter: z.number().int(),
  reservedForDate: nullableDateSchema,
  canceled: z.boolean(),
  holdEndDate: nullableDateSchema,
  newExpiresOn: nullableDateSchema,
});

const ticketDetailResponseSchema = z.object({
  data: z.object({
    ticket: ticketDtoSchema,
    history: z.array(historyItemSchema),
  }),
});

type TicketDto = z.infer<typeof ticketDtoSchema>;
type HistoryItemDto = z.infer<typeof historyItemSchema>;

const parseGuardianTicketCard = (response: unknown) => ticketCardResponseSchema.parse(response).data;

const parseGuardianTicketManage = (response: unknown) => ticketManageResponseSchema.parse(response).data;

const parseGuardianTicketDetail = (response: unknown) => ticketDetailResponseSchema.parse(response).data;

const voidResponseSchema = z.object({
  status: z.number().int(),
  message: z.string(),
});

const parseGuardianTicketDelete = (response: unknown) => voidResponseSchema.parse(response);

const toGuardianTicket = (dto: TicketDto): GuardianTicket => ({
  id: String(dto.ticketId),
  name: dto.name,
  status: TICKET_STATUS[dto.status],
  remainingCount: dto.remainingCount,
  totalCount: dto.chargeCount,
  startsOn: dto.startDate,
  endsOn: dto.expiresOn,
  daysLeft: dto.daysLeft ?? null,
  showDDay: dto.showDDay,
  reservable: dto.reservable,
  hold: dto.hold ? { startsOn: dto.hold.startDate, endsOn: dto.hold.endDate } : null,
  expiredOn: dto.expiredOn,
  endReason: dto.expiredReason ? EXPIRED_REASON[dto.expiredReason] : null,
});

const toGuardianTicketCard = (dto: ReturnType<typeof parseGuardianTicketCard>): GuardianTicketCard => ({
  connection: CONNECTION[dto.connection],
  manageCount: dto.manageCount,
  school: dto.school
    ? {
        id: String(dto.school.schoolId),
        name: dto.school.name,
        address: dto.school.address,
        ...(dto.school.thumbnailImageUrl ? { imageUrl: dto.school.thumbnailImageUrl } : {}),
      }
    : null,
  tickets: dto.tickets.map(toGuardianTicket),
});

const toGuardianTicketManage = (dto: ReturnType<typeof parseGuardianTicketManage>): GuardianTicketManage => ({
  available: dto.available.map(toGuardianTicket),
  inactive: dto.inactive.map(toGuardianTicket),
  expired: dto.expired.map(toGuardianTicket),
});

const historyDetailOn = (item: HistoryItemDto, startsOn: string) => {
  if (item.type === 'CHARGE') return startsOn;
  if (item.type === 'USE' || item.type === 'USE_CANCEL') return item.reservedForDate;
  if (item.type === 'HOLD') return item.holdEndDate;
  if (item.type === 'EXTEND') return item.newExpiresOn;
  return null;
};

const toGuardianTicketHistory = (item: HistoryItemDto, index: number, startsOn: string): GuardianTicketHistory => ({
  id: `${item.occurredAt}-${item.type}-${index}`,
  occurredAt: item.occurredAt,
  kind: HISTORY_KIND[item.type],
  count: item.countDelta,
  remainingCount: item.remainingAfter,
  detailOn: historyDetailOn(item, startsOn),
  isVoided: item.canceled,
});

const toGuardianTicketDetail = (dto: ReturnType<typeof parseGuardianTicketDetail>): GuardianTicketDetail => {
  const ticket = toGuardianTicket(dto.ticket);

  return {
    ticket,
    history: dto.history.map((item, index) => toGuardianTicketHistory(item, index, ticket.startsOn)),
  };
};

export {
  parseGuardianTicketCard,
  parseGuardianTicketDelete,
  parseGuardianTicketDetail,
  parseGuardianTicketManage,
  toGuardianTicketCard,
  toGuardianTicketDetail,
  toGuardianTicketManage,
};
export type {
  GuardianTicket,
  GuardianTicketCard,
  GuardianTicketDetail,
  GuardianTicketHistory,
  GuardianTicketManage,
  GuardianTicketStatus,
};
