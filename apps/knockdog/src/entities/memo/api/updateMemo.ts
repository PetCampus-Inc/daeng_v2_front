import { api } from '@shared/api';
import type { MemoResponse } from './getMemo';
import {
  countMemoCharacters,
  MEMO_MAX_CONTENT_LENGTH,
  MEMO_MAX_PHOTO_COUNT,
  normalizeMemoContent,
} from '../lib/memoContent';

export interface UpdateMemoRequest {
  targetId: string;
  content: string;
  photoKeys: string[];
}

export const updateMemo = async ({ targetId, content, photoKeys }: UpdateMemoRequest) => {
  const normalizedContent = normalizeMemoContent(content);

  if (!normalizedContent) throw new Error('메모 내용을 입력해 주세요.');
  if (countMemoCharacters(normalizedContent) > MEMO_MAX_CONTENT_LENGTH) {
    throw new Error(`메모는 최대 ${MEMO_MAX_CONTENT_LENGTH.toLocaleString()}자까지 작성할 수 있어요.`);
  }
  if (photoKeys.length > MEMO_MAX_PHOTO_COUNT) {
    throw new Error(`사진은 최대 ${MEMO_MAX_PHOTO_COUNT}장까지 등록할 수 있어요.`);
  }

  const response = await api.post(`memo?targetId=${targetId}`, {
    json: { content: normalizedContent, photoKeys },
  });
  return response.json<MemoResponse>();
};
