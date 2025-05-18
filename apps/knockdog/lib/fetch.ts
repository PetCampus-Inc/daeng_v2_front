import axios, { AxiosRequestConfig } from 'axios';

export async function Fetch<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await axios.get<T>(url, config);
  return res.data;
}
