import ky from 'ky';

import {
  insertAuthHeaderInterceptor,
  updateAccessTokenInterceptor,
  tokenRefreshInterceptor,
  transformErrorInterceptor,
} from '../interceptor';

if (!process.env.NEXT_PUBLIC_API_BASE_URL) throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined');

const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v0`;

const api = ky.create({
  prefixUrl: baseUrl,
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  retry: 0,
  hooks: {
    beforeRequest: [insertAuthHeaderInterceptor],
    afterResponse: [tokenRefreshInterceptor, updateAccessTokenInterceptor],
    beforeError: [transformErrorInterceptor],
  },
});

export default api;
