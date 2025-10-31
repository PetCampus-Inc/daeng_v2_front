import { api } from '@shared/api';
import { Review } from '../model/review';
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
  const response = await api.get(`review`, {
    searchParams: {
      targetId,
      page,
    },
  });
  return response.json();
};

export { getReviewList, type ReviewListResponse };
