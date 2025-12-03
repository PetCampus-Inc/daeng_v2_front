import { api, type ApiResponse } from '@shared/api';

interface UploadImageResponse {
  preSignedUrl: string;
  key: string;
}

async function getUploadImage(path: string = 'temp'): Promise<UploadImageResponse> {
  const response = await api
    .get('s3/image/pre-signed-url/upload', {
      searchParams: {
        path,
      },
    })
    .json<ApiResponse<UploadImageResponse, string>>();

  if (response.status !== 200 || !response.data) {
    throw new Error(response.message || '업로드용 pre-signed URL을 가져오지 못했습니다.');
  }

  return response.data;
}

export { getUploadImage, type UploadImageResponse };
