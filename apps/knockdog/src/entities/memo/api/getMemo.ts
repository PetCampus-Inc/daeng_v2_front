import { api } from '@shared/api';

export interface MemoPhoto {
  key: string;
  url: string;
}

export interface MemoResponse {
  content: string;
  photos: MemoPhoto[];
}

export const getMemo = async (targetId: string): Promise<MemoResponse> => {
  const response = await api.get(`memo`, {
    searchParams: {
      targetId,
    },
  });
  return response.json();
};
