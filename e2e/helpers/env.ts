/** E2E 환경 변수. CI/로컬 공통 기본값. */

const DEFAULT_BASE_URL = 'http://localhost:3000';
/** 로컬 기본값은 개발 서버. CI는 e2e.yml에서 운영 서버(api.knockdog.net)와 계정을 직접 지정한다. */
const DEFAULT_API_BASE_URL = 'https://dev-api.knockdog.net';
/** 개발 서버의 테스트 계정. 7번도 쓸 수 있다. (운영 서버 api.knockdog.net의 테스트 계정은 69, 113) */
const DEFAULT_DEV_LOGIN_ID = 6; // 또는 7
const DEFAULT_EXPECTED_EMAIL = 'hyeonsu-k@kakao.com';

function getE2eEnv() {
  return {
    baseURL: process.env.E2E_BASE_URL ?? process.env.PLAYWRIGHT_BASE_URL ?? DEFAULT_BASE_URL,
    apiBaseURL: (process.env.E2E_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(
      /\/$/,
      ''
    ),
    devLoginId: Number(process.env.E2E_DEV_LOGIN_ID ?? DEFAULT_DEV_LOGIN_ID),
    expectedEmail: process.env.E2E_EXPECTED_EMAIL ?? DEFAULT_EXPECTED_EMAIL,
    isCI: Boolean(process.env.CI),
  };
}

export { getE2eEnv };
