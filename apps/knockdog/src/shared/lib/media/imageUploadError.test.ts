import { describe, expect, it } from 'vitest';

import { UPLOAD_TIMEOUT_ERROR_NAME } from '@shared/api/lib/fetchWithUploadTimeout';
import { classifyImageUploadFailure, isImageUploadNetworkError } from './imageUploadError';

describe('imageUploadError', () => {
  it('treats upload timeout as a network failure', () => {
    const error = new Error('Upload request timed out');
    error.name = UPLOAD_TIMEOUT_ERROR_NAME;

    expect(isImageUploadNetworkError(error)).toBe(true);
    expect(classifyImageUploadFailure(error)).toBe('network');
  });

  it('does not treat generic abort errors as network failures', () => {
    const error = new DOMException('The operation was aborted.', 'AbortError');

    expect(isImageUploadNetworkError(error)).toBe(false);
    expect(classifyImageUploadFailure(error)).toBe('unreadable');
  });

  it('does not treat image decode failures as network failures', () => {
    const error = new Error('이미지를 로드할 수 없습니다.');

    expect(isImageUploadNetworkError(error)).toBe(false);
    expect(classifyImageUploadFailure(error)).toBe('unreadable');
  });
});
