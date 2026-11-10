import { z } from 'zod';

const disconnectBlockDtoSchema = z.object({
  type: z.enum(['ATTENDANCE', 'RESERVATION', 'TICKET']),
  ticket: z
    .object({
      name: z.string(),
      remainingCount: z.number(),
      expiresOn: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  reservation: z
    .object({
      date: z.string(),
      time: z.string().nullable().optional(),
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
