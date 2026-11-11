import { z } from 'zod';

/** 서버 `LocalDate`. ISO 문자열 또는 `[year, month, day]` */
const toDateKey = (value: string | number[] | null | undefined): string | null => {
  if (value == null) return null;

  if (typeof value === 'string') {
    const datePart = value.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return datePart;
    return null;
  }

  if (value.length < 3) return null;
  const [year, month, day] = value;
  if (typeof year !== 'number' || typeof month !== 'number' || typeof day !== 'number') return null;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

/** 서버 시각. `HH:mm` 문자열 또는 `[hour, minute]` */
const toClock = (value: string | number[] | null | undefined): string | null => {
  if (value == null) return null;

  if (typeof value === 'string') {
    const matched = /^(\d{1,2}):(\d{2})/.exec(value);
    if (!matched?.[1] || !matched[2]) return null;
    return `${matched[1].padStart(2, '0')}:${matched[2]}`;
  }

  if (value.length < 2) return null;
  const [hour, minute] = value;
  if (typeof hour !== 'number' || typeof minute !== 'number') return null;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const nullableDateSchema = z
  .union([z.string(), z.array(z.number()), z.null()])
  .nullish()
  .transform((value) => toDateKey(value));

const requiredDateSchema = z.union([z.string(), z.array(z.number())]).transform((value, ctx) => {
  const date = toDateKey(value);
  if (!date) {
    ctx.addIssue({ code: 'custom', message: '날짜 형식이 올바르지 않아요' });
    return z.NEVER;
  }
  return date;
});

const nullableClockSchema = z
  .union([z.string(), z.array(z.number()), z.null()])
  .nullish()
  .transform((value) => toClock(value));

const disconnectBlockDtoSchema = z.object({
  type: z.enum(['ATTENDANCE', 'RESERVATION', 'TICKET']),
  ticket: z
    .object({
      name: z.string(),
      remainingCount: z.number(),
      expiresOn: nullableDateSchema,
    })
    .nullable()
    .optional(),
  reservation: z
    .object({
      date: requiredDateSchema,
      time: nullableClockSchema,
      status: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

const disconnectEligibilityDtoSchema = z.object({
  canDisconnect: z.boolean(),
  blocks: z.array(disconnectBlockDtoSchema).nullable().optional(),
});

type GuardianDisconnectEligibilityDto = z.infer<typeof disconnectEligibilityDtoSchema>;

interface GuardianDisconnectTicket {
  name: string;
  remainingCount: number;
  /** `YYYY-MM-DD`. 만료 없으면 null */
  expiresOn: string | null;
}

interface GuardianDisconnectReservation {
  /** `YYYY-MM-DD` */
  date: string;
  /** `HH:mm`. 시간이 없으면 null */
  time: string | null;
}

interface GuardianDisconnectEligibility {
  canDisconnect: boolean;
  hasTodayAttendance: boolean;
  tickets: GuardianDisconnectTicket[];
  /** 서버가 내려 주는 등원 예정일이 가장 가까운 예약 1건. 없으면 null */
  reservation: GuardianDisconnectReservation | null;
}

/** 서버 응답을 화면 모델로 바꾼다. 이유 종류별로 나눠 담는다. */
const toDisconnectEligibility = (
  dto: GuardianDisconnectEligibilityDto
): GuardianDisconnectEligibility => {
  const blocks = dto.blocks ?? [];
  const reservationBlock = blocks.find((block) => block.type === 'RESERVATION' && block.reservation);

  return {
    canDisconnect: dto.canDisconnect,
    hasTodayAttendance: blocks.some((block) => block.type === 'ATTENDANCE'),
    tickets: blocks.flatMap((block) =>
      block.type === 'TICKET' && block.ticket
        ? [
            {
              name: block.ticket.name,
              remainingCount: block.ticket.remainingCount,
              expiresOn: block.ticket.expiresOn ?? null,
            },
          ]
        : []
    ),
    reservation: reservationBlock?.reservation
      ? {
          date: reservationBlock.reservation.date,
          time: reservationBlock.reservation.time ?? null,
        }
      : null,
  };
};

export { disconnectEligibilityDtoSchema, toDisconnectEligibility };
export type {
  GuardianDisconnectEligibility,
  GuardianDisconnectEligibilityDto,
  GuardianDisconnectReservation,
  GuardianDisconnectTicket,
};
