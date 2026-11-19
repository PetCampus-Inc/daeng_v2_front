import * as Sentry from '@sentry/nextjs';

import { ApiError } from '@shared/api/model/error';

import { shouldReportApiError } from './apiErrorReport';

const reportedApiErrors = new WeakSet<ApiError<string>>();

function reportUnexpectedApiError(error: ApiError<string>, pathname: string) {
  if (!shouldReportApiError(error)) return;
  reportedApiErrors.add(error);

  const loginStage = /\/auth\/(verify\/oidc|login)$/.exec(pathname)?.[1];
  const albumStage = /\/albums\/[^/]+\/photos\/(upload-urls|commit)$/.exec(pathname)?.[1];
  const tags = loginStage
    ? { feature: 'login', stage: loginStage === 'login' ? 'session' : 'verify_oidc' }
    : albumStage
      ? { feature: 'album_upload', stage: albumStage }
      : {};

  Sentry.captureException(error, { tags: { ...tags, source: 'api', http_status: String(error.status) } });
}

function reportCriticalFailure(feature: 'login' | 'album_upload', stage: string, error: unknown) {
  if (error instanceof ApiError) {
    if (reportedApiErrors.has(error)) return;
    if (error.status < 500 && ![403, 408, 429].includes(error.status)) return;
  }

  // Provider errors and upload failures can contain URLs, file paths or credentials.
  Sentry.captureException(new Error(`${feature} failed at ${stage}`), {
    tags: {
      feature,
      stage,
      source: 'critical_flow',
      ...(error instanceof ApiError ? { http_status: String(error.status) } : {}),
    },
  });
}

export { reportCriticalFailure, reportUnexpectedApiError };
