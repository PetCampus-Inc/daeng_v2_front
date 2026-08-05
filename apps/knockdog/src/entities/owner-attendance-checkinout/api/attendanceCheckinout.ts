import type {
  AttendanceCheckinoutActionDto,
  AttendanceCheckinoutCandidatesDto,
  AttendanceCheckinoutSummaryDto,
  CheckinoutStatus,
} from '../model/attendanceCheckinout';

import { api, type ApiResponse } from '@shared/api';

const ATTENDANCE_CHECKINOUTS_PATH = 'attendance-checkinouts';

interface GetAttendanceCheckinoutCandidatesParams {
  date?: string;
  q?: string;
  checkinoutStatus?: CheckinoutStatus;
}

interface GetAttendanceCheckinoutSummaryParams {
  date?: string;
}

interface AttendanceCheckinoutActionParams {
  petId: string;
  date?: string;
}

function toSearchParams(params: Record<string, string | undefined>) {
  const searchParams: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === '') continue;
    searchParams[key] = value;
  }

  return Object.keys(searchParams).length > 0 ? searchParams : undefined;
}

/** `GET` - 등원 처리 후보 목록 조회 */
function getAttendanceCheckinoutCandidates(params: GetAttendanceCheckinoutCandidatesParams = {}) {
  return api
    .get(`${ATTENDANCE_CHECKINOUTS_PATH}/candidates`, {
      searchParams: toSearchParams({
        date: params.date,
        q: params.q,
        checkinoutStatus: params.checkinoutStatus,
      }),
    })
    .json<ApiResponse<AttendanceCheckinoutCandidatesDto>>();
}

/** `GET` - 등하원 운영 현황 조회 */
function getAttendanceCheckinoutSummary(params: GetAttendanceCheckinoutSummaryParams = {}) {
  return api
    .get(`${ATTENDANCE_CHECKINOUTS_PATH}/summary`, {
      searchParams: toSearchParams({ date: params.date }),
    })
    .json<ApiResponse<AttendanceCheckinoutSummaryDto>>();
}

/** `POST` - 등원 처리 */
function postAttendanceCheckIn({ petId, date }: AttendanceCheckinoutActionParams) {
  return api
    .post(`${ATTENDANCE_CHECKINOUTS_PATH}/${petId}/check-in`, {
      searchParams: toSearchParams({ date }),
    })
    .json<ApiResponse<AttendanceCheckinoutActionDto>>();
}

/** `POST` - 하원 처리 */
function postAttendanceCheckOut({ petId, date }: AttendanceCheckinoutActionParams) {
  return api
    .post(`${ATTENDANCE_CHECKINOUTS_PATH}/${petId}/check-out`, {
      searchParams: toSearchParams({ date }),
    })
    .json<ApiResponse<AttendanceCheckinoutActionDto>>();
}

/** `POST` - 등원 취소 */
function postAttendanceCancelCheckIn({ petId, date }: AttendanceCheckinoutActionParams) {
  return api
    .post(`${ATTENDANCE_CHECKINOUTS_PATH}/${petId}/cancel-check-in`, {
      searchParams: toSearchParams({ date }),
    })
    .json<ApiResponse<AttendanceCheckinoutActionDto>>();
}

/** `POST` - 하원 취소 */
function postAttendanceCancelCheckOut({ petId, date }: AttendanceCheckinoutActionParams) {
  return api
    .post(`${ATTENDANCE_CHECKINOUTS_PATH}/${petId}/cancel-check-out`, {
      searchParams: toSearchParams({ date }),
    })
    .json<ApiResponse<AttendanceCheckinoutActionDto>>();
}

export {
  getAttendanceCheckinoutCandidates,
  getAttendanceCheckinoutSummary,
  postAttendanceCancelCheckIn,
  postAttendanceCancelCheckOut,
  postAttendanceCheckIn,
  postAttendanceCheckOut,
};
export type {
  AttendanceCheckinoutActionParams,
  GetAttendanceCheckinoutCandidatesParams,
  GetAttendanceCheckinoutSummaryParams,
};
