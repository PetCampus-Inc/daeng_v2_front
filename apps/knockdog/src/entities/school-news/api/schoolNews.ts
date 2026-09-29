import {
  SCHOOL_NEWS_PAGE_SIZE,
  type SchoolNewsCreatedDto,
  type SchoolNewsListDto,
  type SchoolNewsUploadFileRequest,
  type SchoolNewsUploadUrlResponseDto,
  type SchoolNewsWriteRequest,
} from '../model/schoolNews';

import { api, type ApiResponse } from '@shared/api';

interface GetSchoolNewsParams {
  schoolId: number;
  cursor?: number;
  size?: number;
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

export { getSchoolNews, postSchoolNews, postSchoolNewsImageUploadUrls };
