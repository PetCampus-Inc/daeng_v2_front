import { REQUEST_FAILED_MESSAGE } from '../config/messages';
import { isTimeoutError } from './isTimeoutError';

function mapRequestErrorMessage(error: unknown, fallback = REQUEST_FAILED_MESSAGE) {
  if (isTimeoutError(error)) return REQUEST_FAILED_MESSAGE;
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

export { mapRequestErrorMessage };
