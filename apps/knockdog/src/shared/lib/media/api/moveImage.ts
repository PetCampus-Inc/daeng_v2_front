import { api, type ApiResponse } from '@shared/api';

async function moveImage({ key, path }: { key: string; path: string }): Promise<ApiResponse<string, string>> {
  return api.post('s3/image/move', { json: { key, path } }).json<ApiResponse<string, string>>();
}

export { moveImage };
