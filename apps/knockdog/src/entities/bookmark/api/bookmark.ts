import { api } from '@shared/api';

// @TODO API Response, 타입 정의 필요
function postBookmark(id: string) {
  return api.post(`bookmark/${id}`);
}

function deleteBookmark(id: string) {
  return api.delete(`bookmark/${id}`);
}

export { postBookmark, deleteBookmark };
