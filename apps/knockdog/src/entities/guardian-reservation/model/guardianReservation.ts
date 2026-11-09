import { z } from 'zod';

const RESERVATION_STATUS = {
  CONFIRMED: 'confirmed',
  ATTENDED: 'attended',
  ABSENT: 'absent',
} as const;

type GuardianReservationStatus = (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS];

interface GuardianReservation {
  id: string;
  petId: string;
  startsAt: string;
  schoolName: string;
  status: GuardianReservationStatus;
}

const idSchema = z.union([z.number().int(), z.string()]);

const toDateKey = (value: string | number[], ctx: z.RefinementCtx) => {
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

const reservationDtoSchema = z.object({
  reservationId: idSchema,
  petId: idSchema,
  schoolId: idSchema,
  schoolName: z.string(),
  date: z.union([z.string(), z.array(z.number())]).transform(toDateKey),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  status: z.enum(['CONFIRMED', 'ATTENDED', 'ABSENT', 'CANCELED']),
  ticketId: idSchema,
  ticketName: z.string(),
  ticketRemainingCount: z.number().int(),
  requestMemo: z.string().nullish(),
  cancelableUntil: z.union([z.string(), z.array(z.number()), z.null()]).optional(),
  canceledAt: z.union([z.string(), z.array(z.number()), z.null()]).optional(),
});

const reservationListResponseSchema = z.object({
  data: z.object({
    reservations: z.array(reservationDtoSchema),
  }),
});

type ReservationDto = z.infer<typeof reservationDtoSchema>;

const parseGuardianReservationList = (response: unknown) => reservationListResponseSchema.parse(response).data;

const toGuardianReservation = (dto: ReservationDto): GuardianReservation | null => {
  if (dto.status === 'CANCELED') return null;

  return {
    id: String(dto.reservationId),
    petId: String(dto.petId),
    startsAt: `${dto.date}T${dto.time}`,
    schoolName: dto.schoolName,
    status: RESERVATION_STATUS[dto.status],
  };
};

const toGuardianReservations = (dto: { reservations: ReservationDto[] }) =>
  dto.reservations.flatMap((item) => {
    const reservation = toGuardianReservation(item);
    return reservation ? [reservation] : [];
  });

export { parseGuardianReservationList, toGuardianReservations };
export type { GuardianReservation, GuardianReservationStatus };
