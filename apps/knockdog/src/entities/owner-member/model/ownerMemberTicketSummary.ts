const TICKET_NAME_MAX_LENGTH = 10;

interface OwnerMemberTicketSummarySource {
  name: string;
  remainingCount: number;
  /** 남은 일수. 만료일이 없는 이용권이면 null */
  daysLeft: number | null;
}

/** 이용권명이 길면 앞 10자만 남기고 `...`을 붙인다 */
function truncateTicketName(name: string) {
  const characters = Array.from(name);

  return characters.length > TICKET_NAME_MAX_LENGTH
    ? `${characters.slice(0, TICKET_NAME_MAX_LENGTH).join('')}...`
    : name;
}

/**
 * 등록 원생 한 줄의 이용권 정보 문구를 만든다. (예: `20회권 | 1회·90일 남음`)
 * 보여줄 이용권이 없으면 null을 돌려준다.
 */
function toOwnerMemberTicketSummary(ticket: OwnerMemberTicketSummarySource | null): string | null {
  if (!ticket) return null;

  const remaining =
    ticket.daysLeft == null
      ? `${ticket.remainingCount}회 남음`
      : `${ticket.remainingCount}회·${ticket.daysLeft}일 남음`;

  return `${truncateTicketName(ticket.name)} | ${remaining}`;
}

export { toOwnerMemberTicketSummary };
export type { OwnerMemberTicketSummarySource };
