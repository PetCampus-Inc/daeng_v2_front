import { api } from '@shared/api';

// @TODO API Response, 타입 정의 필요
function postBookmark(id: string) {
  return api.post(`/api/v0/bookmark/${id}`);
}

function deleteBookmark(id: string) {
  return api.delete(`/api/v0/bookmark/${id}`);
}

export { postBookmark, deleteBookmark };
