import type { AttendanceRecordPayload } from '../model/attendanceRecord';

import { api, type ApiResponse } from '@shared/api';

const ATTENDANCE_RECORDS_PATH = 'attendance-records';

/** `POST` - 등하원기록 임시저장 */
function postAttendanceRecordDraft(payload: AttendanceRecordPayload) {
  return api
    .post(ATTENDANCE_RECORDS_PATH, { json: payload })
    .json<ApiResponse<Record<string, never> | null>>();
}

/** `POST` - 등하원기록 발송 (초안 없으면 생성 발송, 발송된 기록은 재발송) */
function postAttendanceRecordSend(payload: AttendanceRecordPayload) {
  return api
    .post(`${ATTENDANCE_RECORDS_PATH}/send`, { json: payload })
    .json<ApiResponse<Record<string, never> | null>>();
}

export { postAttendanceRecordDraft, postAttendanceRecordSend };
