import type { Kindergarten } from './kindergarten';
import type { MemoItem } from '@entities/memo';
import type { BookmarkItem } from '@entities/bookmark';
import { formatDistance } from '@shared/lib';
import type { KindergartenListItemDto, KindergartenSearchListDto } from './search-list';
import type { KindergartenListItem, KindergartenMain } from './types';
import { CTG } from '../config/enum';

type KindergartenBookmark = Pick<BookmarkItem, 'id'> & { shopId?: string };

function toKindergartenListItem(
  item: KindergartenListItemDto,
  memoByShopId: Map<string, MemoItem>,
  bookmarkedSet: Set<string>
): KindergartenListItem {
  const { dist, ctg, ...rest } = item;
  const memo = memoByShopId.get(item.id);
  const bookmarked = bookmarkedSet.has(item.id);
  return {
    ...rest,
    ctg: ctg
      .split(',')
      .map((tag) => CTG[tag.trim() as keyof typeof CTG] || tag.trim())
      .join(' ・ '),
    dist: formatDistance(dist, { unit: 'kilometer' }),
    memo: memo ? formatMemoDate(memo) : undefined,
    bookmarked,
  };
}

/**
 * KindergartenSearchList DTO를 도메인 모델로 가공하는 함수
 * - dist: 거리를 포맷팅한 문자열로 변환
 * - bookmarked: 북마크 여부 결합
 * - memo: 메모 내용 결합
 */
export function toKindergartenList({
  item,
  bookmark,
  memo,
}: {
  item: KindergartenSearchListDto;
  bookmark: KindergartenBookmark[];
  memo: MemoItem[];
}) {
  const memoByShopId = new Map(memo.map((m) => [String(m.shopId), m]));
  const bookmarkedSet = new Set(bookmark.map((b) => b.shopId ?? b.id).filter(Boolean) as string[]);

  const list = item.schoolResult.list.map((item) => toKindergartenListItem(item, memoByShopId, bookmarkedSet));
  const exact = item.schoolResult.exact
    ? toKindergartenListItem(item.schoolResult.exact, memoByShopId, bookmarkedSet)
    : null;

  return {
    paging: item.paging,
    schoolResult: {
      ...item.schoolResult,
      exact,
      list,
    },
  };
}

/**
 * Kindergarten DTO를 도메인 모델로 가공하는 함수
 * - dist: 거리를 포맷팅한 문자열로 변환
 * - bookmarked: 북마크 여부 결합
 * - memo: 메모 내용 결합
 */
export function toKindergartenMain({
  item,
  bookmark,
  memo,
}: {
  item: Kindergarten;
  memo: MemoItem[];
  bookmark: KindergartenBookmark[];
}): KindergartenMain {
  const memoByShopId = new Map(memo.map((m) => [String(m.shopId), m]));
  const bookmarkedSet = new Set(bookmark.map((b) => b.shopId ?? b.id).filter(Boolean) as string[]);

  return {
    ...item,
    ctg: item.ctg
      .split(',')
      .map((tag) => CTG[tag.trim() as keyof typeof CTG] || tag.trim())
      .join(' ・ '),
    dist: formatDistance(item.dist, { unit: 'kilometer' }),
    memo: memoByShopId.get(item.id) ? formatMemoDate(memoByShopId.get(item.id)!) : undefined,
    bookmarked: bookmarkedSet.has(item.id),
  };
}

/**
 * YYYY-MM-DD to YYYY.MM.DD
 */
function formatMemoDate(memo: MemoItem): MemoItem {
  return {
    ...memo,
    memoDate: memo.memoDate.replace(/-/g, '.'),
  };
}
