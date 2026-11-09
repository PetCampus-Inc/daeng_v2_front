import { z } from 'zod';

const PET_TICKET_STATUS = {
  SCHEDULED: 'scheduled',
  IN_USE: 'active',
  HOLDING: 'onHold',
  EXPIRED: 'expired',
} as const;

const NO_EXPIRY_LABEL = '만료 없음';

const petTicketStatusDtoSchema = z.enum(['SCHEDULED', 'IN_USE', 'HOLDING', 'EXPIRED']);
const holdPhaseDtoSchema = z.enum(['SCHEDULED', 'IN_PROGRESS']);
const holdButtonTypeDtoSchema = z.enum(['HOLD', 'CANCEL_HOLD', 'DISABLED']);

const idSchema = z.union([z.number().int(), z.string()]);

const toDateKey = (value: string | number[] | null | undefined) => {
  if (typeof value === 'string') {
    const datePart = value.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : null;
  }

  if (!Array.isArray(value) || value.length < 3) return null;

  const [year, month, day] = value;
  if (typeof year !== 'number' || typeof month !== 'number' || typeof day !== 'number') return null;

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

/** Jackson이 LocalDate를 문자열 또는 `[연, 월, 일]`로 준다. null은 빠질 수 있다. */
const apiDateSchema = z
  .union([z.string(), z.array(z.number())])
  .nullish()
  .transform(toDateKey);

const petTicketSummaryDtoSchema = z.object({
  ticketId: idSchema,
  name: z.string(),
  status: petTicketStatusDtoSchema,
  remainingCount: z.number().int(),
  chargeCount: z.number().int(),
  startDate: apiDateSchema,
  expiresOn: apiDateSchema,
  daysLeft: z.number().int().nullish(),
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
    ticketId: idSchema,
  }),
});

const petTicketHoldDtoSchema = z
  .object({
    holdId: idSchema,
    startDate: apiDateSchema,
    endDate: apiDateSchema,
    phase: holdPhaseDtoSchema,
  })
  .nullish();

const petTicketDetailDtoSchema = z.object({
  ticketId: idSchema,
  name: z.string(),
  status: petTicketStatusDtoSchema,
  remainingCount: z.number().int(),
  chargeCount: z.number().int(),
  startDate: apiDateSchema,
  chargedOn: apiDateSchema,
  expiresOn: apiDateSchema,
  daysLeft: z.number().int().nullish(),
  hold: petTicketHoldDtoSchema,
  holdButton: z
    .object({
      type: holdButtonTypeDtoSchema,
      disabledReason: z.enum(['NO_EXPIRY', 'NOT_STARTED', 'EXPIRED']).nullish(),
      availableFrom: apiDateSchema,
    })
    .nullish(),
});

const petTicketDetailResponseSchema = z.object({
  data: petTicketDetailDtoSchema,
});

const voidResponseSchema = z.object({
  status: z.number().int(),
  message: z.string(),
});

const petTicketHistoryItemDtoSchema = z.object({
  historyId: idSchema.nullish(),
  type: z.enum(['CHARGE', 'USE', 'HOLD', 'HOLD_RELEASE', 'EXTEND', 'EXPIRE']),
  occurredOn: apiDateSchema,
  countDelta: z.number().int().nullish(),
  daysDelta: z.number().int().nullish(),
  holdStartDate: apiDateSchema,
  holdEndDate: apiDateSchema,
  newExpiresOn: apiDateSchema,
  reservedForDate: apiDateSchema,
  remainingAfter: z.number().int().nullish(),
  canceledOn: apiDateSchema,
});

const petTicketHistoryResponseSchema = z.object({
  data: z.object({
    items: z.array(petTicketHistoryItemDtoSchema),
  }),
});

type PetTicketSummaryDto = z.infer<typeof petTicketSummaryDtoSchema>;
type PetTicketListDto = z.infer<typeof petTicketListDtoSchema>;
type PetTicketDetailDto = z.infer<typeof petTicketDetailDtoSchema>;
type PetTicketHistoryItemDto = z.infer<typeof petTicketHistoryItemDtoSchema>;
type PetTicketStatus = (typeof PET_TICKET_STATUS)[keyof typeof PET_TICKET_STATUS];
type PetTicketHoldAction = 'hold' | 'cancel' | 'disabled';

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

interface PetTicketHold {
  startsOn: string;
  endsOn: string;
  phase: 'SCHEDULED' | 'IN_PROGRESS';
}

interface PetTicketDetail {
  id: string;
  name: string;
  status: PetTicketStatus;
  remainingCount: number;
  totalCount: number;
  startsOn: string;
  endsOn: string | null;
  chargedOn: string;
  remainingDays: number | null;
  hold: PetTicketHold | null;
  holdAction: PetTicketHoldAction;
}

interface PetTicketHistoryLine {
  id: string;
  title: string;
  detail: string;
  isCancelled: boolean;
}

interface PetTicketExpiryRequest {
  expiresOn: string;
}

interface PetTicketChargeRequest {
  startDate: string;
  name: string;
  chargeCount: number;
  validityValue?: number;
  validityUnit?: 'DAY' | 'MONTH';
}

const parsePetTicketList = (response: unknown) => petTicketListResponseSchema.parse(response).data;

const parsePetTicketDetail = (response: unknown) => petTicketDetailResponseSchema.parse(response).data;

const parseChargedPetTicket = (response: unknown) => petTicketChargeResponseSchema.parse(response).data;

const parseVoidResponse = (response: unknown) => voidResponseSchema.parse(response);

const parsePetTicketHistory = (response: unknown) => petTicketHistoryResponseSchema.parse(response).data;

const formatDotDate = (value: string) => {
  const [year = '', month = '', day = ''] = value.split('-');
  return `${year}.${month}.${day}`;
};

const toDotDate = (value: string | null) => (value == null ? null : formatDotDate(value));

const toPetTicket = (dto: PetTicketSummaryDto): PetTicket => {
  const status = PET_TICKET_STATUS[dto.status];
  const endLabel = dto.expiresOn == null ? NO_EXPIRY_LABEL : formatDotDate(dto.expiresOn);
  const daysLeft = dto.daysLeft ?? null;

  return {
    id: String(dto.ticketId),
    name: dto.name,
    status,
    remainingCount: dto.remainingCount,
    totalCount: dto.chargeCount,
    period: `${formatDotDate(dto.startDate ?? '')} ~ ${endLabel}`,
    remainingDays: status === 'expired' || dto.expiresOn == null ? null : daysLeft,
  };
};

const toHoldAction = (type: 'HOLD' | 'CANCEL_HOLD' | 'DISABLED'): PetTicketHoldAction => {
  if (type === 'CANCEL_HOLD') return 'cancel';
  if (type === 'DISABLED') return 'disabled';
  return 'hold';
};

const toPetTicketDetail = (dto: PetTicketDetailDto): PetTicketDetail => {
  const status = PET_TICKET_STATUS[dto.status];
  const hold =
    dto.hold?.startDate && dto.hold.endDate
      ? {
          startsOn: formatDotDate(dto.hold.startDate),
          endsOn: formatDotDate(dto.hold.endDate),
          phase: dto.hold.phase,
        }
      : null;

  return {
    id: String(dto.ticketId),
    name: dto.name,
    status,
    remainingCount: dto.remainingCount,
    totalCount: dto.chargeCount,
    startsOn: formatDotDate(dto.startDate ?? ''),
    endsOn: toDotDate(dto.expiresOn),
    chargedOn: formatDotDate(dto.chargedOn ?? ''),
    remainingDays: status === 'expired' || dto.expiresOn == null ? null : (dto.daysLeft ?? null),
    hold,
    holdAction: dto.holdButton ? toHoldAction(dto.holdButton.type) : hold ? 'cancel' : 'hold',
  };
};

const toHistoryDate = (value: string | null | undefined) => (value ? formatDotDate(value) : '');

const toPetTicketHistoryLine = (dto: PetTicketHistoryItemDto, index: number): PetTicketHistoryLine => {
  const occurred = toHistoryDate(dto.occurredOn);
  const id = dto.historyId == null ? `${dto.type}-${occurred}-${index}` : String(dto.historyId);
  const isCancelled = dto.canceledOn != null;

  if (dto.type === 'USE') {
    const date = toHistoryDate(dto.reservedForDate ?? dto.occurredOn);
    return {
      id,
      title: `사용(${dto.remainingAfter ?? 0}회)`,
      detail: `${date} ${isCancelled ? '예약취소' : '예약'}`,
      isCancelled,
    };
  }

  if (dto.type === 'HOLD') {
    const start = toHistoryDate(dto.holdStartDate);
    const end = toHistoryDate(dto.holdEndDate);
    const period = start && end ? `${start} ~ ${end}` : start || end || occurred;
    return { id, title: '홀딩', detail: `기간 ${period}`, isCancelled: false };
  }

  if (dto.type === 'HOLD_RELEASE') return { id, title: '홀딩 해제', detail: `기간 ${occurred}`, isCancelled: false };

  if (dto.type === 'EXTEND') {
    return { id, title: '연장', detail: `만료일 ${toHistoryDate(dto.newExpiresOn) || occurred} 변경`, isCancelled: false };
  }

  if (dto.type === 'EXPIRE') return { id, title: '만료', detail: occurred, isCancelled: false };

  return { id, title: '충전', detail: occurred, isCancelled: false };
};

const toPetTicketHistory = (dto: { items: PetTicketHistoryItemDto[] }) => dto.items.map(toPetTicketHistoryLine);

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

export {
  parseChargedPetTicket,
  parsePetTicketDetail,
  parsePetTicketHistory,
  parsePetTicketList,
  parseVoidResponse,
  toPetTicketDetail,
  toPetTicketHistory,
  toPetTicketList,
};
export type {
  PetTicket,
  PetTicketChargeRequest,
  PetTicketDetail,
  PetTicketExpiryRequest,
  PetTicketHistoryLine,
  PetTicketList,
  PetTicketListDto,
};
