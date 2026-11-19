import { QueryClient } from '@tanstack/react-query';
import { expect, test, vi } from 'vitest';

import { createReviewInfiniteQueryOptions } from './reviewQueryKeys';
import { getReviewList } from '../api/review';

vi.mock('../api/review', () => ({ getReviewList: vi.fn() }));

test('블로그 리뷰 61건을 30건씩 이어서 조회한다', async () => {
  const reviewIds = Array.from({ length: 61 }, (_, index) => String(index + 1));
  vi.mocked(getReviewList).mockImplementation(async ({ page }) => ({
    reviews: reviewIds.slice((page - 1) * 30, page * 30).map((reviewIdx) => ({
      reviewIdx,
      username: '',
      profileImage: '',
      title: '',
      content: '',
      updatedAt: '',
    })),
    totalCount: reviewIds.length,
    paging: { currentPage: page, hasNext: page < 3, totalPage: 3 },
  }));

  const client = new QueryClient();
  try {
    const data = await client.fetchInfiniteQuery({
      ...createReviewInfiniteQueryOptions('qa-school'),
      pages: 4,
    });

    expect(data.pageParams).toEqual([1, 2, 3]);
    expect(data.pages.map((page) => page.reviews.length)).toEqual([30, 30, 1]);
    expect(data.pages.flatMap((page) => page.reviews.map((review) => review.reviewIdx))).toEqual(reviewIds);
  } finally {
    client.clear();
  }
});
