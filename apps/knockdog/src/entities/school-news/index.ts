export {
  deleteSchoolNews,
  getSchoolNews,
  postSchoolNews,
  postSchoolNewsImageUploadUrls,
  putSchoolNews,
} from './api/schoolNews';
export {
  SCHOOL_NEWS_QUERY_KEY,
  schoolNewsQueryKey,
  useDeleteSchoolNews,
  useRemoveSchoolNewsItem,
  useSchoolNewsInfiniteQuery,
  useSchoolNewsItem,
  useSchoolNewsSearchSource,
} from './api/useSchoolNewsInfiniteQuery';
export {
  parseSchoolId,
  SCHOOL_NEWS_MAX_PAGES,
  SCHOOL_NEWS_PAGE_SIZE,
  toCreatedNewsId,
  toSchoolNewsPage,
} from './model/schoolNews';
export type {
  SchoolNewsImage,
  SchoolNewsImageRequest,
  SchoolNewsItem,
  SchoolNewsListDto,
  SchoolNewsPage,
  SchoolNewsUploadFileRequest,
  SchoolNewsWriteRequest,
} from './model/schoolNews';
