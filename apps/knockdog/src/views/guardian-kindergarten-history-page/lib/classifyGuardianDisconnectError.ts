import { ApiError } from '@shared/api';

const GUARDIAN_DISCONNECT_ERROR = {
  todayAttendance: 'todayAttendance',
  alreadyDisconnected: 'alreadyDisconnected',
  ticketsOrReservationRemain: 'ticketsOrReservationRemain',
  other: 'other',
} as const;

type GuardianDisconnectErrorKind = (typeof GUARDIAN_DISCONNECT_ERROR)[keyof typeof GUARDIAN_DISCONNECT_ERROR];

const ERROR_CODE_TO_KIND: Record<string, GuardianDisconnectErrorKind> = {
  'SCHOOL_MEMBERSHIP-409-1': GUARDIAN_DISCONNECT_ERROR.todayAttendance,
  'GUARDIAN_SCHOOL_CONNECTION-409-1': GUARDIAN_DISCONNECT_ERROR.alreadyDisconnected,
  'GUARDIAN_SCHOOL_CONNECTION-409-2': GUARDIAN_DISCONNECT_ERROR.ticketsOrReservationRemain,
};

/**
 * 연결 해제 요청이 실패한 이유를 서버 오류 코드로 구분한다. 문구는 보지 않는다.
 */
const classifyGuardianDisconnectError = (error: unknown): GuardianDisconnectErrorKind => {
  if (!(error instanceof ApiError)) return GUARDIAN_DISCONNECT_ERROR.other;
  return ERROR_CODE_TO_KIND[error.code] ?? GUARDIAN_DISCONNECT_ERROR.other;
};

export { classifyGuardianDisconnectError, GUARDIAN_DISCONNECT_ERROR };
export type { GuardianDisconnectErrorKind };
