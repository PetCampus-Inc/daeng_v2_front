export const API_ERROR_CODE = {
  WITHDRAWN_USER: 'WITHDRAWN_USER',
  REJOINING_RESTRICTION_PERIOD: 'REJOINING_RESTRICTION_PERIOD',
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODE)[keyof typeof API_ERROR_CODE];

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    public message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
