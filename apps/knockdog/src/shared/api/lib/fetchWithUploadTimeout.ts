import { API_TIMEOUT_MS } from '@shared/api/config/timeouts';

function fetchWithUploadTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS.upload);

  return fetch(input, { ...init, signal: controller.signal }).finally(() => {
    window.clearTimeout(timeoutId);
  });
}

export { fetchWithUploadTimeout };
