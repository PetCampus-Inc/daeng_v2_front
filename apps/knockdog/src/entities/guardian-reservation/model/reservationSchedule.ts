import { z } from 'zod';

const CALENDAR_BLOCK = {
  NOT_CONNECTED: 'notConnected',
  REGISTRATION_NOT_VERIFIED: 'registrationNotVerified',
  SETTING_NOT_READY: 'settingNotReady',
  NO_USABLE_TICKET: 'noUsableTicket',
} as const;

const DAY_BLOCK = {
  PAST: 'past',
  CLOSED_DAY: 'closedDay',
  FULL: 'full',
  NO_USABLE_TICKET: 'noUsableTicket',
  NO_TIME_LEFT: 'noTimeLeft',
} as const;

type ReservationCalendarBlock = (typeof CALENDAR_BLOCK)[keyof typeof CALENDAR_BLOCK];
type ReservationDayBlock = (typeof DAY_BLOCK)[keyof typeof DAY_BLOCK];

interface ReservationCalendarDay {
  date: string;
  isSelectable: boolean;
  reason: ReservationDayBlock | null;
  reservationId: string | null;
  reservationTime: string | null;
}

interface ReservationCalendar {
  isReservable: boolean;
  reason: ReservationCalendarBlock | null;
  schoolId: string | null;
  schoolName: string | null;
  usableRemainingCount: number;
  nearestExpiresOn: string | null;
  days: ReservationCalendarDay[];
}

interface ReservationSlot {
  time: string;
  minutes: number;
  isAvailable: boolean;
}

interface ReservationSlots {
  date: string;
  isSelectable: boolean;
  reason: ReservationDayBlock | null;
  reservationId: string | null;
  slots: ReservationSlot[];
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

const toClock = (value: string | number[] | null | undefined, ctx: z.RefinementCtx) => {
  if (value == null) return null;

  if (typeof value === 'string') {
    const matched = /^(\d{2}):(\d{2})/.exec(value);
    if (matched) return `${matched[1]}:${matched[2]}`;
  }

  if (Array.isArray(value) && value.length >= 2) {
    const [hour, minute] = value;
    if (typeof hour === 'number' && typeof minute === 'number') {
      return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }
  }

  ctx.addIssue({ code: 'custom', message: '시간 형식이 올바르지 않아요' });
  return z.NEVER;
};

const nullableClockSchema = z
  .union([z.string(), z.array(z.number()), z.null()])
  .nullish()
  .transform((value, ctx) => toClock(value, ctx));

const requiredClockSchema = z.union([z.string(), z.array(z.number())]).transform((value, ctx) => {
  const time = toClock(value, ctx);
  if (!time) {
    ctx.addIssue({ code: 'custom', message: '시간 형식이 올바르지 않아요' });
    return z.NEVER;
  }
  return time;
});

const calendarDaySchema = z.object({
  date: requiredDateSchema,
  selectable: z.boolean(),
  reason: z.enum(['PAST', 'CLOSED_DAY', 'FULL', 'NO_USABLE_TICKET', 'NO_TIME_LEFT']).nullable(),
  reservationId: idSchema.nullable(),
  reservationTime: nullableClockSchema,
});

const calendarResponseSchema = z.object({
  data: z.object({
    reservable: z.boolean(),
    unavailableReason: z
      .enum(['NOT_CONNECTED', 'REGISTRATION_NOT_VERIFIED', 'SETTING_NOT_READY', 'NO_USABLE_TICKET'])
      .nullable(),
    schoolId: idSchema.nullable(),
    schoolName: z.string().nullable(),
    tickets: z.object({
      usableRemainingCount: z.number().int(),
      nearestExpiresOn: nullableDateSchema,
    }),
    days: z.array(calendarDaySchema),
  }),
});

const slotSchema = z.object({
  time: requiredClockSchema,
  available: z.boolean(),
});

const slotsResponseSchema = z.object({
  data: z.object({
    date: requiredDateSchema,
    selectable: z.boolean(),
    unavailableReason: z.enum(['PAST', 'CLOSED_DAY', 'FULL', 'NO_USABLE_TICKET', 'NO_TIME_LEFT']).nullable(),
    reservationId: idSchema.nullable(),
    slots: z.array(slotSchema),
  }),
});

type CalendarDto = z.infer<typeof calendarResponseSchema>['data'];
type SlotsDto = z.infer<typeof slotsResponseSchema>['data'];

const toMinutes = (time: string) => {
  const [hour = '0', minute = '0'] = time.split(':');
  return Number(hour) * 60 + Number(minute);
};

const parseReservationCalendar = (response: unknown) => calendarResponseSchema.parse(response).data;

const parseReservationSlots = (response: unknown) => slotsResponseSchema.parse(response).data;

const toReservationCalendar = (dto: CalendarDto): ReservationCalendar => ({
  isReservable: dto.reservable,
  reason: dto.unavailableReason ? CALENDAR_BLOCK[dto.unavailableReason] : null,
  schoolId: dto.schoolId == null ? null : String(dto.schoolId),
  schoolName: dto.schoolName,
  usableRemainingCount: dto.tickets.usableRemainingCount,
  nearestExpiresOn: dto.tickets.nearestExpiresOn,
  days: dto.days.map((day) => ({
    date: day.date,
    isSelectable: day.selectable,
    reason: day.reason ? DAY_BLOCK[day.reason] : null,
    reservationId: day.reservationId == null ? null : String(day.reservationId),
    reservationTime: day.reservationTime,
  })),
});

const toReservationSlots = (dto: SlotsDto): ReservationSlots => ({
  date: dto.date,
  isSelectable: dto.selectable,
  reason: dto.unavailableReason ? DAY_BLOCK[dto.unavailableReason] : null,
  reservationId: dto.reservationId == null ? null : String(dto.reservationId),
  slots: dto.slots.map((slot) => ({
    time: slot.time,
    minutes: toMinutes(slot.time),
    isAvailable: slot.available,
  })),
});

export { parseReservationCalendar, parseReservationSlots, toReservationCalendar, toReservationSlots };
export type { ReservationCalendar, ReservationCalendarDay, ReservationSlot, ReservationSlots };
