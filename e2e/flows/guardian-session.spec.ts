import { expect, test } from '@playwright/test';

/**
 * Phase 1 — storageState 재사용 검증 (CF-GUARDIAN-HOME 최소)
 */
test.describe('guardian storageState reuse', () => {
  test('guardian.json 으로 /compare 진입 시 로그인으로 튕기지 않는다', async ({ page }) => {
    await page.goto('/compare');

    await expect(page).not.toHaveURL(/\/auth\/login/);
    await expect(page.getByTestId('bottom-nav')).toHaveAttribute('data-nav-mode', 'guardian');
    await expect(page.getByTestId('bottom-nav-compare')).toBeVisible();
    await expect(page.getByTestId('bottom-nav-home')).toBeVisible();
    await expect(page.getByTestId('bottom-nav-mypage')).toBeVisible();
  });
});
