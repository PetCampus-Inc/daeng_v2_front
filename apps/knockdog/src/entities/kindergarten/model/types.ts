import type { Kindergarten } from './kindergarten';
import type { KindergartenListItemDto } from './search-list';

/**
 * KindergartenListItem
 * @typedef {KindergartenListItemDto} DTO를 확장한 모델
 */
export interface KindergartenListItem extends Omit<KindergartenListItemDto, 'dist'> {
  dist: string; // 포맷된 거리
  memo?: {
    shopId: string;
    content: string;
    memoDate: string;
  };
  bookmarked?: boolean;
}

export interface KindergartenList {
  paging: {
    currentPage: number;
    hasNext: boolean;
    totalPage: number;
  };
  schoolResult: {
    totalCount: number;
    exactCount: number | null;
    nearbyCount: number | null;
    exact: KindergartenListItem | null;
    list: KindergartenListItem[];
  };
}

/**
 * KindergartenMain
 * @typedef {Kindergarten} DTO를 확장한 모델
 */
export interface KindergartenMain extends Omit<Kindergarten, 'dist' | 'memoDate'> {
  dist: string; // 포맷된 거리
  memo?: {
    shopId: string;
    content: string;
    memoDate: string;
  };
  bookmarked: boolean;
}
