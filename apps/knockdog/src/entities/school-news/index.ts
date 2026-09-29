export {
  deleteSchoolNews,
  deleteSchoolNewsDraft,
  getSchoolNews,
  getSchoolNewsDetail,
  getSchoolNewsDraft,
  getSchoolNewsReaders,
  postSchoolNews,
  postSchoolNewsImageUploadUrls,
  putSchoolNews,
  putSchoolNewsDraft,
} from './api/schoolNews';
export {
  SCHOOL_NEWS_READERS_QUERY_KEY,
  schoolNewsReadersQueryKey,
  useSchoolNewsReadersQuery,
} from './api/useSchoolNewsReadersQuery';
export {
  SCHOOL_NEWS_DETAIL_QUERY_KEY,
  schoolNewsDetailQueryKey,
  useSchoolNewsDetailQuery,
} from './api/useSchoolNewsDetailQuery';
export {
  SCHOOL_NEWS_DRAFT_QUERY_KEY,
  schoolNewsDraftQueryKey,
  useSchoolNewsDraftQuery,
} from './api/useSchoolNewsDraftQuery';
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
  toSchoolNewsDraft,
  toSchoolNewsItem,
  toSchoolNewsPage,
  toSchoolNewsReaders,
} from './model/schoolNews';
export type {
  SchoolNewsDraft,
  SchoolNewsImage,
  SchoolNewsImageRequest,
  SchoolNewsItem,
  SchoolNewsListDto,
  SchoolNewsPage,
  SchoolNewsReader,
  SchoolNewsReaders,
  SchoolNewsUploadFileRequest,
  SchoolNewsWriteRequest,
} from './model/schoolNews';
