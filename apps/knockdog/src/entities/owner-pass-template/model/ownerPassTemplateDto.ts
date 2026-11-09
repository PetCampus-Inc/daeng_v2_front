import { z } from 'zod';

import type { OwnerPassTemplate } from './types';

/** 이름 중복 오류 코드 (`POST`·`PUT` 409) */
const PASS_TEMPLATE_DUPLICATE_CODE = 'TICKET_TEMPLATE-409-1';

const ownerPassTemplateDtoSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  chargeCount: z.number().int(),
  validityValue: z.number().int().nullable().optional(),
  validityUnit: z.enum(['DAY', 'MONTH']).nullable().optional(),
});

const ownerPassTemplatesDtoSchema = z.object({
  templates: z.array(ownerPassTemplateDtoSchema),
});

type OwnerPassTemplateDto = z.infer<typeof ownerPassTemplateDtoSchema>;
type OwnerPassTemplatesDto = z.infer<typeof ownerPassTemplatesDtoSchema>;

/** 서버 응답을 화면 모델로 바꾼다. 기간 값이나 단위가 없으면 만료 없음으로 본다. */
function toOwnerPassTemplate(dto: OwnerPassTemplateDto): OwnerPassTemplate {
  const hasValidity = dto.validityValue != null && dto.validityUnit != null;
  return {
    id: String(dto.id),
    name: dto.name,
    chargeCount: dto.chargeCount,
    duration: hasValidity
      ? { type: 'FIXED', value: dto.validityValue as number, unit: dto.validityUnit as 'DAY' | 'MONTH' }
      : { type: 'NONE' },
  };
}

export {
  PASS_TEMPLATE_DUPLICATE_CODE,
  ownerPassTemplateDtoSchema,
  ownerPassTemplatesDtoSchema,
  toOwnerPassTemplate,
};
export type { OwnerPassTemplateDto, OwnerPassTemplatesDto };
