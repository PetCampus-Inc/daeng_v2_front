import { expect, test } from '../fixtures/test';
import { expectOwnerNav, gotoAuthed } from '../helpers/nav';

test.describe('CF-OWNER-DAILY', () => {
  test('일과 화면에 두 탭이 보이고 두 번째 탭을 누르면 선택 상태가 된다', async ({ page }) => {
    await gotoAuthed(page, '/owner/daily');
    await expectOwnerNav(page);

    await expect(page.getByTestId('owner-daily-root')).toBeVisible();
    await expect(page.getByTestId('owner-daily-tab-attendance-check')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('owner-daily-tab-today-attendance')).toBeVisible();
    await expect(page.getByTestId('owner-daily-tab-attendance-check')).toHaveAttribute('data-state', 'active');

    await page.getByTestId('owner-daily-tab-today-attendance').click();
    await expect(page.getByTestId('owner-daily-tab-today-attendance')).toHaveAttribute('data-state', 'active');
  });
});
