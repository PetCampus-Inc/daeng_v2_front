import type {
  AttendanceCheckinoutCandidatesDto,
  AttendanceCheckinoutSummaryDto,
  AttendanceCheckinoutTodayDto,
  TodayAttendanceFilter,
} from '../model/attendanceCheckinout';

import { api, type ApiResponse } from '@shared/api';

const ATTENDANCE_CHECKINOUTS_PATH = 'attendance-checkinouts';

interface GetAttendanceCheckinoutCandidatesParams {
  date?: string;
}

interface GetAttendanceCheckinoutTodayParams {
  date?: string;
  filter?: TodayAttendanceFilter;
}

interface GetAttendanceCheckinoutSummaryParams {
  date?: string;
}

/** 출결 처리 API는 날짜를 받지 않고 오늘만 처리한다. */
interface AttendanceCheckinoutActionParams {
  petId: string;
}

function toSearchParams(params: Record<string, string | undefined>) {
  const searchParams: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === '') continue;
    searchParams[key] = value;
  }

  return Object.keys(searchParams).length > 0 ? searchParams : undefined;
}

/** `GET` - 등원 처리 대상(예약한 원생) 목록 조회. 검색·지각 필터는 클라이언트에서 한다. */
function getAttendanceCheckinoutCandidates(params: GetAttendanceCheckinoutCandidatesParams = {}) {
  return api
    .get(`${ATTENDANCE_CHECKINOUTS_PATH}/candidates`, {
      searchParams: toSearchParams({ date: params.date }),
    })
    .json<ApiResponse<AttendanceCheckinoutCandidatesDto>>();
}

/** `GET` - 등원 목록 조회 */
function getAttendanceCheckinoutToday(params: GetAttendanceCheckinoutTodayParams = {}) {
  return api
    .get(`${ATTENDANCE_CHECKINOUTS_PATH}/today`, {
      searchParams: toSearchParams({
        date: params.date,
        filter: params.filter,
      }),
    })
    .json<ApiResponse<AttendanceCheckinoutTodayDto>>();
}

/** `GET` - 등하원 운영 현황 조회 */
function getAttendanceCheckinoutSummary(params: GetAttendanceCheckinoutSummaryParams = {}) {
  return api
    .get(`${ATTENDANCE_CHECKINOUTS_PATH}/summary`, {
      searchParams: toSearchParams({ date: params.date }),
    })
    .json<ApiResponse<AttendanceCheckinoutSummaryDto>>();
}

function postAttendanceAction(petId: string, action: string) {
  return api.post(`${ATTENDANCE_CHECKINOUTS_PATH}/${petId}/${action}`).json<ApiResponse<unknown>>();
}

/** `POST` - 등원 처리 */
function postAttendanceCheckIn({ petId }: AttendanceCheckinoutActionParams) {
  return postAttendanceAction(petId, 'check-in');
}

/** `POST` - 하원 처리 */
function postAttendanceCheckOut({ petId }: AttendanceCheckinoutActionParams) {
  return postAttendanceAction(petId, 'check-out');
}

/** `POST` - 등원 취소 */
function postAttendanceCancelCheckIn({ petId }: AttendanceCheckinoutActionParams) {
  return postAttendanceAction(petId, 'cancel-check-in');
}

/** `POST` - 하원 취소 */
function postAttendanceCancelCheckOut({ petId }: AttendanceCheckinoutActionParams) {
  return postAttendanceAction(petId, 'cancel-check-out');
}

/** `POST` - 결석 처리 */
function postAttendanceAbsent({ petId }: AttendanceCheckinoutActionParams) {
  return postAttendanceAction(petId, 'absent');
}

/** `POST` - 결석 취소 */
function postAttendanceCancelAbsent({ petId }: AttendanceCheckinoutActionParams) {
  return postAttendanceAction(petId, 'cancel-absent');
}

export {
  getAttendanceCheckinoutCandidates,
  getAttendanceCheckinoutSummary,
  getAttendanceCheckinoutToday,
  postAttendanceAbsent,
  postAttendanceCancelAbsent,
  postAttendanceCancelCheckIn,
  postAttendanceCancelCheckOut,
  postAttendanceCheckIn,
  postAttendanceCheckOut,
};
export type {
  AttendanceCheckinoutActionParams,
  GetAttendanceCheckinoutCandidatesParams,
  GetAttendanceCheckinoutSummaryParams,
  GetAttendanceCheckinoutTodayParams,
};
