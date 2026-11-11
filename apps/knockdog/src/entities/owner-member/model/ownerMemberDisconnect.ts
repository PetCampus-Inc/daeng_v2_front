import { NO_END_DATE_LABEL, formatDotDate } from './ownerMemberTicket';

/** 서버가 해제를 막는 사유로 내려주는 종류 */
const DISCONNECT_BLOCK_TYPE = {
  ticket: 'TICKET',
  reservation: 'RESERVATION',
} as const;

/** 서버 날짜 직렬화 형식: `YYYY-MM-DD` 또는 `[year, month, day]` */
type DisconnectDateDto = string | number[];

interface OwnerMemberDisconnectTicketDto {
  name: string;
  remainingCount: number;
  /** 만료 없는 이용권이면 null */
  expiresOn: DisconnectDateDto | null;
}

interface OwnerMemberDisconnectReservationDto {
  date: DisconnectDateDto;
  /** `HH:mm` */
  time: string | null;
  status: string | null;
}

interface OwnerMemberDisconnectBlockDto {
  type: (typeof DISCONNECT_BLOCK_TYPE)[keyof typeof DISCONNECT_BLOCK_TYPE];
  ticket: OwnerMemberDisconnectTicketDto | null;
  reservation: OwnerMemberDisconnectReservationDto | null;
}

/** `GET owner/members/{memberId}/disconnect-eligibility` 응답 */
interface OwnerMemberDisconnectEligibilityDto {
  canDisconnect: boolean;
  blocks: OwnerMemberDisconnectBlockDto[];
}

interface OwnerMemberDisconnectTicketBlock {
  type: 'ticket';
  name: string;
  remainingCount: number;
  /** `YYYY.MM.DD까지` 또는 `만료 없음` */
  expiryLabel: string;
}

interface OwnerMemberDisconnectReservationBlock {
  type: 'reservation';
  /** `YYYY.MM.DD` */
  dateLabel: string;
  /** `오전·오후 h:mm` */
  timeLabel: string;
}

type OwnerMemberDisconnectBlock =
  | OwnerMemberDisconnectTicketBlock
  | OwnerMemberDisconnectReservationBlock;

/** 안내 시트 본문 종류. 이용권이 하나라도 있으면 `ticket`, 예약만 있으면 `reservation` */
type OwnerMemberDisconnectBodyKind = 'ticket' | 'reservation';

interface OwnerMemberDisconnectEligibility {
  canDisconnect: boolean;
  /** 서버 순서 그대로(예약 먼저, 이용권 뒤) */
  blocks: OwnerMemberDisconnectBlock[];
  /** 해제할 수 있으면 null */
  bodyKind: OwnerMemberDisconnectBodyKind | null;
}

const toDisconnectDateLabel = (value: DisconnectDateDto): string => {
  if (typeof value === 'string') return formatDotDate(value);

  const [year, month, day] = value;
  return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`;
};

/**
 * `HH:mm`을 `오전·오후 h:mm`으로 바꾼다.
 * 00시대는 오전 12시대, 12시대는 오후 12시대, 13시 이후는 12를 뺀 오후.
 */
const toTwelveHourTimeLabel = (time: string): string => {
  const [hourText = '0', minuteText = '00'] = time.split(':');
  const hour = Number(hourText);
  const meridiem = hour < 12 ? '오전' : '오후';
  const twelveHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${meridiem} ${twelveHour}:${minuteText.padStart(2, '0')}`;
};

const toDisconnectBlock = (
  blockDto: OwnerMemberDisconnectBlockDto
): OwnerMemberDisconnectBlock | null => {
  if (blockDto.type === DISCONNECT_BLOCK_TYPE.ticket && blockDto.ticket) {
    const { name, remainingCount, expiresOn } = blockDto.ticket;

    return {
      type: 'ticket',
      name,
      remainingCount,
      expiryLabel: expiresOn == null ? NO_END_DATE_LABEL : `${toDisconnectDateLabel(expiresOn)}까지`,
    };
  }

  if (blockDto.type === DISCONNECT_BLOCK_TYPE.reservation && blockDto.reservation) {
    const { date, time } = blockDto.reservation;

    return {
      type: 'reservation',
      dateLabel: toDisconnectDateLabel(date),
      // 서버 예약 시간 칸은 비어 있을 수 없다(NOT NULL). 타입이 nullable이라 빈 값만 방어한다.
      timeLabel: time == null ? '' : toTwelveHourTimeLabel(time),
    };
  }

  return null;
};

const toDisconnectEligibility = (
  dto: OwnerMemberDisconnectEligibilityDto
): OwnerMemberDisconnectEligibility => {
  const blocks = dto.blocks.flatMap((blockDto) => toDisconnectBlock(blockDto) ?? []);
  const hasTicket = blocks.some((block) => block.type === 'ticket');
  const hasReservation = blocks.some((block) => block.type === 'reservation');

  return {
    canDisconnect: dto.canDisconnect,
    blocks,
    bodyKind: hasTicket ? 'ticket' : hasReservation ? 'reservation' : null,
  };
};

export { DISCONNECT_BLOCK_TYPE, toDisconnectEligibility };
export type {
  OwnerMemberDisconnectBlock,
  OwnerMemberDisconnectBlockDto,
  OwnerMemberDisconnectBodyKind,
  OwnerMemberDisconnectEligibility,
  OwnerMemberDisconnectEligibilityDto,
};
