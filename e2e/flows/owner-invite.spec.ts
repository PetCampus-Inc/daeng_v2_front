import { expect, test } from '../fixtures/test';
import { expectOwnerNav, gotoAuthed } from '../helpers/nav';

test.describe('CF-OWNER-INVITE', () => {
  test('보호자 초대 시트가 열리고 링크/QR 영역이 노출된다', async ({ page }) => {
    await gotoAuthed(page, '/owner/members');
    await expectOwnerNav(page);

    const fab = page.getByTestId('owner-members-invite-fab');
    await fab.scrollIntoViewIfNeeded();
    await expect(fab).toBeVisible();
    await fab.click();

    await expect(page.getByTestId('owner-members-invite-sheet')).toBeVisible();

    const copyLink = page.getByTestId('owner-invite-copy-link');
    await expect(copyLink).toBeEnabled({ timeout: 20_000 });

    // QR 또는 에러 문구 중 하나 — 링크가 enable이면 QR도 로드된 상태
    await expect(page.getByTestId('owner-invite-qr').or(page.getByText('초대 링크를 불러오지 못했어요.'))).toBeVisible();
    await expect(page.getByTestId('owner-invite-qr')).toBeVisible();
  });
});
