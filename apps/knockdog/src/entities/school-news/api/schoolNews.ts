import {
  SCHOOL_NEWS_PAGE_SIZE,
  type SchoolNewsCreatedDto,
  type SchoolNewsDraftDto,
  type SchoolNewsItemDto,
  type SchoolNewsListDto,
  type SchoolNewsReadersDto,
  type SchoolNewsUploadFileRequest,
  type SchoolNewsUploadUrlResponseDto,
  type SchoolNewsWriteRequest,
} from '../model/schoolNews';

import { api, ApiError, type ApiResponse } from '@shared/api';

interface GetSchoolNewsParams {
  schoolId: number;
  cursor?: number;
  size?: number;
}

interface GetSchoolNewsSearchParams extends GetSchoolNewsParams {
  keyword: string;
}

/** `GET` - 유치원 메인 소식 미리보기 */
function getSchoolNewsPreview(schoolId: number) {
  return api.get(`schools/${schoolId}/news/preview`).json<ApiResponse<SchoolNewsListDto>>();
}

/** `GET` - 유치원 소식 목록*/
function getSchoolNews({ schoolId, cursor, size = SCHOOL_NEWS_PAGE_SIZE }: GetSchoolNewsParams) {
  return api
    .get(`schools/${schoolId}/news`, {
      searchParams: {
        size,
        ...(cursor === undefined ? {} : { cursor }),
      },
    })
    .json<ApiResponse<SchoolNewsListDto>>();
}

/** `GET` - 유치원 소식 제목·본문 검색 */
function getSchoolNewsSearch({
  schoolId,
  keyword,
  cursor,
  size = SCHOOL_NEWS_PAGE_SIZE,
}: GetSchoolNewsSearchParams) {
  return api
    .get(`schools/${schoolId}/news/search`, {
      searchParams: {
        keyword,
        size,
        ...(cursor === undefined ? {} : { cursor }),
      },
    })
    .json<ApiResponse<SchoolNewsListDto>>();
}

interface PostSchoolNewsParams {
  schoolId: number;
  idempotencyKey: string;
  body: SchoolNewsWriteRequest;
}

/** `POST` - 소식 이미지 업로드 URL 발급 */
function postSchoolNewsImageUploadUrls(schoolId: number, files: SchoolNewsUploadFileRequest[]) {
  return api
    .post(`schools/${schoolId}/news/images/upload-urls`, {
      json: { files },
    })
    .json<ApiResponse<SchoolNewsUploadUrlResponseDto>>();
}

interface PutSchoolNewsParams extends PostSchoolNewsParams {
  newsId: number;
}

/** `POST` - 유치원 소식 등록. 같은 Idempotency-Key 재시도는 최초 성공 응답 */
function postSchoolNews({ schoolId, idempotencyKey, body }: PostSchoolNewsParams) {
  return api
    .post(`schools/${schoolId}/news`, {
      json: body,
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    })
    .json<ApiResponse<SchoolNewsCreatedDto>>();
}

/** `PUT` - 유치원 소식 수정. 같은 Idempotency-Key 재시도는 최초 성공 응답 */
function putSchoolNews({ schoolId, newsId, idempotencyKey, body }: PutSchoolNewsParams) {
  return api
    .put(`schools/${schoolId}/news/${newsId}`, {
      json: body,
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    })
    .json<ApiResponse<SchoolNewsCreatedDto>>();
}

/** `GET` - 유치원 소식 상세. 보호자가 조회하면 읽음 처리됨. 없으면 null */
async function getSchoolNewsDetail({ schoolId, newsId }: { schoolId: number; newsId: number }) {
  try {
    return await api
      .get(`schools/${schoolId}/news/${newsId}`)
      .json<ApiResponse<SchoolNewsItemDto | null>>();
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return {
        status: 404,
        code: 'NOT_FOUND',
        message: '',
        data: null,
      } satisfies ApiResponse<SchoolNewsItemDto | null>;
    }

    throw error;
  }
}

/** `GET` - 원장용 소식 읽은 보호자 목록 */
function getSchoolNewsReaders({ schoolId, newsId }: { schoolId: number; newsId: number }) {
  return api
    .get(`schools/${schoolId}/news/${newsId}/readers`)
    .json<ApiResponse<SchoolNewsReadersDto>>();
}

/** `DELETE` - 유치원 소식 삭제 */
function deleteSchoolNews({ schoolId, newsId }: { schoolId: number; newsId: number }) {
  return api.delete(`schools/${schoolId}/news/${newsId}`).json<ApiResponse<null>>();
}

/** `PUT` - 소식 임시저장 */
function putSchoolNewsDraft({ schoolId, body }: { schoolId: number; body: SchoolNewsWriteRequest }) {
  return api.put(`schools/${schoolId}/news/draft`, { json: body }).json<ApiResponse<null>>();
}

/** `DELETE` - 소식 임시저장 삭제, 초안이 없으면 무시 */
async function deleteSchoolNewsDraft(schoolId: number) {
  try {
    return await api.delete(`schools/${schoolId}/news/draft`).json<ApiResponse<null>>();
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** `GET` - 소식 임시저장 조회, 저장된 초안이 없으면 null */
async function getSchoolNewsDraft(schoolId: number) {
  try {
    return await api.get(`schools/${schoolId}/news/draft`).json<ApiResponse<SchoolNewsDraftDto | null>>();
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return {
        status: 404,
        code: 'NOT_FOUND',
        message: '',
        data: null,
      } satisfies ApiResponse<SchoolNewsDraftDto | null>;
    }

    throw error;
  }
}

export {
  deleteSchoolNews,
  deleteSchoolNewsDraft,
  getSchoolNews,
  getSchoolNewsSearch,
  getSchoolNewsDetail,
  getSchoolNewsPreview,
  getSchoolNewsDraft,
  getSchoolNewsReaders,
  postSchoolNews,
  postSchoolNewsImageUploadUrls,
  putSchoolNews,
  putSchoolNewsDraft,
};
