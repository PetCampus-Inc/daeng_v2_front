import { expect, test } from '@playwright/test';

/**
 * Phase 1 — storageState 재사용 검증 (CF-OWNER-HOME 최소)
 */
test.describe('owner storageState reuse', () => {
  test('owner.json 으로 /owner 진입 시 로그인으로 튕기지 않는다', async ({ page }) => {
    await page.goto('/owner');

    await expect(page).not.toHaveURL(/\/auth\/login/);
    await expect(page.getByTestId('bottom-nav')).toHaveAttribute('data-nav-mode', 'owner');
    await expect(page.getByTestId('bottom-nav-owner')).toBeVisible();
    await expect(page.getByTestId('bottom-nav-owner-daily')).toBeVisible();
    await expect(page.getByTestId('bottom-nav-mypage')).toBeVisible();
  });
});
