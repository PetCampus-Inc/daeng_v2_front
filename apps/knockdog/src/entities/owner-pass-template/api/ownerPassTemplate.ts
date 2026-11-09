import { ownerPassTemplateDtoSchema, ownerPassTemplatesDtoSchema } from '../model/ownerPassTemplateDto';
import type { PassTemplateRequestDto } from '../model/types';import { api, type ApiResponse } from '@shared/api';

const PASS_TEMPLATE_PATH = 'owner/school/ticket-templates';

/** `GET` - 이용권 템플릿 목록 (생성 순서) */
async function getOwnerPassTemplates() {
  const response = await api.get(PASS_TEMPLATE_PATH).json<ApiResponse<unknown>>();
  return ownerPassTemplatesDtoSchema.parse(response.data);
}

/** `POST` - 이용권 템플릿 등록 */
async function postOwnerPassTemplate(body: PassTemplateRequestDto) {
  const response = await api.post(PASS_TEMPLATE_PATH, { json: body }).json<ApiResponse<unknown>>();
  return ownerPassTemplateDtoSchema.parse(response.data);
}

/** `PUT` - 이용권 템플릿 수정 */
async function putOwnerPassTemplate(templateId: string, body: PassTemplateRequestDto) {
  const response = await api.put(`${PASS_TEMPLATE_PATH}/${templateId}`, { json: body }).json<ApiResponse<unknown>>();
  return ownerPassTemplateDtoSchema.parse(response.data);
}

/** `DELETE` - 이용권 템플릿 삭제 */
async function deleteOwnerPassTemplate(templateId: string) {
  await api.delete(`${PASS_TEMPLATE_PATH}/${templateId}`);
}

export { deleteOwnerPassTemplate, getOwnerPassTemplates, postOwnerPassTemplate, putOwnerPassTemplate };
