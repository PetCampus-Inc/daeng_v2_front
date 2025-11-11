import { api, type ApiResponse } from '@shared/api';

interface PreviewImageResponse {
  preSignedUrl: string;
  key: string;
}

async function getPreviewImage(key: string): Promise<ApiResponse<PreviewImageResponse, string>> {
  return api.get(`s3/image/pre-signed-url?key=${key}`).json<ApiResponse<PreviewImageResponse, string>>();
}

export { getPreviewImage, type PreviewImageResponse };
