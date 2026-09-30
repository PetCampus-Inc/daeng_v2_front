import { expect, test } from '../fixtures/test';
import { expectOwnerNav, gotoAuthed } from '../helpers/nav';

test.describe('CF-OWNER-HOME', () => {
  test('원장 홈 진입 및 바텀탭 노출', async ({ page }) => {
    await gotoAuthed(page, '/owner');
    await expectOwnerNav(page);

    await expect(page.getByTestId('owner-home-root')).toBeVisible();
    await expect(page.getByTestId('owner-home-school-name')).toBeVisible();

    await expect(page.getByTestId('bottom-nav-owner')).toBeVisible();
    await expect(page.getByTestId('bottom-nav-owner-daily')).toBeVisible();
    await expect(page.getByTestId('bottom-nav-owner-album')).toBeVisible();
    await expect(page.getByTestId('bottom-nav-owner-members')).toBeVisible();
    await expect(page.getByTestId('bottom-nav-mypage')).toBeVisible();
  });
});
