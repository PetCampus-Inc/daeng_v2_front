import { COMPANY_SLUG_PATHNAME } from '@shared/constants/pathname';

export const createPath = {
  /**
   * 회사 상세 페이지 경로를 생성합니다.
   * @param slug - 회사 슬러그
   * @returns /company/[slug] 형태의 경로
   */
  company: (slug: string) => COMPANY_SLUG_PATHNAME.replace('[slug]', slug),

  // 다른 동적 경로에 대한 헬퍼 함수들...
};

// 사용 예시
// import { createPath } from '@/shared/lib/path';
// const companyUrl = createPath.company('some-company-slug');
