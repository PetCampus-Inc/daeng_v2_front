export { getSchoolNews } from './api/schoolNews';
export {
  SCHOOL_NEWS_QUERY_KEY,
  schoolNewsQueryKey,
  useRemoveSchoolNewsItem,
  useSchoolNewsInfiniteQuery,
  useSchoolNewsItem,
  useSchoolNewsSearchSource,
} from './api/useSchoolNewsInfiniteQuery';
export {
  parseSchoolId,
  SCHOOL_NEWS_MAX_PAGES,
  SCHOOL_NEWS_PAGE_SIZE,
  toSchoolNewsPage,
} from './model/schoolNews';
export type { SchoolNewsItem, SchoolNewsListDto, SchoolNewsPage } from './model/schoolNews';
