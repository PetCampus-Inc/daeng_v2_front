import { expect, test } from '../fixtures/test';

/**
 * GA가 E2E에서 네트워크로 나가지 않는지 가드.
 * collect / gtag.js abort + ga-disable init 이 동작해야 한다.
 */
test.describe('analytics block', () => {
  test('ga-disable 설정되고 GA collect 성공 응답이 없다', async ({ page }) => {
    const gaSuccessUrls: string[] = [];

    page.on('response', (response) => {
      if (!response.ok()) return;
      const url = response.url();
      if (
        url.includes('google-analytics.com') ||
        url.includes('analytics.google.com') ||
        url.includes('googletagmanager.com/gtag/js') ||
        url.includes('googletagmanager.com/gtag/destination')
      ) {
        gaSuccessUrls.push(url);
      }
    });

    await page.goto('/auth/login', { waitUntil: 'load' });

    const disabled = await page.evaluate(() => {
      return Boolean((window as unknown as Record<string, boolean>)['ga-disable-G-3XK1LPFE9J']);
    });
    expect(disabled).toBe(true);

    await page.evaluate(() => {
      const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
      gtag?.('event', 'e2e_should_not_send', { debug_mode: true });
      gtag?.('config', 'G-3XK1LPFE9J');
    });

    // lazyOnload gtag 시도 시간 — 성공 응답이 쌓이지 않아야 함
    await expect.poll(() => gaSuccessUrls.length, { timeout: 3_000 }).toBe(0);
  });
});
