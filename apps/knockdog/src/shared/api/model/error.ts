const API_ERROR_CODE = {
  WITHDRAWN_USER: 'WITHDRAWN_USER',
  REJOINING_RESTRICTION_PERIOD: 'REJOINING_RESTRICTION_PERIOD',
} as const;

type ApiErrorCode = (typeof API_ERROR_CODE)[keyof typeof API_ERROR_CODE];

class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    public message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export { ApiError, type ApiErrorCode, API_ERROR_CODE };
