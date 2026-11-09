import type { OwnerPassTemplate } from '@entities/owner-pass-template';
import type { PetTicketChargeRequest } from '@entities/owner-pet-ticket';

const MONTH_PRESETS = [1, 3, 6, 12] as const;
const CHARGE_COUNT_MIN = 1;
const CHARGE_COUNT_MAX = 1000;
const CHARGE_COUNT_ERROR = '충전 횟수는 1~1000회 사이로 입력해 주세요.';

type ChargeMonth = (typeof MONTH_PRESETS)[number];
type ChargeUnit = 'day' | 'month';
type ChargeDuration = { kind: 'none' } | { kind: 'month'; months: ChargeMonth } | { kind: 'custom'; amount: number; unit: ChargeUnit };

interface ChargePreset {
  id: string;
  name: string;
  count: number;
  duration: ChargeDuration;
}

function startOfChargeDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatChargeDotDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}.${month}.${day}`;
}

function formatChargeSelectLabel(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function isSameChargeDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

function addChargeMonths(date: Date, months: number) {
  const next = new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
  if (next.getDate() === date.getDate()) return next;
  return new Date(date.getFullYear(), date.getMonth() + months + 1, 0);
}

function chargeEndDate(start: Date, duration: ChargeDuration) {
  if (duration.kind === 'none') return null;
  if (duration.kind === 'custom' && duration.amount < 1) return null;

  const end =
    duration.kind === 'month'
      ? addChargeMonths(start, duration.months)
      : duration.unit === 'month'
        ? addChargeMonths(start, duration.amount)
        : new Date(start.getFullYear(), start.getMonth(), start.getDate() + duration.amount);

  end.setDate(end.getDate() - 1);
  return end;
}

function chargeCountError(value: string) {
  if (value === '') return null;
  if (!/^\d+$/.test(value)) return CHARGE_COUNT_ERROR;

  const count = Number(value);
  if (count < CHARGE_COUNT_MIN || count > CHARGE_COUNT_MAX) return CHARGE_COUNT_ERROR;

  return null;
}

function isChargeMonth(value: number): value is ChargeMonth {
  return MONTH_PRESETS.some((month) => month === value);
}

function canSelectChargePreset(preset: ChargePreset) {
  return preset.duration.kind !== 'custom' || preset.duration.amount > 0;
}

function toChargePreset(template: OwnerPassTemplate): ChargePreset {
  if (template.duration.type === 'NONE') {
    return { id: template.id, name: template.name, count: template.chargeCount, duration: { kind: 'none' } };
  }

  const { value, unit } = template.duration;
  const duration: ChargeDuration =
    unit === 'MONTH' && isChargeMonth(value)
      ? { kind: 'month', months: value }
      : { kind: 'custom', amount: value, unit: unit === 'DAY' ? 'day' : 'month' };

  return { id: template.id, name: template.name, count: template.chargeCount, duration };
}

function chargePresetDetail(preset: ChargePreset) {
  if (preset.duration.kind === 'none') return `${preset.count}회 • 만료 없음`;
  if (preset.duration.kind === 'month') return `${preset.count}회 • ${preset.duration.months}개월`;
  const unitLabel = preset.duration.unit === 'day' ? '일' : '개월';
  return `${preset.count}회 • ${preset.duration.amount}${unitLabel}`;
}

function formatChargeApiDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** 등록 이용권에서 고른 값도 충전 API는 이름·횟수·기간으로 받는다. */
function toChargeTicketRequest(
  start: Date,
  name: string,
  count: string,
  duration: ChargeDuration | null
): PetTicketChargeRequest | null {
  if (!canChargeTicket(name, count, duration)) return null;

  const request: PetTicketChargeRequest = {
    startDate: formatChargeApiDate(start),
    name: name.trim().replace(/\s+/g, ' '),
    chargeCount: Number(count),
  };

  if (duration == null || duration.kind === 'none') return request;
  if (duration.kind === 'month') return { ...request, validityValue: duration.months, validityUnit: 'MONTH' };
  if (duration.amount < 1) return null;

  return {
    ...request,
    validityValue: duration.amount,
    validityUnit: duration.unit === 'day' ? 'DAY' : 'MONTH',
  };
}

function canChargeTicket(name: string, count: string, duration: ChargeDuration | null) {
  const hasName = name.trim().length > 0;
  const hasCount = count !== '' && chargeCountError(count) === null;
  const hasCustomAmount = duration?.kind !== 'custom' || duration.amount >= 1;
  return hasName && hasCount && hasCustomAmount;
}

export type { ChargeDuration, ChargeMonth, ChargePreset, ChargeUnit };
export {
  CHARGE_COUNT_ERROR,
  MONTH_PRESETS,
  addChargeMonths,
  canChargeTicket,
  canSelectChargePreset,
  chargeCountError,
  chargeEndDate,
  chargePresetDetail,
  formatChargeDotDate,
  formatChargeSelectLabel,
  isSameChargeDay,
  startOfChargeDay,
  toChargePreset,
  toChargeTicketRequest,
};
