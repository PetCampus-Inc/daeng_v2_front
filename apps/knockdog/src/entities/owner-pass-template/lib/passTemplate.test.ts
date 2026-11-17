import { describe, expect, test } from 'vitest';

import {
  findPassTemplateById,
  formatPassTemplateDuration,
  formatPassTemplateSummary,
  getPassTemplateSelection,
  isValidPassTemplateName,
  normalizePassTemplateName,
  parsePassTemplateChargeCount,
  parsePassTemplateValidity,
  toPassTemplateRequestDto,
} from './passTemplate';

describe('목록 보조 정보 표시', () => {
  test('유효기간이 없으면 `만료 없음`, 일 단위면 `n일`, 개월 단위면 `n개월`로 바꾼다', () => {
    expect(formatPassTemplateDuration({ type: 'NONE' })).toBe('만료 없음');
    expect(formatPassTemplateDuration({ type: 'FIXED', value: 80, unit: 'DAY' })).toBe('80일');
    expect(formatPassTemplateDuration({ type: 'FIXED', value: 3, unit: 'MONTH' })).toBe('3개월');
  });

  test('만료 없음 템플릿은 보조 정보를 `{n}회 · 만료 없음`으로 만든다', () => {
    expect(formatPassTemplateSummary({ chargeCount: 1, duration: { type: 'NONE' } })).toBe('1회 · 만료 없음');
  });

  test('서버 응답에 기간이 있으면 보조 정보를 `{n}회 · {기간}`으로 만든다', () => {
    expect(formatPassTemplateSummary({ chargeCount: 10, duration: { type: 'FIXED', value: 1, unit: 'MONTH' } })).toBe(
      '10회 · 1개월'
    );
    expect(formatPassTemplateSummary({ chargeCount: 5, duration: { type: 'FIXED', value: 80, unit: 'DAY' } })).toBe(
      '5회 · 80일'
    );
  });
});

describe('이름 입력', () => {
  test('이름의 앞뒤 공백을 지우고 연속 공백을 하나로 합친다', () => {
    expect(normalizePassTemplateName('  체험   등원  ')).toBe('체험 등원');
  });

  test('공백만 있는 이름은 유효하지 않다', () => {
    expect(isValidPassTemplateName('   ')).toBe(false);
    expect(isValidPassTemplateName('')).toBe(false);
    expect(isValidPassTemplateName(' 정기권 ')).toBe(true);
  });
});

describe('충전 횟수 입력', () => {
  test('충전 횟수는 1~1000 정수만 허용하고 0, 1001, 소수는 거부한다', () => {
    expect(parsePassTemplateChargeCount('1')).toBe(1);
    expect(parsePassTemplateChargeCount('1000')).toBe(1000);
    expect(parsePassTemplateChargeCount('0')).toBeNull();
    expect(parsePassTemplateChargeCount('1001')).toBeNull();
    expect(parsePassTemplateChargeCount('1.5')).toBeNull();
  });

  test('충전 횟수에 `1e3`, `0x10`, 공백이 섞인 값, 빈 값이 들어오면 거부한다', () => {
    expect(parsePassTemplateChargeCount('1e3')).toBeNull();
    expect(parsePassTemplateChargeCount('0x10')).toBeNull();
    expect(parsePassTemplateChargeCount(' 5')).toBeNull();
    expect(parsePassTemplateChargeCount('5 ')).toBeNull();
    expect(parsePassTemplateChargeCount('1 0')).toBeNull();
    expect(parsePassTemplateChargeCount('')).toBeNull();
  });
});

describe('유효기간 선택', () => {
  test('직접 입력 값은 1~99 정수일 때만 유효하고 0, 100은 유효하지 않다', () => {
    expect(parsePassTemplateValidity('1')).toBe(1);
    expect(parsePassTemplateValidity('99')).toBe(99);
    expect(parsePassTemplateValidity('0')).toBeNull();
    expect(parsePassTemplateValidity('100')).toBeNull();
    expect(parsePassTemplateValidity('1e1')).toBeNull();
    expect(parsePassTemplateValidity('')).toBeNull();
  });

  test('만료 없음을 고르면 유효기간 없이 등록 요청을 보낸다', () => {
    expect(toPassTemplateRequestDto({ name: '체험 등원', chargeCount: 1, duration: { type: 'NONE' } })).toEqual({
      name: '체험 등원',
      chargeCount: 1,
      validityValue: null,
      validityUnit: null,
    });
  });

  test('기간 칩(1·3·6·12개월)과 직접 입력 값을 숫자와 단위(일·개월)로 보낸다', () => {
    expect(
      toPassTemplateRequestDto({ name: 'a', chargeCount: 1, duration: { type: 'FIXED', value: 3, unit: 'MONTH' } })
    ).toMatchObject({ validityValue: 3, validityUnit: 'MONTH' });
    expect(
      toPassTemplateRequestDto({ name: 'a', chargeCount: 1, duration: { type: 'FIXED', value: 80, unit: 'DAY' } })
    ).toMatchObject({ validityValue: 80, validityUnit: 'DAY' });
  });
});

describe('수정', () => {
  test('저장된 유효기간이 칩 값(만료 없음·1·3·6·12개월)과 같으면 그 칩을, 아니면(예: 80일, 30일) 직접 입력을 선택한 상태로 바꾼다', () => {
    expect(getPassTemplateSelection({ type: 'NONE' }).option).toBe('NONE');
    expect(getPassTemplateSelection({ type: 'FIXED', value: 6, unit: 'MONTH' }).option).toBe('6_MONTH');
    expect(getPassTemplateSelection({ type: 'FIXED', value: 80, unit: 'DAY' })).toEqual({
      option: 'CUSTOM',
      customValue: '80',
      customUnit: 'DAY',
    });
    expect(getPassTemplateSelection({ type: 'FIXED', value: 30, unit: 'DAY' }).option).toBe('CUSTOM');
    expect(getPassTemplateSelection({ type: 'FIXED', value: 2, unit: 'MONTH' }).option).toBe('CUSTOM');
  });

  test('URL의 템플릿 ID가 목록에 없거나 정수가 아니면(`abc`, `1e3`, `0x10`, 공백) 찾지 못한 것으로 판단한다', () => {
    const templates = [
      { id: '1', name: 'a', chargeCount: 1, duration: { type: 'NONE' } },
      { id: '1000', name: 'b', chargeCount: 1, duration: { type: 'NONE' } },
      { id: '16', name: 'c', chargeCount: 1, duration: { type: 'NONE' } },
    ] as const;

    expect(findPassTemplateById(templates, '1')?.name).toBe('a');
    expect(findPassTemplateById(templates, '999')).toBeNull();
    expect(findPassTemplateById(templates, 'abc')).toBeNull();
    expect(findPassTemplateById(templates, '1e3')).toBeNull();
    expect(findPassTemplateById(templates, '0x10')).toBeNull();
    expect(findPassTemplateById(templates, ' 1')).toBeNull();
    expect(findPassTemplateById(templates, undefined)).toBeNull();
  });
});
