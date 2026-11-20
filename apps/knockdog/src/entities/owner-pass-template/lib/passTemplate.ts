import type {
  OwnerPassTemplate,
  OwnerPassTemplateInput,
  PassTemplateDuration,
  PassTemplateDurationUnit,
  PassTemplateRequestDto,
} from '../model/types';

const PASS_TEMPLATE_NAME_MAX_LENGTH = 50;
const PASS_TEMPLATE_CHARGE_COUNT_MIN = 1;
const PASS_TEMPLATE_CHARGE_COUNT_MAX = 1000;
const PASS_TEMPLATE_DURATION_MIN = 1;
const PASS_TEMPLATE_DURATION_MAX = 99;

function normalizePassTemplateName(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function parsePassTemplateChargeCount(value: string) {
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < PASS_TEMPLATE_CHARGE_COUNT_MIN || parsed > PASS_TEMPLATE_CHARGE_COUNT_MAX) {
    return null;
  }
  return parsed;
}

/** 이름이 공백 정리 후 1~50자인지 확인한다. */
function isValidPassTemplateName(value: string) {
  const normalizedName = normalizePassTemplateName(value);
  return normalizedName.length > 0 && normalizedName.length <= PASS_TEMPLATE_NAME_MAX_LENGTH;
}

/** 직접 입력한 유효기간 숫자를 1~99 정수로 읽는다. 아니면 null. */
function parsePassTemplateValidity(value: string) {
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  if (parsed < PASS_TEMPLATE_DURATION_MIN || parsed > PASS_TEMPLATE_DURATION_MAX) return null;
  return parsed;
}

function isValidPassTemplateDuration(duration: PassTemplateDuration) {
  if (duration.type === 'NONE') return true;
  return (
    Number.isInteger(duration.value) &&
    duration.value >= PASS_TEMPLATE_DURATION_MIN &&
    duration.value <= PASS_TEMPLATE_DURATION_MAX
  );
}

function isValidPassTemplateInput(input: OwnerPassTemplateInput) {
  return (
    isValidPassTemplateName(input.name) &&
    input.chargeCount >= PASS_TEMPLATE_CHARGE_COUNT_MIN &&
    input.chargeCount <= PASS_TEMPLATE_CHARGE_COUNT_MAX &&
    isValidPassTemplateDuration(input.duration)
  );
}

function formatPassTemplateDuration(duration: PassTemplateDuration) {
  if (duration.type === 'NONE') return '만료 없음';
  return `${duration.value}${duration.unit === 'DAY' ? '일' : '개월'}`;
}

/** 목록 카드의 보조 정보를 `{n}회 · {기간}`으로 만든다. */
function formatPassTemplateSummary(template: Pick<OwnerPassTemplate, 'chargeCount' | 'duration'>) {
  return `${template.chargeCount}회 · ${formatPassTemplateDuration(template.duration)}`;
}

/** 등록·수정 요청 본문을 만든다. 만료 없음이면 유효기간 값과 단위를 모두 null로 보낸다. */
function toPassTemplateRequestDto(input: OwnerPassTemplateInput): PassTemplateRequestDto {
  const { duration } = input;
  return {
    name: normalizePassTemplateName(input.name),
    chargeCount: input.chargeCount,
    validityValue: duration.type === 'NONE' ? null : duration.value,
    validityUnit: duration.type === 'NONE' ? null : duration.unit,
  };
}

type PassTemplateDurationOption = 'NONE' | '1_MONTH' | '3_MONTH' | '6_MONTH' | '12_MONTH' | 'CUSTOM';

interface PassTemplateDurationSelection {
  option: PassTemplateDurationOption;
  customValue: string;
  customUnit: PassTemplateDurationUnit;
}

const DURATION_CHIP_MONTHS = [1, 3, 6, 12] as const;

/** 저장된 유효기간을 칩 선택 상태로 바꾼다. 칩 값과 다르면 직접 입력으로 본다. */
function getPassTemplateSelection(duration: PassTemplateDuration): PassTemplateDurationSelection {
  if (duration.type === 'NONE') return { option: 'NONE', customValue: '', customUnit: 'DAY' };

  const chipMonth = DURATION_CHIP_MONTHS.find((month) => duration.unit === 'MONTH' && duration.value === month);
  if (chipMonth) return { option: `${chipMonth}_MONTH`, customValue: '', customUnit: 'DAY' };

  return { option: 'CUSTOM', customValue: String(duration.value), customUnit: duration.unit };
}

/** URL의 템플릿 ID와 같은 항목을 목록에서 찾는다. 정수가 아닌 ID는 찾지 못한 것으로 본다. */
function findPassTemplateById<T extends Pick<OwnerPassTemplate, 'id'>>(templates: readonly T[], id: string | undefined) {
  if (!id || !/^\d+$/.test(id)) return null;
  return templates.find((template) => template.id === id) ?? null;
}

export type { PassTemplateDurationOption, PassTemplateDurationSelection };
export {
  PASS_TEMPLATE_CHARGE_COUNT_MAX,
  PASS_TEMPLATE_CHARGE_COUNT_MIN,
  PASS_TEMPLATE_DURATION_MAX,
  PASS_TEMPLATE_DURATION_MIN,
  PASS_TEMPLATE_NAME_MAX_LENGTH,
  findPassTemplateById,
  formatPassTemplateDuration,
  formatPassTemplateSummary,
  getPassTemplateSelection,
  isValidPassTemplateDuration,
  isValidPassTemplateName,
  isValidPassTemplateInput,
  normalizePassTemplateName,
  parsePassTemplateChargeCount,
  parsePassTemplateValidity,
  toPassTemplateRequestDto,
};
