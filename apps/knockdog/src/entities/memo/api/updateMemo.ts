import { api } from '@shared/api';

// @TODO API Response, 타입 정의 필요
export interface UpdateMemoRequest {
  targetId: string;
  content?: string;
  photoKeys?: string[];
}

export const updateMemo = async ({ targetId, content, photoKeys }: UpdateMemoRequest) => {
  const response = await api.post(`memo?targetId=${targetId}`, {
    json: { content, photoKeys },
  });
  return response.json();
};
