import { api } from '@shared/api';
import { Photo } from '../model/memo';

// @TODO API Response, 타입 정의 필요
export interface UpdateMemoRequest {
  targetId: string;
  content?: string;
  photos?: Photo[];
}

export const updateMemo = async ({ targetId, content, photos }: UpdateMemoRequest) => {
  const response = await api.post(`/api/v0/memo`, {
    searchParams: {
      targetId,
    },
    json: {
      content,
      photos,
    },
  });
  return response.json();
};
