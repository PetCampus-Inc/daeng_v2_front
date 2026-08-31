import { TimeoutError } from 'ky';

import { UPLOAD_TIMEOUT_ERROR_NAME } from './fetchWithUploadTimeout';

function isUploadTimeoutError(error: unknown) {
  if (!error || typeof error !== 'object') return false;

  const name = 'name' in error ? String(error.name) : '';
  return name === UPLOAD_TIMEOUT_ERROR_NAME;
}

function isTimeoutError(error: unknown) {
  if (error instanceof TimeoutError) return true;
  return isUploadTimeoutError(error);
}

export { isTimeoutError, isUploadTimeoutError };
