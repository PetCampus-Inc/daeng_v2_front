import { describe, expect, it } from 'vitest';

import { ApiError } from '@shared/api/model/error';
import { TOKEN_ERROR_CODE } from '@shared/api/model/constant/authErrorCode';

import { isExpectedSessionError, shouldReportApiError } from './apiErrorReport';
import { filterSentryBreadcrumb, filterSentryEvent } from './filterSentryEvent';

describe('apiErrorReport', () => {
  it('drops the session errors the app already logs out for', () => {
    const error = new ApiError(401, TOKEN_ERROR_CODE.EXPIRED_REFRESH_TOKEN, '리프레시 토큰이 만료되었습니다.');

    expect(isExpectedSessionError(error)).toBe(true);
    expect(shouldReportApiError(error)).toBe(false);
    expect(filterSentryEvent({ message: 'expired' }, { originalException: error })).toBeNull();
  });

  it('keeps an unexpected 401', () => {
    const error = new ApiError(401, 'ACCOUNT_LOCKED', '잠긴 계정입니다.');

    expect(isExpectedSessionError(error)).toBe(false);
    expect(shouldReportApiError(error)).toBe(true);
    expect(filterSentryEvent({ message: 'locked' }, { originalException: error })).toEqual({ message: 'locked' });
  });

  it('does not report token refresh and client errors', () => {
    expect(shouldReportApiError(new ApiError(401, TOKEN_ERROR_CODE.EXPIRED_TOKEN, '만료'))).toBe(false);
    expect(shouldReportApiError(new ApiError(400, 'COMMON-400-1', '값 오류'))).toBe(false);
    expect(shouldReportApiError(new ApiError(404, 'NOT_FOUND', '없음'))).toBe(false);
  });

  it('reports server failures', () => {
    expect(shouldReportApiError(new ApiError(500, 'INTERNAL', '실패'))).toBe(true);
  });

  it('removes tokens and emails from breadcrumbs', () => {
    const breadcrumb = filterSentryBreadcrumb({
      category: 'fetch',
      message: 'user@knockdog.net',
      data: {
        url: 'https://api.knockdog.net/me?token=abc&page=1',
        headers: { Authorization: 'Bearer secret-token', Accept: 'application/json' },
      },
    });

    expect(breadcrumb.message).toBe('[Filtered]');
    expect(breadcrumb.data.url).toBe('https://api.knockdog.net/me?token=%5BFiltered%5D&page=1');
    expect(breadcrumb.data.headers).toEqual({ Authorization: '[Filtered]', Accept: 'application/json' });
  });
});
