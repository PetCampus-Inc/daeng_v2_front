import { expect, test as setup } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

import { injectDevLogin, setPrefersGuardianView } from './helpers/auth';
import { getE2eEnv } from './helpers/env';
import { GUARDIAN_STORAGE, OWNER_STORAGE } from './helpers/paths';

setup.describe.configure({ mode: 'serial' });

setup('CF-AUTH: DEV login → owner / guardian storageState', async ({ browser }) => {
  const { expectedEmail, devLoginId } = getE2eEnv();
  fs.mkdirSync(path.dirname(OWNER_STORAGE), { recursive: true });

  // ── owner ──────────────────────────────────────
  const ownerContext = await browser.newContext();
  const ownerPage = await ownerContext.newPage();

  const user = await injectDevLogin(ownerPage);

  const emailCandidate = [user.infoRcvEmail, user.loginEmail].filter(Boolean).join(' ');
  if (emailCandidate && expectedEmail && !emailCandidate.includes(expectedEmail)) {
    console.warn(
      `[e2e] DEV_LOGIN_ID=${devLoginId} 응답 이메일이 기대값과 다를 수 있음. expected=${expectedEmail} got=${emailCandidate}`
    );
  }

  await setPrefersGuardianView(ownerPage, false);
  await ownerPage.goto('/owner', { waitUntil: 'domcontentloaded' });
  await expect(ownerPage).not.toHaveURL(/\/auth\/login/);
  await expect(ownerPage.getByTestId('bottom-nav')).toHaveAttribute('data-nav-mode', 'owner', {
    timeout: 30_000,
  });

  await ownerContext.storageState({ path: OWNER_STORAGE });
  await ownerContext.close();

  // ── guardian ───────────────────────────────────
  const guardianContext = await browser.newContext();
  const guardianPage = await guardianContext.newPage();

  await injectDevLogin(guardianPage);
  await setPrefersGuardianView(guardianPage, true);
  await guardianPage.goto('/compare', { waitUntil: 'domcontentloaded' });
  await expect(guardianPage).not.toHaveURL(/\/auth\/login/);
  await expect(guardianPage.getByTestId('bottom-nav')).toHaveAttribute('data-nav-mode', 'guardian', {
    timeout: 30_000,
  });

  await guardianContext.storageState({ path: GUARDIAN_STORAGE });
  await guardianContext.close();
});
