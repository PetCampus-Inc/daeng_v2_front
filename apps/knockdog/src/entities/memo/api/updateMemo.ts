import { api } from '@shared/api';
import { Photo } from '../model/memo';

// @TODO API Response, 타입 정의 필요
export interface UpdateMemoRequest {
  targetId: string;
  content?: string;
  photos?: Photo[];
}

export const updateMemo = async ({ targetId, content, photos }: UpdateMemoRequest) => {
  const formData = new FormData();
  
  if (content !== undefined) {
    formData.append('content', content);
  }
  
  if (photos) {
    formData.append('photos', JSON.stringify(photos));
  }

  const response = await api.post(`memo`, {
    searchParams: {
      targetId,
    },
    body: formData,
    headers: {
      'Content-Type': undefined, // FormData 사용 시 브라우저가 자동으로 설정하도록 제거
    },
  });
  return response.json();
};
