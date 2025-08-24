import { ApiErrorCode } from './error-code';

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    public message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
