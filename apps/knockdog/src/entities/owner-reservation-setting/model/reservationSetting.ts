import { z } from 'zod';

const clockSchema = z.string().nullable();

const reservationOperatingDtoSchema = z.object({
  weekdayOpenTime: clockSchema,
  weekdayCloseTime: clockSchema,
  weekendOpenTime: clockSchema,
  weekendCloseTime: clockSchema,
  closedDays: z.array(z.string()),
});

const reservationSettingDtoSchema = z.object({
  weekdayStartTime: clockSchema,
  weekdayEndTime: clockSchema,
  weekendStartTime: clockSchema,
  weekendEndTime: clockSchema,
  dailyCapacity: z.number().int().nullable(),
  operatingInfo: reservationOperatingDtoSchema,
});

type ReservationSettingDto = z.infer<typeof reservationSettingDtoSchema>;

interface ReservationSetting {
  weekdayStart: string | null;
  weekdayEnd: string | null;
  weekendStart: string | null;
  weekendEnd: string | null;
  dailyCapacity: string;
  hoursLine: string | null;
  closedLine: string | null;
}

const CLOSED_DAY_RANK = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
  'WEEKEND',
  'HOLIDAY',
] as const;

type ClosedDayRank = (typeof CLOSED_DAY_RANK)[number];

const CLOSED_DAY_LABEL: Record<ClosedDayRank, string> = {
  MONDAY: '월요일',
  TUESDAY: '화요일',
  WEDNESDAY: '수요일',
  THURSDAY: '목요일',
  FRIDAY: '금요일',
  SATURDAY: '토요일',
  SUNDAY: '일요일',
  WEEKEND: '주말',
  HOLIDAY: '공휴일',
};

const CLOSED_DAY_KEY: Record<string, ClosedDayRank> = {
  MONDAY: 'MONDAY',
  TUESDAY: 'TUESDAY',
  WEDNESDAY: 'WEDNESDAY',
  THURSDAY: 'THURSDAY',
  FRIDAY: 'FRIDAY',
  SATURDAY: 'SATURDAY',
  SUNDAY: 'SUNDAY',
  WEEKEND: 'WEEKEND',
  HOLIDAY: 'HOLIDAY',
  월: 'MONDAY',
  화: 'TUESDAY',
  수: 'WEDNESDAY',
  목: 'THURSDAY',
  금: 'FRIDAY',
  토: 'SATURDAY',
  일: 'SUNDAY',
  월요일: 'MONDAY',
  화요일: 'TUESDAY',
  수요일: 'WEDNESDAY',
  목요일: 'THURSDAY',
  금요일: 'FRIDAY',
  토요일: 'SATURDAY',
  일요일: 'SUNDAY',
  주말: 'WEEKEND',
  공휴일: 'HOLIDAY',
};

const normalizeClock = (value: string | null) => {
  if (!value) return null;

  const match = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  const hour = match?.[1];
  const minute = match?.[2];
  if (!hour || !minute) return null;

  return `${hour.padStart(2, '0')}:${minute}`;
};

const formatHoursLine = (operatingInfo: ReservationSettingDto['operatingInfo']) => {
  const weekdayStart = normalizeClock(operatingInfo.weekdayOpenTime);
  const weekdayEnd = normalizeClock(operatingInfo.weekdayCloseTime);
  const weekendStart = normalizeClock(operatingInfo.weekendOpenTime);
  const weekendEnd = normalizeClock(operatingInfo.weekendCloseTime);
  const weekday = weekdayStart && weekdayEnd ? `평일 ${weekdayStart}~${weekdayEnd}` : null;
  const weekend = weekendStart && weekendEnd ? `주말 ${weekendStart}~${weekendEnd}` : null;

  return [weekday, weekend].filter(Boolean).join(', ') || null;
};

const formatClosedLine = (closedDays: string[]) => {
  const ranks = new Set<ClosedDayRank>();
  for (const day of closedDays) {
    const rank = CLOSED_DAY_KEY[day];
    if (rank) ranks.add(rank);
  }

  const labels = CLOSED_DAY_RANK.filter((rank) => ranks.has(rank)).map((rank) => CLOSED_DAY_LABEL[rank]);
  return labels.length > 0 ? `${labels.join(', ')} 휴무` : null;
};

const settingResponseSchema = z.object({
  data: reservationSettingDtoSchema,
});

interface ReservationSettingDraft {
  weekdayStart: string | null;
  weekdayEnd: string | null;
  weekendStart: string | null;
  weekendEnd: string | null;
  dailyCapacity: string;
}

interface ReservationSettingRequest {
  weekdayStartTime: string;
  weekdayEndTime: string;
  weekendStartTime: string;
  weekendEndTime: string;
  dailyCapacity?: number;
}

const parseReservationSetting = (response: unknown) => settingResponseSchema.parse(response).data;

const toReservationSettingRequest = (draft: ReservationSettingDraft): ReservationSettingRequest | null => {
  const { weekdayStart, weekdayEnd, weekendStart, weekendEnd, dailyCapacity } = draft;
  if (!weekdayStart || !weekdayEnd || !weekendStart || !weekendEnd) return null;

  const request: ReservationSettingRequest = {
    weekdayStartTime: weekdayStart,
    weekdayEndTime: weekdayEnd,
    weekendStartTime: weekendStart,
    weekendEndTime: weekendEnd,
  };

  if (dailyCapacity === '') return request;

  const capacity = Number(dailyCapacity);
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 9999) return null;

  return { ...request, dailyCapacity: capacity };
};

const toReservationSetting = (dto: ReservationSettingDto): ReservationSetting => ({
  weekdayStart: normalizeClock(dto.weekdayStartTime),
  weekdayEnd: normalizeClock(dto.weekdayEndTime),
  weekendStart: normalizeClock(dto.weekendStartTime),
  weekendEnd: normalizeClock(dto.weekendEndTime),
  dailyCapacity: dto.dailyCapacity == null ? '' : String(dto.dailyCapacity),
  hoursLine: formatHoursLine(dto.operatingInfo),
  closedLine: formatClosedLine(dto.operatingInfo.closedDays),
});

export {
  parseReservationSetting,
  reservationSettingDtoSchema,
  toReservationSetting,
  toReservationSettingRequest,
};
export type { ReservationSetting, ReservationSettingDraft, ReservationSettingDto, ReservationSettingRequest };
