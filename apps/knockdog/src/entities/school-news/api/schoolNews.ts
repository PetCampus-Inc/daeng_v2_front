import { SCHOOL_NEWS_PAGE_SIZE, type SchoolNewsListDto } from '../model/schoolNews';

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

export { getSchoolNews };
