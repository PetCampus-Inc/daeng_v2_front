import { ApiError, api } from '@shared/api';

export interface MemoPhoto {
  key: string;
  url: string;
}

export interface MemoResponse {
  id?: number | null;
  content: string;
  photos: MemoPhoto[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

const EMPTY_MEMO: MemoResponse = { content: '', photos: [] };

export const getMemo = async (targetId: string): Promise<MemoResponse> => {
  try {
    const response = await api
      .get(`memo`, {
        searchParams: {
          targetId,
        },
      })
      .json<MemoResponse>();

    return {
      ...response,
      content: response.content ?? '',
      photos: response.photos ?? [],
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return EMPTY_MEMO;
    throw error;
  }
};
