import * as Sentry from '@sentry/nextjs';

import { ApiError } from '@shared/api/model/error';

import { shouldReportApiError } from './apiErrorReport';

function reportUnexpectedApiError(error: ApiError) {
  if (!shouldReportApiError(error)) return;
  Sentry.captureException(error);
}

export { reportUnexpectedApiError };
