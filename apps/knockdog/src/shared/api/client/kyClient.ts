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
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJ0eXBlIjoiQUNDRVNTIiwic3ViIjoiMDFLNE1GRlJWRzFZUFo1S1dSU1dEVkFHRlEiLCJpc3MiOiJwZXRjYW1wdXMua25vY2tkb2dAZ21haWwuY29tIiwiaWF0IjoxNzYxNDY4ODM0LCJleHAiOjE3NjE1NTUyMzR9.aCnGey0Pn8b7GLsLuTAoO3pNky04aux99K_lVrEVRFA',
  },
  retry: 0,
  hooks: {
    beforeRequest: [insertAuthHeaderInterceptor],
    afterResponse: [tokenRefreshInterceptor, updateAccessTokenInterceptor],
    beforeError: [transformErrorInterceptor],
  },
});

export default api;
