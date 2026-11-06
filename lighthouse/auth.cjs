/**
 * Lighthouse CI 사전 인증.
 *
 * production 빌드에서는 NEXT_PUBLIC_ENABLE_GUEST_LOGIN=true 가 금지되므로
 * 게스트 로그인 UI 클릭 대신 DEV 로그인 API를 호출해 세션을 주입한다.
 *
 * - ACCESS_TOKEN → localStorage
 * - USER → zustand persist(localStorage)
 * - refresh cookie → credentials: 'include' (API 도메인)
 *
 * @param {import('puppeteer').Browser} browser
 */
module.exports = async (browser) => {
  const baseUrl = process.env.LHCI_BASE_URL ?? 'http://localhost:3000';
  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.knockdog.net').replace(/\/$/, '');
  // apps/knockdog/src/shared/api/endpoint/auth.ts 와 동일
  const DEV_LOGIN_ID = 113;

  const page = await browser.newPage();

  try {
    await page.goto(baseUrl, {
      waitUntil: 'networkidle2',
      timeout: 60_000,
    });

    const alreadyAuthed = await page.evaluate(() => {
      return Boolean(localStorage.getItem('ACCESS_TOKEN') || localStorage.getItem('USER'));
    });

    if (alreadyAuthed) {
      await page.evaluate(() => {
        localStorage.setItem('DEVICE_PERMISSION_INTRO_SEEN', 'true');
      });
      return;
    }

    const loginResult = await page.evaluate(
      async ({ apiBaseUrl: apiBase, devLoginId }) => {
        const response = await fetch(`${apiBase}/api/v0/auth/dev/${devLoginId}`, {
          method: 'GET',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });

        const authorization = response.headers.get('authorization');
        const body = await response.json().catch(() => null);

        return {
          ok: response.ok,
          status: response.status,
          authorization,
          body,
        };
      },
      { apiBaseUrl, devLoginId: DEV_LOGIN_ID }
    );

    if (!loginResult.ok) {
      throw new Error(
        `DEV 로그인 실패: status=${loginResult.status} body=${JSON.stringify(loginResult.body)}`
      );
    }

    const accessToken = loginResult.authorization?.replace(/^Bearer\s+/i, '') ?? null;
    const user = loginResult.body?.data ?? null;

    if (!accessToken) {
      throw new Error('DEV 로그인 응답에 Authorization 토큰이 없습니다.');
    }
    if (!user) {
      throw new Error('DEV 로그인 응답에 user data가 없습니다.');
    }

    await page.evaluate(
      ({ accessToken: token, user: userData }) => {
        localStorage.setItem('ACCESS_TOKEN', token);
        // zustand persist 포맷
        localStorage.setItem('USER', JSON.stringify({ state: { user: userData }, version: 0 }));
        localStorage.setItem('DEVICE_PERMISSION_INTRO_SEEN', 'true');
      },
      { accessToken, user }
    );

    const injected = await page.evaluate(() => Boolean(localStorage.getItem('ACCESS_TOKEN')));
    if (!injected) {
      throw new Error('ACCESS_TOKEN localStorage 주입에 실패했습니다.');
    }
  } finally {
    await page.close();
  }
};
