type PassTemplateDurationUnit = 'DAY' | 'MONTH';

type PassTemplateDuration = { type: 'NONE' } | { type: 'FIXED'; value: number; unit: PassTemplateDurationUnit };

/** 화면에서 쓰는 이용권 템플릿 */
interface OwnerPassTemplate {
  id: string;
  name: string;
  chargeCount: number;
  duration: PassTemplateDuration;
}

/** 등록·수정 폼에서 만든 입력값 */
interface OwnerPassTemplateInput {
  name: string;
  chargeCount: number;
  duration: PassTemplateDuration;
}

/** 서버 요청 본문 (`TicketTemplateRequest`) */
interface PassTemplateRequestDto {
  name: string;
  chargeCount: number;
  validityValue: number | null;
  validityUnit: PassTemplateDurationUnit | null;
}

export type {
  OwnerPassTemplate,
  OwnerPassTemplateInput,
  PassTemplateDuration,
  PassTemplateDurationUnit,
  PassTemplateRequestDto,
};
