import { expect, test } from '../fixtures/test';
import { expectGuardianNav, gotoAuthed } from '../helpers/nav';

test.describe('CF-GUARDIAN-HOME', () => {
  test('보호자 유치원 진입 및 바텀탭 노출', async ({ page }) => {
    await gotoAuthed(page, '/compare');
    await expectGuardianNav(page);

    await expect(page.getByTestId('bottom-nav-home')).toBeVisible();
    await expect(page.getByTestId('bottom-nav-save')).toBeVisible();
    await expect(page.getByTestId('bottom-nav-compare')).toBeVisible();
    await expect(page.getByTestId('bottom-nav-mypage')).toBeVisible();

    // 로그인 리다이렉트/원장 가드 없이 보호자 모드 유지
    await expect(page).toHaveURL(/\/compare/);
  });
});
