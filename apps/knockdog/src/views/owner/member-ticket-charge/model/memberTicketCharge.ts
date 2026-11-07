const MONTH_PRESETS = [1, 3, 6, 12] as const;
const CHARGE_COUNT_MIN = 1;
const CHARGE_COUNT_MAX = 1000;
const CHARGE_COUNT_ERROR = '충전 횟수는 1~1000회 사이로 입력해 주세요.';

type ChargeMonth = (typeof MONTH_PRESETS)[number];
type ChargeUnit = 'day' | 'month';
type ChargeDuration = { kind: 'none' } | { kind: 'month'; months: ChargeMonth } | { kind: 'custom'; amount: number; unit: ChargeUnit };

function startOfChargeDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatChargeDotDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}.${month}.${day}`;
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

function canChargeTicket(name: string, count: string, duration: ChargeDuration | null) {
  const hasName = name.trim().length > 0;
  const hasCount = count !== '' && chargeCountError(count) === null;
  const hasCustomAmount = duration?.kind !== 'custom' || duration.amount >= 1;
  return hasName && hasCount && hasCustomAmount;
}

export type { ChargeDuration, ChargeMonth, ChargeUnit };
export {
  CHARGE_COUNT_ERROR,
  MONTH_PRESETS,
  addChargeMonths,
  canChargeTicket,
  chargeCountError,
  chargeEndDate,
  formatChargeDotDate,
  startOfChargeDay,
};
