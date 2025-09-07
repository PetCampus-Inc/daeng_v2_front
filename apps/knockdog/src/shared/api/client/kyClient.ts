import ky from 'ky';

import {
  insertAuthHeaderInterceptor,
  updateAccessTokenInterceptor,
  tokenRefreshInterceptor,
  transformErrorInterceptor,
} from '../interceptor';

const api = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  retry: 0,
  hooks: {
    beforeRequest: [insertAuthHeaderInterceptor],
    afterResponse: [updateAccessTokenInterceptor],
    beforeError: [tokenRefreshInterceptor, transformErrorInterceptor],
  },
});

export default api;
