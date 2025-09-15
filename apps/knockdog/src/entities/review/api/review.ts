import { api } from '@shared/api';
import { Review } from '../model/review';

// @TODO  API 완성 후 수정 필요 -> shared로 이동해야함
// @TODO API Response, 타입 정의 필요
interface PagingDto {
  currentPage: number;
  hasNext: boolean;
  totalPage: number;
}

interface ReviewListResponse {
  reviews: Review[];
  paging: PagingDto;
}

// @TODO  API 완성 후 수정 필요
const getReviewList = async ({ targetId, page }: { targetId: string; page: number }): Promise<ReviewListResponse> => {
  const response = await api.get(`/api/v0/review`, {
    searchParams: {
      targetId,
      page,
    },
  });
  return response.json();
};

export { getReviewList, type ReviewListResponse };
