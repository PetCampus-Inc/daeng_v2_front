function isTimeoutError(error: unknown) {
  if (!error || typeof error !== 'object') return false;

  const name = 'name' in error ? String(error.name) : '';
  if (name === 'TimeoutError' || name === 'AbortError') return true;

  const message = 'message' in error ? String(error.message) : '';
  return /timed out|timeout|aborted/i.test(message);
}

export { isTimeoutError };
