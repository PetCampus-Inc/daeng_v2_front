interface ApiResponse<T> {
  code: string;
  data: T;
  message: string;
  status: number;
}

interface UploadImageResponse {
  preSignedUrl: string;
  key: string;
}

async function uploadImage(path: string = 'temp') {
  const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/s3/image/pre-signed-url/upload?path=${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = (await response.json()) as ApiResponse<UploadImageResponse>;
  if (data.status === 200) {
    return data.data;
  } else {
    throw new Error(data.message);
  }
}

export { uploadImage };
