import type {
  AttendanceRecordDto,
  AttendanceRecordPayload,
} from '../model/attendanceRecord';

import { api, ApiError, type ApiResponse } from '@shared/api';

const ATTENDANCE_RECORDS_PATH = 'attendance-records';

interface GetAttendanceRecordParams {
  petId: string;
  date?: string;
}

/** `GET` - 등하원기록 단건 조회 (date 생략 시 오늘) */
async function getAttendanceRecord({ petId, date }: GetAttendanceRecordParams) {
  try {
    return await api
      .get(`${ATTENDANCE_RECORDS_PATH}/${petId}`, {
        searchParams: date ? { date } : undefined,
      })
      .json<ApiResponse<AttendanceRecordDto | null>>();
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return {
        status: 404,
        code: 'NOT_FOUND',
        message: '',
        data: null,
      } satisfies ApiResponse<AttendanceRecordDto | null>;
    }

    throw error;
  }
}

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

interface GetAttendanceRecordDatesParams {
  petId: string;
  from: string;
  to: string;
}

/** `GET` - 기간 내 발송된 등하원기록이 존재하는 날짜 조회 */
async function getAttendanceRecordDates({ petId, from, to }: GetAttendanceRecordDatesParams) {
  return api
    .get(`${ATTENDANCE_RECORDS_PATH}/${petId}/dates`, {
      searchParams: { from, to },
    })
    .json<ApiResponse<{ dates: number[][] }>>();
}

export {
  getAttendanceRecord,
  getAttendanceRecordDates,
  postAttendanceRecordDraft,
  postAttendanceRecordSend,
};
