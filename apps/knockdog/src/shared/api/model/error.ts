import { API_ERROR_CODE } from './constant/apiErrorCode';

type ApiErrorCode = (typeof API_ERROR_CODE)[keyof typeof API_ERROR_CODE];

class ApiError<T = ApiErrorCode> extends Error {
  constructor(
    public status: number,
    public code: T,
    public message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export { ApiError, type ApiErrorCode };
