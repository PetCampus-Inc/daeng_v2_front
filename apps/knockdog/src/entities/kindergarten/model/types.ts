/** 가공된 모델 인터페이스 */

import type { Kindergarten } from './kindergarten';
import type { KindergartenListItem as KindergartenListItemDto } from './search-list';

interface KindergartenListItem extends Omit<KindergartenListItemDto, 'dist'> {
  dist: string;
}

export interface KindergartenListItemWithMeta extends KindergartenListItem {
  dist: string; // 포맷된 거리
  memo?: {
    shopId: string;
    content: string;
    memoDate: string;
  };
  bookmarked?: boolean;
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

export interface KindergartenMain extends Omit<Kindergarten, 'dist'> {
  dist: string;
}
