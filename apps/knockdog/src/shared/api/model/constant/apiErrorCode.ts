import { LOGIN_ERROR_CODE, TOKEN_ERROR_CODE } from './authErrorCode';

const API_ERROR_CODE = {
  ...LOGIN_ERROR_CODE,
  ...TOKEN_ERROR_CODE,
} as const;

export { API_ERROR_CODE };
