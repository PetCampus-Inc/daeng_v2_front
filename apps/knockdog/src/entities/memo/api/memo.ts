import type { MemoList } from '../model/memo';
import { api } from '@shared/api';

export function getMemoList() {
  return api.get('memo/shops').json<MemoList>();
}
