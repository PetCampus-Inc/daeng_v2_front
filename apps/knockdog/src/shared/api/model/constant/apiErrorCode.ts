import { LOGIN_ERROR_CODE, TOKEN_ERROR_CODE } from './authErrorCode';
import { COMMON_ERROR_CODE } from './commonErrorCode';

const API_ERROR_CODE = {
  /** 알 수 없는 에러 */
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  ...COMMON_ERROR_CODE,
  ...LOGIN_ERROR_CODE,
  ...TOKEN_ERROR_CODE,
} as const;

export { API_ERROR_CODE };
