/** E2E 환경 변수. CI/로컬 공통 기본값. */

const DEFAULT_BASE_URL = 'http://localhost:3000';
const DEFAULT_API_BASE_URL = 'https://api.knockdog.net';
/** LHCI / guest login 과 동일. hyeonsu-k@kakao.com 매핑이면 유지. */
const DEFAULT_DEV_LOGIN_ID = 113;
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
