import { expect, test } from '../fixtures/test';
import { expectOwnerNav, gotoAuthed } from '../helpers/nav';

test.describe('CF-OWNER-DAILY', () => {
  test('일과 화면에서 등원 처리 / 오늘 등원 탭 노출', async ({ page }) => {
    // 탭 persist flake 방지 — URL에 tab 명시
    await gotoAuthed(page, '/owner/daily?tab=attendance-check');
    await expectOwnerNav(page);

    await expect(page.getByTestId('owner-daily-root')).toBeVisible();
    await expect(page.getByTestId('owner-daily-tab-attendance-check')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('owner-daily-tab-today-attendance')).toBeVisible();

    await page.getByTestId('owner-daily-tab-today-attendance').click();
    await expect(page.getByTestId('owner-daily-tab-today-attendance')).toHaveAttribute('data-state', 'active');
  });
});
