import { expect, test } from '../fixtures/test';
import { gotoAuthed } from '../helpers/nav';

test.describe('CF-GUARDIAN-ALBUM', () => {
  test('월별 앨범 목록 노출 후 상세 진입', async ({ page }) => {
    await gotoAuthed(page, '/compare/album');
    // stack 페이지 — 바텀내비 없을 수 있음. 세션만 확인
    await expect(page).not.toHaveURL(/\/auth\/login/);

    await expect(page.getByTestId('guardian-album-root')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('guardian-album-month-nav')).toBeVisible();
    await expect(page.getByTestId('guardian-album-month-label')).toBeVisible();

    const empty = page.getByText('아직 등록된 앨범이 없어요');
    const monthEmpty = page.getByText('이 달에는 등록된 앨범이 없어요');
    const dayCard = page.getByTestId('guardian-album-day-card').first();

    await expect(dayCard.or(empty).or(monthEmpty)).toBeVisible({ timeout: 30_000 });

    if (await empty.isVisible().catch(() => false)) {
      throw new Error('Precondition 실패: 앨범 데이터 없음 (PHASE0 섹션5)');
    }
    if (await monthEmpty.isVisible().catch(() => false)) {
      const prev = page.getByRole('button', { name: '이전 달' });
      if (await prev.isEnabled().catch(() => false)) {
        await prev.click();
        await expect(dayCard).toBeVisible({ timeout: 20_000 });
      } else {
        throw new Error('Precondition 실패: 조회 가능한 월별 앨범 없음');
      }
    }

    await dayCard.click();
    await expect(page.getByTestId('guardian-album-detail')).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(/\/compare\/album/);
  });
});
