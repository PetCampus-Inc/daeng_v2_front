import axios, { AxiosRequestConfig, AxiosError } from 'axios';

export class APIError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

export interface ErrorResponse extends Record<string, unknown> {
  message?: string;
}

function handleAxiosError(error: unknown): never {
  const err = error as AxiosError;
  const data = err.response?.data as ErrorResponse;
  const message = data?.message || err.message || 'Unknown error';
  const status = err.response?.status;
  throw new APIError(message, status);
}

export async function Fetch<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const res = await axios.get<T>(url, config);
    return res.data;
  } catch (error) {
    return handleAxiosError(error);
  }
}

export async function Post<T, B = unknown>(
  url: string,
  body: B,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const res = await axios.post<T>(url, body, config);
    return res.data;
  } catch (error) {
    return handleAxiosError(error);
  }
}
