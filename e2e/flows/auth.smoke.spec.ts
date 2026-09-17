import { expect, test } from '../fixtures/test';

/**
 * CF-AUTH (UI smoke) — 비로그인. storageState 없음.
 * 실제 세션 주입/재사용은 auth.setup + owner/guardian specs.
 */
test.describe('CF-AUTH login UI smoke', () => {
  test('로그인 페이지에 소셜 로그인 CTA가 노출된다', async ({ page }) => {
    await page.goto('/auth/login');

    await expect(page.getByTestId('login-provider-kakao')).toBeVisible();
    await expect(page.getByTestId('login-provider-google')).toBeVisible();
  });
});
