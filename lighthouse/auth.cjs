/**
 * Lighthouse CI 사전 인증.
 *
 * - ACCESS_TOKEN → localStorage (API Authorization 응답 헤더)
 * - USER → zustand persist(localStorage)
 * - refresh → httpOnly cookie (credentials: 'include', API 도메인)
 *
 * DEV에서만 노출되는 게스트로 둘러보기로 로그인한다.
 * (NEXT_PUBLIC_ENABLE_GUEST_LOGIN=true 필요)
 *
 * @param {import('puppeteer').Browser} browser
 */
module.exports = async (browser) => {
  const baseUrl = process.env.LHCI_BASE_URL ?? 'http://localhost:3000';
  const page = await browser.newPage();

  try {
    await page.goto(`${baseUrl}/auth/login`, {
      waitUntil: 'networkidle2',
      timeout: 60_000,
    });

    // 로그인 직후 /auth/device-permission 으로 튕기지 않도록 선반영 (TypedStorage JSON)
    await page.evaluate(() => {
      localStorage.setItem('DEVICE_PERMISSION_INTRO_SEEN', 'true');
    });

    const alreadyAuthed = await page.evaluate(() => {
      return Boolean(localStorage.getItem('ACCESS_TOKEN') || localStorage.getItem('USER'));
    });

    if (alreadyAuthed) {
      return;
    }

    await page.waitForFunction(
      () =>
        Array.from(document.querySelectorAll('button')).some((button) =>
          (button.textContent ?? '').includes('게스트로 둘러보기')
        ),
      { timeout: 30_000 }
    );

    await page.evaluate(() => {
      const button = Array.from(document.querySelectorAll('button')).find((candidate) =>
        (candidate.textContent ?? '').includes('게스트로 둘러보기')
      );
      if (!button) throw new Error('게스트 로그인 버튼을 찾지 못했습니다.');
      button.click();
    });

    await page.waitForFunction(() => Boolean(localStorage.getItem('ACCESS_TOKEN')), {
      timeout: 60_000,
    });
  } finally {
    await page.close();
  }
};
