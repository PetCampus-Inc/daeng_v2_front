import {
  toCreateAttendanceRecordNoteTemplateRequest,
  type AttendanceRecordNoteTemplateDto,
  type CreateOwnerNoticeTemplateInput,
} from '../model/ownerNoticeTemplate';

import { api, type ApiResponse } from '@shared/api';

const ATTENDANCE_RECORD_NOTE_TEMPLATES_PATH = 'attendance-record-note-templates';

/** `GET` - 현재 유치원 알림장 템플릿 목록 조회 (수정일시 내림차순) */
function getAttendanceRecordNoteTemplates() {
  return api
    .get(ATTENDANCE_RECORD_NOTE_TEMPLATES_PATH)
    .json<ApiResponse<AttendanceRecordNoteTemplateDto[]>>();
}

/** `GET` - 알림장 템플릿 상세 조회 */
function getAttendanceRecordNoteTemplate(id: string) {
  return api
    .get(`${ATTENDANCE_RECORD_NOTE_TEMPLATES_PATH}/${id}`)
    .json<ApiResponse<AttendanceRecordNoteTemplateDto>>();
}

/** `POST` - 알림장 템플릿 생성 */
function postAttendanceRecordNoteTemplate(input: CreateOwnerNoticeTemplateInput) {
  return api
    .post(ATTENDANCE_RECORD_NOTE_TEMPLATES_PATH, {
      json: toCreateAttendanceRecordNoteTemplateRequest(input),
    })
    .json<ApiResponse<AttendanceRecordNoteTemplateDto>>();
}

/** `Patch` - 알림장 템플릿 수정 */
function patchAttendanceRecordNoteTemplate(id: string, input: CreateOwnerNoticeTemplateInput) {
  return api
    .patch(`${ATTENDANCE_RECORD_NOTE_TEMPLATES_PATH}/${id}`, {
      json: toCreateAttendanceRecordNoteTemplateRequest(input),
    })
    .json<ApiResponse<AttendanceRecordNoteTemplateDto>>();
}

/** `DELETE` - 알림장 템플릿 삭제 */
function deleteAttendanceRecordNoteTemplate(id: string) {
  return api
    .delete(`${ATTENDANCE_RECORD_NOTE_TEMPLATES_PATH}/${id}`)
    .json<ApiResponse<Record<string, never> | null>>();
}

export {
  deleteAttendanceRecordNoteTemplate,
  getAttendanceRecordNoteTemplate,
  getAttendanceRecordNoteTemplates,
  postAttendanceRecordNoteTemplate,
  patchAttendanceRecordNoteTemplate,
};
