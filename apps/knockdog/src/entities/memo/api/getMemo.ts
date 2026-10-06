import { api } from '@shared/api';

export interface MemoPhoto {
  key: string;
  url: string;
}

export interface MemoResponse {
  content: string;
  photos: MemoPhoto[];
  createdAt?: string | number[] | null;
  writtenAt?: string | number[] | null;
  updatedAt?: string | number[] | null;
  modifiedAt?: string | number[] | null;
}

export const getMemo = async (targetId: string): Promise<MemoResponse> => {
  const response = await api.get(`memo`, {
    searchParams: {
      targetId,
    },
  });
  return response.json();
};
