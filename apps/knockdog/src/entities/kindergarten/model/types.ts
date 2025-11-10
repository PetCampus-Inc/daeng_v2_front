/** 가공된 모델 인터페이스 */

import type { KindergartenListItem as KindergartenListItemDto } from './kindergarten';

export interface KindergartenListItem extends Omit<KindergartenListItemDto, 'dist'> {
  dist: string;
}

export interface KindergartenListItemWithMeta extends KindergartenListItem {
  dist: string; // 포맷된 거리
  memo?: {
    id: string;
    shopId: string;
    content: string;
    updatedAt: string;
  };
  isBookmarked?: boolean;
}

export interface KindergartenListWithMeta {
  paging: {
    currentPage: number;
    hasNext: boolean;
    totalPage: number;
  };
  schoolResult: {
    totalCount: number;
    exactCount: number | null;
    nearbyCount: number | null;
    exact: KindergartenListItemWithMeta | null;
    list: KindergartenListItemWithMeta[];
  };
}
