import { ApiError } from '@shared/api/model/error';
import { LOGIN_ERROR_CODE, TOKEN_ERROR_CODE } from '@shared/api/model/constant/authErrorCode';

const EXPECTED_SESSION_CODES = new Set<string>([
  TOKEN_ERROR_CODE.EXPIRED_REFRESH_TOKEN,
  TOKEN_ERROR_CODE.INVALID_TOKEN,
  TOKEN_ERROR_CODE.UNAUTHORIZED_REQUEST,
  TOKEN_ERROR_CODE.TOKEN_VERIFICATION_FAILED,
]);

const TOKEN_LIFECYCLE_CODES = new Set<string>(Object.values(TOKEN_ERROR_CODE));
const EXPECTED_AUTH_CODES = new Set<string>([
  LOGIN_ERROR_CODE.WITHDRAWN_USER,
  LOGIN_ERROR_CODE.REJOINING_RESTRICTION_PERIOD,
  'INVALID_PASSWORD',
]);

function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

function isExpectedSessionError(error: unknown) {
  return isApiError(error) && error.status === 401 && EXPECTED_SESSION_CODES.has(String(error.code));
}

function shouldReportApiError(error: { status: number; code: string }) {
  if (error.status >= 500) return true;
  if (error.status !== 401) return false;
  return !TOKEN_LIFECYCLE_CODES.has(error.code) && !EXPECTED_AUTH_CODES.has(error.code);
}

export { isExpectedSessionError, shouldReportApiError };
