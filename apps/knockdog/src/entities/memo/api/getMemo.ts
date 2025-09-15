import { api } from '@shared/api';
import { Photo } from '../model/memo';

export interface MemoResponse {
  content: string;
  photos: Photo[];
}

export const getMemo = async (targetId: string): Promise<MemoResponse> => {
  const response = await api.get(`/api/v0/memo`, {
    searchParams: {
      targetId,
    },
  });
  return response.json();
};
