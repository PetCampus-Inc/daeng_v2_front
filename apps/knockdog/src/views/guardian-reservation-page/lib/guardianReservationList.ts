const WEEKDAY_SHORT = ['일', '월', '화', '수', '목', '금', '토'] as const;

const LIST_TAB = {
  upcoming: 'upcoming',
  past: 'past',
} as const;

const LIST_STATUS = {
  confirmed: 'confirmed',
  attended: 'attended',
  absent: 'absent',
} as const;

const PAST_RANGE = {
  one: 1,
  three: 3,
  six: 6,
} as const;

type ListTab = (typeof LIST_TAB)[keyof typeof LIST_TAB];
type ListStatus = (typeof LIST_STATUS)[keyof typeof LIST_STATUS];
type PastRange = keyof typeof PAST_RANGE;

interface ReservationSource {
  id: string;
  dogId: string;
  startsAt: string;
  status: ListStatus;
  isCancelled: boolean;
}

interface ReservationGroup {
  heading: string;
  items: ReservationSource[];
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function toVisitKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function shiftDays(today: Date, days: number, hour: number, minute: number) {
  return toVisitKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() + days, hour, minute));
}

function parseVisitKey(value: string) {
  const [datePart = '', timePart = '00:00'] = value.split('T');
  const [year = '0', month = '1', day = '1'] = datePart.split('-');
  const [hour = '0', minute = '0'] = timePart.split(':');
  return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
}

function formatListWhen(startsAt: string) {
  const date = parseVisitKey(startsAt);
  const hour = date.getHours();
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  const minute = pad(date.getMinutes());
  const weekday = WEEKDAY_SHORT[date.getDay()] ?? '';
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${weekday}) ${hour < 12 ? '오전' : '오후'} ${hour12}:${minute}`;
}

function formatMonthHeading(startsAt: string) {
  const date = parseVisitKey(startsAt);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

function visibleReservations(items: readonly ReservationSource[]) {
  const byDay = new Map<string, ReservationSource>();

  for (const item of items) {
    if (item.isCancelled) continue;
    const day = item.startsAt.slice(0, 10);
    const current = byDay.get(day);
    if (!current || item.id.startsWith('book-')) byDay.set(day, item);
  }

  return [...byDay.values()];
}

function listUpcoming(items: readonly ReservationSource[], nowKey: string) {
  return items
    .filter((item) => item.startsAt >= nowKey)
    .sort((left, right) => left.startsAt.localeCompare(right.startsAt));
}

function groupUpcoming(items: readonly ReservationSource[]) {
  const groups: ReservationGroup[] = [];

  for (const item of items) {
    const heading = formatMonthHeading(item.startsAt);
    const current = groups[groups.length - 1];
    if (current?.heading === heading) {
      current.items.push(item);
      continue;
    }
    groups.push({ heading, items: [item] });
  }

  return groups;
}

function listPast(items: readonly ReservationSource[], now: Date, nowKey: string, range: PastRange) {
  const cutoff = new Date(now.getFullYear(), now.getMonth() - PAST_RANGE[range], now.getDate());
  const cutoffKey = toVisitKey(cutoff);

  return items
    .filter((item) => item.startsAt < nowKey && item.startsAt >= cutoffKey)
    .sort((left, right) => right.startsAt.localeCompare(left.startsAt));
}

function pastListStatus(item: ReservationSource) {
  if (item.status === LIST_STATUS.attended) return LIST_STATUS.attended;
  return LIST_STATUS.absent;
}

function createListSeeds(dogId: string, today: Date): ReservationSource[] {
  return [
    {
      id: `${dogId}-soon`,
      dogId,
      startsAt: shiftDays(today, 6, 9, 0),
      status: LIST_STATUS.confirmed,
      isCancelled: false,
    },
    {
      id: `${dogId}-later`,
      dogId,
      startsAt: shiftDays(today, 35, 9, 0),
      status: LIST_STATUS.confirmed,
      isCancelled: false,
    },
    {
      id: `${dogId}-cancelled`,
      dogId,
      startsAt: shiftDays(today, 8, 10, 0),
      status: LIST_STATUS.confirmed,
      isCancelled: true,
    },
    {
      id: `${dogId}-past-near`,
      dogId,
      startsAt: shiftDays(today, -4, 9, 0),
      status: LIST_STATUS.attended,
      isCancelled: false,
    },
    {
      id: `${dogId}-past-week`,
      dogId,
      startsAt: shiftDays(today, -9, 9, 0),
      status: LIST_STATUS.attended,
      isCancelled: false,
    },
    {
      id: `${dogId}-past-absent`,
      dogId,
      startsAt: shiftDays(today, -15, 9, 0),
      status: LIST_STATUS.absent,
      isCancelled: false,
    },
    {
      id: `${dogId}-past-older`,
      dogId,
      startsAt: shiftDays(today, -40, 9, 0),
      status: LIST_STATUS.attended,
      isCancelled: false,
    },
    {
      id: `${dogId}-past-old`,
      dogId,
      startsAt: shiftDays(today, -120, 9, 0),
      status: LIST_STATUS.attended,
      isCancelled: false,
    },
  ];
}

export {
  LIST_STATUS,
  LIST_TAB,
  PAST_RANGE,
  createListSeeds,
  formatListWhen,
  formatMonthHeading,
  groupUpcoming,
  listPast,
  listUpcoming,
  pastListStatus,
  toVisitKey,
  visibleReservations,
};
export type { ListStatus, ListTab, PastRange, ReservationGroup, ReservationSource };
