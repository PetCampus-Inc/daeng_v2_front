import { API_TIMEOUT_MS } from '@shared/api/config/timeouts';

const UPLOAD_TIMEOUT_ABORT_REASON = 'knockdog:upload-timeout';
const UPLOAD_TIMEOUT_ERROR_NAME = 'UploadTimeoutError';

function fetchWithUploadTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const callerSignal = init?.signal;

  const handleCallerAbort = () => {
    controller.abort(callerSignal?.reason);
  };

  if (callerSignal) {
    if (callerSignal.aborted) {
      controller.abort(callerSignal.reason);
    } else {
      callerSignal.addEventListener('abort', handleCallerAbort);
    }
  }

  const timeoutId = window.setTimeout(() => {
    controller.abort(UPLOAD_TIMEOUT_ABORT_REASON);
  }, API_TIMEOUT_MS.upload);

  return fetch(input, { ...init, signal: controller.signal })
    .catch((error) => {
      if (controller.signal.aborted && controller.signal.reason === UPLOAD_TIMEOUT_ABORT_REASON) {
        const timeoutError = new Error('Upload request timed out');
        timeoutError.name = UPLOAD_TIMEOUT_ERROR_NAME;
        throw timeoutError;
      }

      throw error;
    })
    .finally(() => {
      window.clearTimeout(timeoutId);
      if (callerSignal) {
        callerSignal.removeEventListener('abort', handleCallerAbort);
      }
    });
}

export { fetchWithUploadTimeout, UPLOAD_TIMEOUT_ERROR_NAME };
