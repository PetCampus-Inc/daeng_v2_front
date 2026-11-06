import { expect, type Page } from '@playwright/test';

async function expectNotLoginRedirect(page: Page) {
  await expect(page).not.toHaveURL(/\/auth\/login/);
}

async function expectOwnerNav(page: Page) {
  await expect(page.getByTestId('bottom-nav')).toHaveAttribute('data-nav-mode', 'owner', {
    timeout: 30_000,
  });
}

async function expectGuardianNav(page: Page) {
  await expect(page.getByTestId('bottom-nav')).toHaveAttribute('data-nav-mode', 'guardian', {
    timeout: 30_000,
  });
}

async function gotoAuthed(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await expectNotLoginRedirect(page);
}

export { expectNotLoginRedirect, expectOwnerNav, expectGuardianNav, gotoAuthed };
