import { expect, test } from '../fixtures/test';
import { expectGuardianNav, expectOwnerNav, gotoAuthed } from '../helpers/nav';

test.describe('CF-MYPAGE-TOGGLE', () => {
  test('마이에서 보호자↔원장 뷰 전환 시 바텀탭이 바뀐다', async ({ page }) => {
    // owner storageState 기준 시작
    await gotoAuthed(page, '/mypage');
    await expectOwnerNav(page);

    const toggle = page.getByTestId('mypage-role-toggle');
    await expect(toggle).toBeVisible({ timeout: 30_000 });
    await expect(toggle).toContainText('보호자로 전환');

    await toggle.click();
    await expectGuardianNav(page);
    await expect(page.getByTestId('bottom-nav-compare')).toBeVisible();
    await expect(toggle).toContainText('원장으로 전환');

    await toggle.click();
    await expectOwnerNav(page);
    await expect(page.getByTestId('bottom-nav-owner')).toBeVisible();
    await expect(toggle).toContainText('보호자로 전환');
  });
});
