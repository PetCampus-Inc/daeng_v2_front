import { z } from 'zod';

const PET_TICKET_STATUS = {
  SCHEDULED: 'scheduled',
  IN_USE: 'active',
  HOLDING: 'onHold',
  EXPIRED: 'expired',
} as const;

const NO_EXPIRY_LABEL = '만료 없음';

const petTicketStatusDtoSchema = z.enum(['SCHEDULED', 'IN_USE', 'HOLDING', 'EXPIRED']);

const petTicketSummaryDtoSchema = z.object({
  ticketId: z.number().int(),
  name: z.string(),
  status: petTicketStatusDtoSchema,
  remainingCount: z.number().int(),
  chargeCount: z.number().int(),
  startDate: z.string(),
  expiresOn: z.string().nullable(),
  daysLeft: z.number().int().nullable(),
});

const petTicketListDtoSchema = z.object({
  counts: z.object({
    all: z.number().int(),
    inUse: z.number().int(),
    scheduled: z.number().int(),
    holding: z.number().int(),
    expired: z.number().int(),
  }),
  tickets: z.array(petTicketSummaryDtoSchema),
});

const petTicketListResponseSchema = z.object({
  data: petTicketListDtoSchema,
});

const petTicketChargeResponseSchema = z.object({
  data: z.object({
    ticketId: z.number().int(),
  }),
});

type PetTicketSummaryDto = z.infer<typeof petTicketSummaryDtoSchema>;
type PetTicketListDto = z.infer<typeof petTicketListDtoSchema>;
type PetTicketStatus = (typeof PET_TICKET_STATUS)[keyof typeof PET_TICKET_STATUS];

interface PetTicket {
  id: string;
  name: string;
  status: PetTicketStatus;
  remainingCount: number;
  totalCount: number;
  period: string;
  remainingDays: number | null;
}

interface PetTicketCounts {
  all: number;
  active: number;
  scheduled: number;
  onHold: number;
  expired: number;
}

interface PetTicketList {
  counts: PetTicketCounts;
  tickets: PetTicket[];
}

interface PetTicketChargeRequest {
  startDate: string;
  name: string;
  chargeCount: number;
  validityValue?: number;
  validityUnit?: 'DAY' | 'MONTH';
}

const parsePetTicketList = (response: unknown) => petTicketListResponseSchema.parse(response).data;

const parseChargedPetTicket = (response: unknown) => petTicketChargeResponseSchema.parse(response).data;

const formatDotDate = (value: string) => {
  const [year = '', month = '', day = ''] = value.split('-');
  return `${year}.${month}.${day}`;
};

const toPetTicket = (dto: PetTicketSummaryDto): PetTicket => {
  const status = PET_TICKET_STATUS[dto.status];
  const endLabel = dto.expiresOn == null ? NO_EXPIRY_LABEL : formatDotDate(dto.expiresOn);

  return {
    id: String(dto.ticketId),
    name: dto.name,
    status,
    remainingCount: dto.remainingCount,
    totalCount: dto.chargeCount,
    period: `${formatDotDate(dto.startDate)} ~ ${endLabel}`,
    remainingDays: status === 'expired' || dto.expiresOn == null ? null : dto.daysLeft,
  };
};

const toPetTicketList = (dto: PetTicketListDto): PetTicketList => ({
  counts: {
    all: dto.counts.all,
    active: dto.counts.inUse,
    scheduled: dto.counts.scheduled,
    onHold: dto.counts.holding,
    expired: dto.counts.expired,
  },
  tickets: dto.tickets.map(toPetTicket),
});

export { parseChargedPetTicket, parsePetTicketList, toPetTicketList };
export type { PetTicket, PetTicketChargeRequest, PetTicketList, PetTicketListDto };
