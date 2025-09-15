import api from '@shared/api/ky-client';
import { Photo } from '../model/memo';

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
