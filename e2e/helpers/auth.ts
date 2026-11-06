import type { Page } from '@playwright/test';

import { getE2eEnv } from './env';

interface DevLoginUser {
  userId?: string;
  nickname?: string;
  infoRcvEmail?: string;
  loginEmail?: string;
  [key: string]: unknown;
}

interface DevLoginBody {
  data?: DevLoginUser;
}

async function injectDevLogin(page: Page) {
  const { baseURL, apiBaseURL, devLoginId } = getE2eEnv();

  // DEV API 직접 호출 (CORS 없음). CI `next start`에도 프록시 불필요.
  const response = await page.context().request.get(`${apiBaseURL}/api/v0/auth/dev/${devLoginId}`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok()) {
    const text = await response.text().catch(() => '');
    throw new Error(`DEV 로그인 실패: status=${response.status()} body=${text}`);
  }

  const authorization = response.headers()['authorization'] ?? response.headers()['Authorization'];
  const body = (await response.json()) as DevLoginBody;
  const accessToken = authorization?.replace(/^Bearer\s+/i, '') ?? null;
  const user = body?.data ?? null;

  if (!accessToken) throw new Error('DEV 로그인 응답에 Authorization 토큰이 없습니다.');
  if (!user) throw new Error('DEV 로그인 응답에 user data가 없습니다.');

  await page.addInitScript(
    ({ token, userData }) => {
      localStorage.setItem('ACCESS_TOKEN', token);
      localStorage.setItem('USER', JSON.stringify({ state: { user: userData }, version: 0 }));
      localStorage.setItem('DEVICE_PERMISSION_INTRO_SEEN', 'true');
    },
    { token: accessToken, userData: user }
  );

  await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
  await assertSessionOnPage(page);

  return user;
}

/** 원장/보호자 뷰 — `MYPAGE_ROLE_VIEW` */
async function setPrefersGuardianView(page: Page, prefersGuardianView: boolean) {
  await page.evaluate((value) => {
    localStorage.setItem('MYPAGE_ROLE_VIEW', JSON.stringify({ state: { prefersGuardianView: value }, version: 0 }));
  }, prefersGuardianView);

  // persist 반영 + SyncNativeMainTabModeEffect 재계산
  await page.reload({ waitUntil: 'domcontentloaded' });
}

async function assertSessionOnPage(page: Page) {
  const hasToken = await page.evaluate(() => Boolean(localStorage.getItem('ACCESS_TOKEN')));
  if (!hasToken) throw new Error('ACCESS_TOKEN 이 localStorage에 없습니다.');
}

export { injectDevLogin, setPrefersGuardianView, assertSessionOnPage };
export type { DevLoginUser };
