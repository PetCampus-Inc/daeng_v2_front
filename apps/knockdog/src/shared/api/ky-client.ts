import ky from 'ky';
import { ApiError } from '@shared/lib';

const api = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  retry: 0,
  hooks: {
    beforeError: [
      async (error) => {
        const data = (await error.response.json()) as ApiError;
        throw new ApiError(data.code, data.message);
      },
    ],
  },
});

export default api;
