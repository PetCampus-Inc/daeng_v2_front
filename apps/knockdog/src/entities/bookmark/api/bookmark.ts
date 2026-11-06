import { api } from '@shared/api';
import type { BookmarkResponse } from '../model/bookmark';

// @TODO API Response, 타입 정의 필요
function postBookmark(id: string) {
  return api.post(`bookmark/${id}`);
}

function deleteBookmark(id: string) {
  return api.delete(`bookmark/${id}`);
}

function getBookmarks() {
  return api
    .get('bookmark')
    .json<BookmarkResponse>()
    .then((res) => res.data);
}

export { postBookmark, deleteBookmark, getBookmarks };
