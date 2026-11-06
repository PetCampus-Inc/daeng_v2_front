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

const CLOSED_DAY_ORDER = ['월', '화', '수', '목', '금', '토', '일'] as const;

const CLOSED_DAY_LABEL: Record<string, string> = {
  월: '월요일',
  화: '화요일',
  수: '수요일',
  목: '목요일',
  금: '금요일',
  토: '토요일',
  일: '일요일',
  월요일: '월요일',
  화요일: '화요일',
  수요일: '수요일',
  목요일: '목요일',
  금요일: '금요일',
  토요일: '토요일',
  일요일: '일요일',
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
  const labels = [...closedDays]
    .map((day) => ({ day, label: CLOSED_DAY_LABEL[day] }))
    .filter((day): day is { day: string; label: string } => Boolean(day.label))
    .sort((left, right) => {
      const leftRank = CLOSED_DAY_ORDER.indexOf(left.day[0] as (typeof CLOSED_DAY_ORDER)[number]);
      const rightRank = CLOSED_DAY_ORDER.indexOf(right.day[0] as (typeof CLOSED_DAY_ORDER)[number]);
      return leftRank - rightRank;
    })
    .map((day) => day.label);

  return labels.length > 0 ? `${labels.join(', ')} 휴무` : null;
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

export { reservationSettingDtoSchema, toReservationSetting };
export type { ReservationSetting, ReservationSettingDto };
