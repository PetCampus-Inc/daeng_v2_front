import { isUploadTimeoutError } from '@shared/api/lib/isTimeoutError';

function isImageUploadNetworkError(error: unknown) {
  if (isUploadTimeoutError(error)) return true;
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return (
    message.includes('network') ||
    message.includes('failed to fetch') ||
    message.includes('s3 업로드') ||
    message.includes('상태 코드')
  );
}

function classifyImageUploadFailure(error: unknown): 'network' | 'unreadable' {
  if (isImageUploadNetworkError(error)) return 'network';
  return 'unreadable';
}

export { classifyImageUploadFailure, isImageUploadNetworkError };
